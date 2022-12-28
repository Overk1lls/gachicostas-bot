import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getLogCategories } from './lib';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLogCategories(),
  });
  await app.listen(process.env.PORT || 8080);
}

bootstrap();
