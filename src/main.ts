import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getLogCategories } from './lib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLogCategories(),
  });
  await app.listen(3000);
}

bootstrap();
