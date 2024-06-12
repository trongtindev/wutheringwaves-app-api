import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { AppGuard } from './app.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn', 'debug', 'verbose', 'log']
        : ['error', 'warn', 'log']
  });

  app.enableCors();
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.useGlobalGuards(new AppGuard());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT);
  console.log(`Local: http://localhost:${process.env.PORT}.`);
}
bootstrap();
