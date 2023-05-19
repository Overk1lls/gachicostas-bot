import config from './lib/config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppService } from './app.service';
import { TelegramService } from './telegram/telegram.service';
import { AppProcessor } from './app.processor';
import { MESSAGE_QUEUE } from './lib';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './config/.env',
      load: [config],
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: +configService.get<string>('REDIS_PORT', '6379'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: MESSAGE_QUEUE,
    }),
  ],
  providers: [AppService, TelegramService, AppProcessor],
})
export class AppModule {}
