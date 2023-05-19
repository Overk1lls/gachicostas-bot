import { InjectQueue } from '@nestjs/bull/dist/decorators';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { Client, Collection, Intents, Message, MessageOptions } from 'discord.js';
import {
  AsyncInitializable,
  commands,
  discordEpoch,
  isMessageChannel,
  isRegexInText,
  isRegexMatched,
  MessageQueueProcessName,
  MessageQueueType,
  MESSAGE_QUEUE,
  NonNewsChannel,
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
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
      presence: {
        status: 'online',
      },
    });

    await this.init();
  }

  async init() {
    try {
      const token = this.configService.getOrThrow<string>('DISCORD_BOT_TEST');
      await this.client.login(token);

      this.client.on('ready', () => {
        this.logger.log(`${this.client.user.username} is ready to work!`);
      });

      this.client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.channel.isText()) {
          return;
        }

        const { channel, content } = message;
        const botRegex = new RegExp(this.client.user.username, 'i');
        const isMentioned = message.mentions.users.has(this.client.user.id);
        const command = commands.find((c) => content.includes(c));

        /**
         * If the message is a question about DH
         */
        if (command) {
          await this.messageQueue.add(
            MessageQueueProcessName.Command,
            { command, channel },
            { removeOnComplete: true }
          );
        } else if (isMentioned || isRegexMatched(botRegex, content)) {
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
              await this.messageQueue.add(MessageQueueProcessName.OrQuestion, {
                channel,
                botRegex,
                question: content,
              });
            } else if (isWhoIsQuestion) {
              /**
               * If the message is the `Who's on the server ...` question
               */
              await this.messageQueue.add(MessageQueueProcessName.WhoQuestion, {
                channel,
                question: content,
              });
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
                isMentioned,
                message: content,
                botUsername: this.client.user.username,
              },
              { removeOnComplete: true }
            );
          }
        }
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async reply(content: string, channel: NonNewsChannel | string, options?: MessageOptions) {
    try {
      const theChannel = isMessageChannel(channel) ? channel : await this.getChannelById(channel) as NonNewsChannel;

      if (!theChannel) {
        throw new Error(`There is no channel with such id: ${channel}`);
      }

      if (theChannel.type === 'GUILD_TEXT') {
        this.logger.debug(theChannel.guild.me.permissions);
        const permissions = theChannel.guild.me.permissionsIn(theChannel);

        if (!permissions.has('SEND_MESSAGES')) {
          this.logger.warn(
            `I don't have a permission to send a message to this channel: ${theChannel.name}`
          );
          return;
        }
        await theChannel.sendTyping();
        const message = await theChannel.send(options ?? content);

        this.logger.log(`bot:message:sent ${theChannel.name}:${theChannel.guild.name}`);

        return message;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async isMessagePresentInChannel(
    content: string,
    channel: NonNewsChannel | string,
    when?: Date | number
  ) {
    try {
      const chan = isMessageChannel(channel)
        ? channel
        : ((await this.getChannelById(channel)) as NonNewsChannel);

      if (!chan) {
        throw new Error(`There is no channel with such id: ${channel}`);
      }

      let messages: Collection<string, Message<boolean>>;

      if (when) {
        const parseDate = when instanceof Date ? when.getTime() : when * 1000;
        const snowflake = (BigInt(parseDate) - BigInt(discordEpoch)) << 22n;

        messages = await chan.messages.fetch({
          around: snowflake.toString(),
        });
      } else {
        const todaySixAm = new Date().setUTCHours(6, 0);
        const todayNineAm = new Date().setUTCHours(9, 0);
        const sixAmSnowflake = (BigInt(todaySixAm) - BigInt(discordEpoch)) << 22n;
        const nineAmSnowflake = (BigInt(todayNineAm) - BigInt(1420070400000)) << 22n;

        messages = await chan.messages.fetch({
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

  private getChannelById(id: string) {
    return this.client.channels.cache.get(id) || this.client.channels.fetch(id);
  }
}
