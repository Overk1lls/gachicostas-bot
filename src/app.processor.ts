import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AppService } from './app.service';
import {
  defaultAnswers,
  discordTagRegex,
  getRandomArrayElement,
  DhCommandJobType,
  OrQuestionJobType,
  MessageQueueProcessName,
  MESSAGE_QUEUE,
  orQuestionAnswers,
  orQuestionRegex,
  randomNum,
  Response,
  whoIsQuestionAnswers,
  RandomMessageJobType,
  matWords,
  isRegexInText,
  matAnswers,
  botTaggingAnswers,
  commandAnswers,
  WhoQuestionJobType,
} from './lib';

@Injectable()
@Processor(MESSAGE_QUEUE)
export class AppProcessor {
  private readonly logger = new Logger(AppProcessor.name);

  constructor(private readonly appService: AppService) {}

  @Process(MessageQueueProcessName.Command)
  async handleCommand(job: Job<DhCommandJobType>) {
    const { command, channelId } = job.data;

    await this.appService.reply(commandAnswers[command], channelId);
  }

  @Process(MessageQueueProcessName.OrQuestion)
  async handleOrQuestion(job: Job<OrQuestionJobType>) {
    const { question, botRegexString, channelId } = job.data;

    const textWithoutTag = question
      .split(' ')
      .filter((w) => !(discordTagRegex.test(w) || new RegExp(botRegexString).test(w)))
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

    await this.appService.reply(response, channelId);
  }

  @Process(MessageQueueProcessName.WhoQuestion)
  async handleWhoQuestion(job: Job<WhoQuestionJobType>) {
    const { chosen, channelId } = job.data;

    const answerIdx = randomNum(0, whoIsQuestionAnswers.length);
    const answer = whoIsQuestionAnswers[answerIdx];

    let response: string;

    if (answerIdx < 4) {
      response = answer;
    } else {
      const { username, discriminator, tag } = chosen;

      response = `${answer} ${parseInt(discriminator) > 0 ? tag : username}`;
    }

    await this.appService.reply(response, channelId);
  }

  @Process(MessageQueueProcessName.RandomQuestion)
  async handleRandomQuestion(job: Job<RandomMessageJobType>) {
    const { channelId } = job.data;

    await this.appService.reply(getRandomArrayElement(defaultAnswers), channelId);
  }

  @Process(MessageQueueProcessName.TagMessage)
  async handleTagMessage(job: Job<RandomMessageJobType>) {
    const { message, channelId, botUsername, isMentioned } = job.data;

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
          await this.appService.reply(getRandomArrayElement(matAnswers), channelId);
        }
      }
    } else if (isMentioned) {
      /**
       * If the bot is just tagged
       */
      await this.appService.reply(getRandomArrayElement(botTaggingAnswers), channelId);
    } else {
      /**
       * If something else
       */
      await this.appService.reply(Response.NoQuestion, channelId);
    }
  }
}
