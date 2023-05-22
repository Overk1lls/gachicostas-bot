import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AppService } from './app.service';
import {
  defaultAnswers,
  discordTagRegex,
  getRandomArrayElement,
  ICommand,
  IQuestion,
  MessageQueueProcessName,
  MESSAGE_QUEUE,
  orQuestionAnswers,
  orQuestionRegex,
  randomNum,
  Response,
  whoIsQuestionAnswers,
  IMessage,
  matWords,
  isRegexInText,
  matAnswers,
  botTaggingAnswers,
  commandAnswers,
} from './lib';

@Injectable()
@Processor(MESSAGE_QUEUE)
export class AppProcessor {
  private readonly logger = new Logger(AppProcessor.name);

  constructor(private readonly appService: AppService) {}

  @Process(MessageQueueProcessName.Command)
  async handleCommand(job: Job<ICommand>) {
    const { command, channel } = job.data;

    await this.appService.reply(commandAnswers[command], channel);
  }

  @Process(MessageQueueProcessName.OrQuestion)
  async handleOrQuestion(job: Job<IQuestion>) {
    const { question, botRegex, channel } = job.data;

    const textWithoutTag = question
      .split(' ')
      .filter((w) => !(discordTagRegex.test(w) || botRegex.test(w)))
      .join(' ');
    const questionWords = textWithoutTag.slice(0, -1).split(orQuestionRegex);
    const chosenWord = getRandomArrayElement(questionWords);

    /**
     * Roll the dice (25 / 75%)
     */
    const num = randomNum(0, 100);

    /**
     * If the roll is 75%, randomly response with one of the two question words
     */
    let response = chosenWord;

    /**
     * If the roll is 25%, randomly response with one of the prepared answers
     */
    if (num >= 75) {
      const answerIdx = randomNum(0, orQuestionAnswers.length);
      response = orQuestionAnswers[answerIdx] + (answerIdx < 4 ? chosenWord : '');
    }

    await this.appService.reply(response, channel);
  }

  @Process(MessageQueueProcessName.WhoQuestion)
  async handleWhoQuestion(job: Job<IQuestion>) {
    const { message, channel } = job.data;

    const answerIdx = randomNum(0, whoIsQuestionAnswers.length);
    const answer = whoIsQuestionAnswers[answerIdx];

    let response: string;

    if (answerIdx < 4) {
      response = answer;
    } else {
      const members = message.guild.members.cache.filter((m) => !m.user.bot);
      const chosenOne = getRandomArrayElement([...members]);
      const { username, discriminator } = chosenOne[1].user;

      response = `${answer} ${username}#${discriminator}`;
    }

    await this.appService.reply(response, channel);
  }

  @Process(MessageQueueProcessName.RandomQuestion)
  async handleRandomQuestion(job: Job<IQuestion>) {
    const { channel } = job.data;

    await this.appService.reply(getRandomArrayElement(defaultAnswers), channel);
  }

  @Process(MessageQueueProcessName.TagMessage)
  async handleTagMessage(job: Job<IMessage>) {
    const { message, channel, botUsername, isMentioned } = job.data;

    /**
     * If the bot is offended
     */
    const matRegex = new RegExp(matWords.join('|'), 'i');

    /**
     * If the mat words are present in the text
     */
    if (isRegexInText(matRegex, message)) {
      for (const word of matWords) {
        const noMentionRegex = new RegExp(`${botUsername} ${word}`, 'i');
        const mentionRegex = new RegExp(`${discordTagRegex.source} ${word}`, 'i');

        if (
          (isMentioned && isRegexInText(mentionRegex, message)) ||
          (!isMentioned && isRegexInText(noMentionRegex, message))
        ) {
          await this.appService.reply(getRandomArrayElement(matAnswers), channel);
        }
      }
    } else if (isMentioned) {
      /**
       * If the bot is just tagged
       */
      await this.appService.reply(getRandomArrayElement(botTaggingAnswers), channel);
    } else {
      /**
       * If something else
       */
      await this.appService.reply(Response.NoQuestion, channel);
    }
  }
}
