import { Client, ClientOptions, MessageOptions, TextBasedChannel } from 'discord.js';
import {
  dhQuestions,
  isRegexInText,
  isStringMatchingRegex,
  questionRegexps,
  regexps,
} from '../lib/regexps';
import { randomNum, getRandomArrayElement } from '../lib/utils';
import {
  mat,
  matAnswers,
  answers,
  answersForOrQuestions,
  answersForWhoIsQuestion,
  Response,
  answersForTagging,
} from '../lib/const';
import { Nullable } from '../lib/types';
import { logger } from '../lib/logger';

type NonNewsChannel = Exclude<TextBasedChannel, 'NewsChannel'>;

const isMessageChannel = (channel: TextBasedChannel): channel is NonNewsChannel => {
  return channel.type !== 'GUILD_NEWS';
};

export class DiscordService {
  private readonly token: string;
  private readonly client: Client;
  private botUsername: string;
  private botUsernameRegex: RegExp;

  constructor(token: string, options: ClientOptions) {
    this.token = token;
    this.client = new Client(options);
  }

  async init() {
    await this.client.login(this.token);

    this.botUsername = this.client.user.username;
    this.botUsernameRegex = new RegExp(this.botUsername, 'i');
    logger.info(this.botUsername + ' is ready');

    this.messageHandler();
  }

  private messageHandler() {
    this.client.on('message', async (message) => {
      if (message.author.bot) {
        return;
      }
      const { channel } = message;

      if (isMessageChannel(channel)) {
        const { content: msg } = message;
        const msgChunks = msg.split(' ');
        const isMentioned = message.mentions.users.has(this.client.user.id);
        /**
         * If question about DH
         */
        if (isRegexInText(dhQuestions, msg)) {
          /**
           * If question about stat weights
           */
          if (isRegexInText(questionRegexps.whatStatWeights, msg)) {
            this.replyToChannel(Response.StatWeights, channel);
          }
        } else if (isMentioned || isStringMatchingRegex(msg, this.botUsernameRegex)) {
          /**
           * If bot was tagged
           */
          /**
           * If there is a question
           */
          if (msg.split('').pop() === '?') {
            const isThereOr = msgChunks.find((word) => isStringMatchingRegex(word, regexps.or));
            const isWhoIsQuestion = isRegexInText(questionRegexps.whoIsOnServer, msg);
            /**
             * If there is 'OR' in question, roll the dice (25 / 75%)
             */
            if (isThereOr && !isWhoIsQuestion) {
              const num = randomNum(0, 100);
              const questions = msg.split('?')[0].split(regexps.or);
              const question = getRandomArrayElement(questions);
              /**
               * If we rolled 75%, send one of two answers
               */
              if (num < 75) {
                const answer = question
                  .split(' ')
                  .filter((question) => !question.match(regexps.discordTag))
                  .join(' ');
                this.replyToChannel(answer, channel);
              } else {
                /**
                 * If we rolled 25%, roll and send one of prepared answers
                 */
                const answer = randomNum(0, answersForOrQuestions.length);
                if (answer < 4) {
                  this.replyToChannel(answersForOrQuestions[answer] + question, channel);
                } else {
                  this.replyToChannel(answersForOrQuestions[answer], channel);
                }
              }
            } else if (isWhoIsQuestion) {
              /**
               * If it's the 'Who on the server ...' question
               */
              const answer = randomNum(0, answersForWhoIsQuestion.length);
              const userNum = randomNum(0, message.guild.memberCount);

              const guildUsers = await message.guild.members.fetch({ force: true });
              const chosenUser = guildUsers.at(userNum).user;
              const { username, discriminator } = chosenUser;

              this.replyToChannel(
                answer < 3
                  ? answersForWhoIsQuestion[answer]
                  : `${answersForWhoIsQuestion[answer]} ${username}#${discriminator}`,
                channel
              );
            } else {
              /**
               * If it's a random question
               */
              const answer = getRandomArrayElement(answers);
              this.replyToChannel(answer, channel);
            }
          } else {
            /**
             * If bot was tagged without a question mark
             */
            /**
             * If bot was offended
             */
            const matRegex = new RegExp(mat.join('|'), 'i');
            if (isRegexInText(matRegex, msg)) {
              mat.forEach((word) => {
                const noMentionRegex = new RegExp(`${this.botUsername} ${word}`, 'i');
                const mentionRegex = new RegExp(regexps.discordTag + ` ${word}`, 'i');
                if (
                  (isMentioned && isRegexInText(mentionRegex, msg)) ||
                  (!isMentioned && isRegexInText(noMentionRegex, msg))
                ) {
                  const answer = getRandomArrayElement(matAnswers);
                  this.replyToChannel(answer, channel);
                }
              });
            } else if (isMentioned) {
              /**
               * If bot was just tagged
               */
              const answer = getRandomArrayElement(answersForTagging);
              this.replyToChannel(answer, channel);
            } else {
              /**
               * If something else
               */
              this.replyToChannel(Response.NoQuestion, channel);
            }
          }
        }
      }
    });
  }

  private replyToChannel = async (
    message: Nullable<string>,
    channel: NonNewsChannel,
    options?: MessageOptions
  ) => {
    if (channel.type !== 'DM') {
      const { name } = channel;
      const permissions = channel.guild.me.permissionsIn(channel);
      if (!permissions.has('SEND_MESSAGES')) {
        logger.warn(`Can\'t send messages to this channel: ${name}`);
      }
    }
    await channel.send(options ?? message);

    logger.info(`${this.botUsername}: ${message}`);
  };
}
