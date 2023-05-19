import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { getLogCategories } from './lib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLogCategories(),
  });
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT', '8080');

  await app.listen(port);
}

bootstrap().catch(console.error);
