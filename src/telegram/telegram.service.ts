import TelegramBot from 'node-telegram-bot-api';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from '../app.service';
import { AsyncInitializable, discordFloodChannelId, logger } from '../lib';
import { Util } from 'discord.js';

@Injectable()
export class TelegramService implements OnApplicationBootstrap, AsyncInitializable {
  private client: TelegramBot;

  constructor(private discordService: AppService, private configService: ConfigService) {}

  async onApplicationBootstrap() {
    const token = this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');

    this.client = new TelegramBot(token, {
      polling: true,
    });

    await this.init();
  }

  async init(): Promise<void> {
    logger.info('The Telegram bot is ready to work');

    this.client.on('channel_post', async (message) => {
      const { text, date } = message;

      if (
        text &&
        text.startsWith('Овен', 2) &&
        new Date(date * 1000).toDateString() === new Date().toDateString()
      ) {
        const isPresent = await this.discordService.isMessagePresentInChannel(
          text,
          discordFloodChannelId,
          date
        );

        if (!isPresent) {
          const split = Util.splitMessage(text);
          const message = await this.discordService.reply(`>>> ${split[0]}`, discordFloodChannelId);

          for (let i = 1; i < split.length; i++) {
            await this.discordService.reply(`>>> ${split[i]}`, message.channel);
          }
        }
      }
    });
  }
}
