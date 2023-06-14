import Queue from 'bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { createBullBoard } from 'bull-board';
import { BullAdapter } from 'bull-board/bullAdapter';
import { AppService } from './app.service';
import { TelegramService } from './telegram/telegram.service';
import { AppProcessor } from './app.processor';
import { MESSAGE_QUEUE } from './lib';
import { getBotsConfig, getRedisConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './config/.env',
      load: [getBotsConfig, getRedisConfig],
      isGlobal: true,
    }),
    BullModule.forRoot({
      url: getRedisConfig().url,
    }),
    BullModule.registerQueue({
      name: MESSAGE_QUEUE,
    }),
  ],
  providers: [AppService, TelegramService, AppProcessor],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const { router } = createBullBoard([
      new BullAdapter(new Queue(MESSAGE_QUEUE)),
    ]);

    consumer.apply(router).forRoutes('/queues');
  }
}
