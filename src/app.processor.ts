import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Message, MessageOptions } from 'discord.js';
import { AppService } from './app.service';
import { commands, defaultAnswers, discordTagRegex, getRandomArrayElement, ICommand, IQuestion, isMessageChannel, MessageQueueProcessName, MESSAGE_QUEUE, NonNewsChannel, orQuestionAnswers, orQuestionRegex, randomNum, Response, whoIsQuestionAnswers } from './lib';

@Injectable()
@Processor(MESSAGE_QUEUE)
export class AppProcessor {
  private readonly logger = new Logger(AppProcessor.name);

  constructor(private readonly appService: AppService) {}

  @Process(MessageQueueProcessName.Command)
  async handleCommand(job: Job<ICommand>) {
    const { command, channel } = job.data;

    switch (command) {
      case commands[0]: {
        await this.appService.reply(Response.StatWeights, channel);
        break;
      }
      case commands[1]: {
        await this.appService.reply(Response.Craft, channel);
        break;
      }
      case commands[2]: {
        await this.appService.reply(Response.Embellishments, channel);
        break;
      }
    }
  }

  @Process(MessageQueueProcessName.OrQuestion)
  async handleOrQuestion(job: Job<IQuestion>) {
    const { question: content, botRegex, channel } = job.data;

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

  /**
    * If the message is a random question.
    */
  @Process(MessageQueueProcessName.RandomQuestion)
  async handleRandomQuestion(job: Job<IQuestion>) {
    const { channel } = job.data;

    await this.appService.reply(getRandomArrayElement(defaultAnswers), channel);
  }
}
