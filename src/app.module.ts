import config from './lib/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { TelegramService } from './telegram/telegram.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './config/.env',
      load: [config],
      isGlobal: true,
    }),
  ],
  providers: [AppService, TelegramService],
})
export class AppModule { }
