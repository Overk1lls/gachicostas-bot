import { InjectQueue } from '@nestjs/bull/dist/decorators';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import {
  ChannelType,
  Client,
  Collection,
  GatewayIntentBits,
  Message,
  Partials,
  TextBasedChannel,
  MessageCreateOptions,
  GuildTextBasedChannel,
} from 'discord.js';
import {
  AsyncInitializable,
  commands,
  discordEpoch,
  isRegexInText,
  isRegexMatched,
  MessageQueueProcessName,
  MessageQueueType,
  MESSAGE_QUEUE,
  orQuestionRegex,
  whoIsQuestionRegex,
} from './lib';

@Injectable()
export class AppService implements OnModuleInit, AsyncInitializable {
  private client: Client;
  private readonly logger = new Logger(AppService.name);

  constructor(
    private configService: ConfigService,
    @InjectQueue(MESSAGE_QUEUE) private messageQueue: Queue<MessageQueueType>
  ) {}

  async onModuleInit() {
    this.client = new Client({
      partials: [Partials.User, Partials.GuildMember, Partials.Message],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ],
      presence: {
        status: 'online',
      },
    });

    await this.init();
  }

  async init() {
    const token = this.configService.getOrThrow<string>('DISCORD_BOT_TEST');
    await this.client.login(token);

    this.client.on('ready', () =>
      this.logger.log(`${this.client.user.username} is ready to work!`)
    );

    this.client.on('messageCreate', async (message) => {
      try {
        const { author, channel, content } = message;

        if (author.bot || !channel.isTextBased()) {
          return;
        }

        if (
          channel.type === ChannelType.GuildText &&
          !channel.permissionsFor(this.client.user).has('SendMessages')
        ) {
          this.logger.warn(
            `I don't have a permission to send a message to this channel: ${channel.name}`
          );
          return;
        }

        const botRegex = new RegExp(this.client.user.username, 'i');
        const isBotMentioned =
          message.mentions.users.has(this.client.user.id) ||
          message.mentions.members.has(this.client.user.id);
        const isDhCommand = commands.find((c) => content.includes(c));

        if (isBotMentioned || isDhCommand) {
          await channel.sendTyping();
        }

        /**
         * If the message is a question about DH
         */
        if (isDhCommand) {
          await this.messageQueue.add(
            MessageQueueProcessName.Command,
            { command: isDhCommand, channel },
            { removeOnComplete: true }
          );
        } else if (isBotMentioned || isRegexMatched(botRegex, content)) {
          /**
           * Is the message a question?
           */
          if (content.endsWith('?')) {
            const isOrQuestion = isRegexInText(orQuestionRegex, content);
            const isWhoIsQuestion = isRegexInText(whoIsQuestionRegex, content);

            /**
             * If this is the 'or' question
             */
            if (isOrQuestion && !isWhoIsQuestion) {
              await this.messageQueue.add(
                MessageQueueProcessName.OrQuestion,
                {
                  channel,
                  botRegex,
                  question: content,
                },
                { removeOnComplete: true }
              );
            } else if (isWhoIsQuestion) {
              /**
               * If the message is the `Who's on the server ...` question
               */
              const members = await message.guild.members.fetch();
              const theChosen = getRandomArrayElement([...members.values()]);

              await this.messageQueue.add(
                MessageQueueProcessName.WhoQuestion,
                {
                  channelId: channel.id,
                  chosen: theChosen.user.toJSON() as User,
                },
                {
                  removeOnComplete: true,
                  removeOnFail: true,
                  timeout: 5000,
                }
              );
            } else {
              /**
               * If the message is a random question
               */
              await this.messageQueue.add(
                MessageQueueProcessName.RandomQuestion,
                { channel },
                { removeOnComplete: true }
              );
            }
          } else {
            /**
             * If a random message
             */
            await this.messageQueue.add(
              MessageQueueProcessName.TagMessage,
              {
                channel,
                isMentioned: isBotMentioned,
                message: content,
                botUsername: this.client.user.username,
              },
              { removeOnComplete: true }
            );
          }
        }
      } catch (error) {
        this.logger.error(error);
      }
    });
  }

  async reply(content: string | MessageCreateOptions, whereToReply: TextBasedChannel | string) {
    try {
      const channel = await this.getChannelById(
        typeof whereToReply === 'string' ? whereToReply : whereToReply.id
      );

      if (!channel) {
        this.logger.warn(`There is no channel with such id: ${whereToReply}`);
        return;
      }

      if (channel.isTextBased()) {
        const message = await channel.send(content);

        this.logger.log(`bot:message:sent ${channel.url}`);

        return message;
      }
    } catch (error) {
      this.logger.error(error.stack);
    }
  }

  async isMessagePresentInChannel(
    content: string,
    where: GuildTextBasedChannel | string,
    when?: Date | number
  ) {
    try {
      const channel = (await this.getChannelById(
        typeof where === 'string' ? where : where.id
      )) as GuildTextBasedChannel;

      if (!channel) {
        throw new Error(`There is no channel with such id: ${where}`);
      }

      let messages: Collection<string, Message<true>>;

      if (when) {
        const parseDate = when instanceof Date ? when.getTime() : when * 1000;
        const snowflake = (BigInt(parseDate) - BigInt(discordEpoch)) << 22n;

        messages = await channel.messages.fetch({
          around: snowflake.toString(),
        });
      } else {
        const todaySixAm = new Date().setUTCHours(6, 0);
        const todayNineAm = new Date().setUTCHours(9, 0);
        const sixAmSnowflake = (BigInt(todaySixAm) - BigInt(discordEpoch)) << 22n;
        const nineAmSnowflake = (BigInt(todayNineAm) - BigInt(1420070400000)) << 22n;

        messages = await channel.messages.fetch({
          after: sixAmSnowflake.toString(),
          before: nineAmSnowflake.toString(),
        });
      }

      const isMessage = messages.find((message) => {
        return message.content === content || message.content.includes(content);
      });

      return !!isMessage;
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async getChannelById(id: string) {
    return this.client.channels.cache.get(id) || (await this.client.channels.fetch(id));
  }
}
