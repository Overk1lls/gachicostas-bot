import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { createBullBoard } from 'bull-board';
import { BullAdapter } from 'bull-board/bullAdapter';
import { AppService } from './app.service';
import { TelegramService } from './telegram/telegram.service';
import { AppProcessor } from './app.processor';
import { MESSAGE_QUEUE, MessageQueueType } from './lib';
import { getBotsConfig, getRedisConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './config/.env',
      load: [getBotsConfig, getRedisConfig],
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.getOrThrow<string>('REDIS_URL');
        return { url };
      },
    }),
    BullModule.registerQueue({
      name: MESSAGE_QUEUE,
    }),
  ],
  providers: [AppService, TelegramService, AppProcessor],
})
export class AppModule implements NestModule {
  constructor(@InjectQueue(MESSAGE_QUEUE) private messageQueue: Queue<MessageQueueType>) {}

  configure(consumer: MiddlewareConsumer) {
    const { router } = createBullBoard([
      new BullAdapter(this.messageQueue),
    ]);

    consumer.apply(router).forRoutes('/queues');
  }
}
