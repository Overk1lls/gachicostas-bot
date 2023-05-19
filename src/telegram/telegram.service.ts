import TelegramBot from 'node-telegram-bot-api';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from '../app.service';
import { AsyncInitializable, dhDiscordFloodChannelId, splitMessage } from '../lib';

@Injectable()
export class TelegramService implements OnApplicationBootstrap, AsyncInitializable {
  private client: TelegramBot;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private discordService: AppService, private configService: ConfigService) {}

  async onApplicationBootstrap() {
    const token = this.configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN');

    this.client = new TelegramBot(token, {
      polling: true,
    });

    await this.init();
  }

  async init(): Promise<void> {
    this.logger.log('The Telegram bot is ready to work');

    this.client.on('channel_post', async (message) => {
      const { text, date } = message;

      if (
        text &&
        text.startsWith('Овен', 2) &&
        new Date(date * 1000).toDateString() === new Date().toDateString()
      ) {
        const isPresent = await this.discordService.isMessagePresentInChannel(
          text,
          dhDiscordFloodChannelId,
          date
        );

        if (!isPresent) {
          const split = splitMessage(text);
          for (const chunk of split) {
            await this.discordService.reply(`>>> ${chunk}`, dhDiscordFloodChannelId);
          }
        } else {
          this.logger.warn(
            'The telegram bot message is already present on the DH discord channel!'
          );
        }
      }
    });
  }
}
