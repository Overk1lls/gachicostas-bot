import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Collection, Intents, Message, MessageOptions } from 'discord.js';
import {
  AsyncInitializable,
  botTaggingAnswers,
  defaultAnswers,
  dhQuestions,
  discordEpoch,
  getRandomArrayElement,
  isMessageChannel,
  isRegexInText,
  isStringMatchingRegex,
  logger,
  matAnswers,
  matWords,
  NonNewsChannel,
  orQuestionAnswers,
  questionRegexps,
  randomNum,
  regexps,
  Response,
  whoIsQuestionAnswers,
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
    const token = this.configService.getOrThrow<string>('DISCORD_BOT_TOKEN');
    await this.client.login(token);

    this.client.on('ready', () => {
      logger.info(`${this.client.user.username} is ready to work!`);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.id === this.client.user.id || message.author.bot) {
        return;
      }
      const { channel } = message;

      if (isMessageChannel(channel)) {
        const { content } = message;
        const words = content.split(' ');
        const isMentioned = message.mentions.users.has(this.client.user.id);
        const botRegex = new RegExp(this.client.user.username, 'i');

        /**
         * If the message is a question about DH
         */
        if (isRegexInText(dhQuestions, content)) {
          /**
           * If the message is a question about DH stat weights
           */
          if (isRegexInText(questionRegexps.whatStatWeights, content)) {
            this.reply(Response.StatWeights, channel);
          }
        } else if (isMentioned || isStringMatchingRegex(content, botRegex)) {
          /**
           * Is the message a question?
           */
          if (content.split('').pop() === '?') {
            const isThereOr = words.find((word) => isStringMatchingRegex(word, regexps.or));
            const isWhoIsQuestion = isRegexInText(questionRegexps.whoIsOnServer, content);

            /**
             * If there is 'OR' in question, roll the dice (25 / 75%)
             */
            if (isThereOr && !isWhoIsQuestion) {
              const num = randomNum(0, 100);
              const questions = content.split('?')[0].split(regexps.or);
              const question = getRandomArrayElement(questions);

              /**
               * If we rolled 75%, send one of two answers
               */
              if (num < 75) {
                const answer = question
                  .split(' ')
                  .filter((q) => !q.match(regexps.discordTag))
                  .join(' ');
                this.reply(answer, channel);
              } else {
                /**
                 * If we rolled 25%, roll and send one of prepared answers
                 */
                const answer = randomNum(0, orQuestionAnswers.length);
                if (answer < 4) {
                  this.reply(orQuestionAnswers[answer] + question, channel);
                } else {
                  this.reply(orQuestionAnswers[answer], channel);
                }
              }
            } else if (isWhoIsQuestion) {
              /**
               * If it's the 'Who on the server ...' question
               */
              const answer = randomNum(0, whoIsQuestionAnswers.length);
              const userNum = randomNum(0, message.guild.memberCount);

              const guildUsers = await message.guild.members.fetch({ force: true });
              const chosenUser = guildUsers.at(userNum).user;
              const { username, discriminator } = chosenUser;

              this.reply(
                answer < 3
                  ? whoIsQuestionAnswers[answer]
                  : `${whoIsQuestionAnswers[answer]} ${username}#${discriminator}`,
                channel
              );
            } else {
              /**
               * If it's a random question
               */
              const answer = getRandomArrayElement(defaultAnswers);
              this.reply(answer, channel);
            }
          } else {
            /**
             * If bot was offended
             */
            const matRegex = new RegExp(matWords.join('|'), 'i');
            if (isRegexInText(matRegex, content)) {
              matWords.forEach((word) => {
                const noMentionRegex = new RegExp(`${this.client.user.username} ${word}`, 'i');
                const mentionRegex = new RegExp(regexps.discordTag + ` ${word}`, 'i');
                if (
                  (isMentioned && isRegexInText(mentionRegex, content)) ||
                  (!isMentioned && isRegexInText(noMentionRegex, content))
                ) {
                  const answer = getRandomArrayElement(matAnswers);
                  this.reply(answer, channel);
                }
              });
            } else if (isMentioned) {
              /**
               * If bot was just tagged
               */
              const answer = getRandomArrayElement(botTaggingAnswers);
              this.reply(answer, channel);
            } else {
              /**
               * If something else
               */
              this.reply(Response.NoQuestion, channel);
            }
          }
        }
      }
    });
  }

  async reply(content: string, channel: NonNewsChannel | string, options?: MessageOptions) {
    try {
      if (isMessageChannel(channel)) {
        if (channel.type !== 'DM') {
          const permissions = channel.guild.me.permissionsIn(channel);

          if (!permissions.has('SEND_MESSAGES')) {
            logger.warn(
              `I don't have a permission to send a message to this channel: ${channel.name}`
            );
            return;
          }
        }
        await channel.send(options ?? content);
      } else {
        const fetchedChannel = await this.getChannelById(channel);

        if (fetchedChannel.isText() || fetchedChannel.isThread()) {
          await fetchedChannel.sendTyping();
          await fetchedChannel.send(options ?? content);
        }
      }
      logger.info(`${this.client.user.username}: ${content}`);
    } catch (error) {
      logger.error(error);
    }
  }

}
