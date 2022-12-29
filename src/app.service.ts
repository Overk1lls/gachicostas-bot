import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Collection, Intents, Message, MessageOptions } from 'discord.js';
import {
  AsyncInitializable,
  botTaggingAnswers,
  defaultAnswers,
  dhQuestions,
  discordEpoch,
  discordTagRegex,
  getRandomArrayElement,
  isMessageChannel,
  isRegexInText,
  isRegexMatched,
  logger,
  matAnswers,
  matWords,
  NonNewsChannel,
  orQuestionAnswers,
  orQuestionRegex,
  randomNum,
  Response,
  whoIsQuestionAnswers,
  whoIsQuestionRegex,
} from './lib';

@Injectable()
export class AppService implements OnApplicationBootstrap, AsyncInitializable {
  private client: Client;

  constructor(private configService: ConfigService) {}

  async onApplicationBootstrap() {
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
      presence: {
        status: 'online',
      },
    });

    await this.init();
  }

  async init(): Promise<void> {
    try {
      const token = this.configService.getOrThrow<string>('DISCORD_BOT_TEST');
      await this.client.login(token);

      this.client.on('ready', () => {
        logger.info(`${this.client.user.username} is ready to work!`);
      });

      this.client.on('messageCreate', async (message) => {
        if (message.author.id === this.client.user.id || message.author.bot) {
          return;
        }

        const { channel, content } = message;
        const botRegex = new RegExp(this.client.user.username, 'i');
        const isMentioned = message.mentions.users.has(this.client.user.id);

        /**
         * If the message is a question about DH
         */
        if (isRegexInText(dhQuestions, content)) {
          /**
           * If the message is a question about DH stat weights
           */
          if (isRegexInText(dhQuestions[0], content)) {
            this.reply(Response.StatWeights, channel);
          }
        } else if (isMentioned || isRegexMatched(botRegex, content)) {
          /**
           * If the message has a mention about the bot
           */
          /**
           * Is the message a question?
           */
          if (content.endsWith('?')) {
            const isOrQuestion = isRegexInText(orQuestionRegex, content);
            const isWhoIsQuestion = isRegexInText(whoIsQuestionRegex, content);

            /**
             * If this is the 'or' question, roll the dice (25/75%)
             */
            if (isOrQuestion && !isWhoIsQuestion) {
              const textWithoutTag = content
                .split(' ')
                .filter((w) => !(discordTagRegex.test(w) || botRegex.test(w)))
                .join(' ');
              const num = randomNum(0, 100);
              const questionWords = textWithoutTag.slice(0, -1).split(orQuestionRegex);
              const chosenWord = getRandomArrayElement(questionWords);

              /**
               * If the roll is 75%, randomly response with one of the two question words
               */
              let response: string = chosenWord;

              /**
               * If the roll is 25%, randomly response with one of the prepared answers
               */
              if (num >= 75) {
                const answerIdx = randomNum(0, orQuestionAnswers.length);
                response = orQuestionAnswers[answerIdx] + (answerIdx < 4 ? chosenWord : '');
              }

              this.reply(response, channel);
            } else if (isWhoIsQuestion) {
              /**
               * If the message is the `Who's on the server ...` question
               */
              const answerIdx = randomNum(0, whoIsQuestionAnswers.length);
              const answer = whoIsQuestionAnswers[answerIdx];

              let response: string;

              if (answerIdx < 4) {
                response = answer;
              } else {
                const members = message.guild.members.cache.filter((m) => !m.user.bot);
                const memberIdx = randomNum(0, members.size);
                const chosenOne = members.at(memberIdx).user;
                const { username, discriminator } = chosenOne;

                response = `${answer} ${username}#${discriminator}`;
              }

              this.reply(response, channel);
            } else {
              /**
               * If the message is a random question
               */
              this.reply(getRandomArrayElement(defaultAnswers), channel);
            }
          } else {
            /**
             * If the bot was offended
             */
            const matRegex = new RegExp(matWords.join('|'), 'i');

            /**
             * If the mat words are present in the text
             */
            if (isRegexInText(matRegex, content)) {
              matWords.forEach((word) => {
                const noMentionRegex = new RegExp(`${this.client.user.username} ${word}`, 'i');
                const mentionRegex = new RegExp(`${discordTagRegex.source} ${word}`, 'i');

                if (
                  (isMentioned && isRegexInText(mentionRegex, content)) ||
                  (!isMentioned && isRegexInText(noMentionRegex, content))
                ) {
                  this.reply(getRandomArrayElement(matAnswers), channel);
                }
              });
            } else if (isMentioned) {
              /**
               * If the bot was just tagged
               */
              this.reply(getRandomArrayElement(botTaggingAnswers), channel);
            } else {
              /**
               * If something else
               */
              this.reply(Response.NoQuestion, channel);
            }
          }
        }
      });
    } catch (error) {
      logger.error(error);
    }
  }

  async reply(content: string, channel: NonNewsChannel | string, options?: MessageOptions) {
    try {
      const theChannel = isMessageChannel(channel) ? channel : await this.getChannelById(channel);

      if (!theChannel) {
        throw new Error(`There is no channel with such id: ${channel}`);
      }

      if (theChannel.isText() && theChannel.type !== 'DM') {
        const permissions = theChannel.guild.me.permissionsIn(theChannel);

        if (!permissions.has('SEND_MESSAGES')) {
          logger.warn(
            `I don't have a permission to send a message to this channel: ${theChannel.name}`
          );
          return;
        }
        await theChannel.sendTyping();
        const message = await theChannel.send(options ?? content);

        logger.info(`${this.client.user.username}: ${content}`);

        return message;
      }
    } catch (error) {
      logger.error(error);
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
      logger.error(error);
    }
  }

  private getChannelById(id: string) {
    return this.client.channels.cache.get(id) || this.client.channels.fetch(id);
  }
}
