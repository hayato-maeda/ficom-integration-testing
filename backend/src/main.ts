import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

/**
 * アプリケーションのブートストラップ
 * NestJS アプリケーションを起動し、必要な設定を行います。
 */
async function bootstrap() {
  // ログディレクトリを作成（存在しない場合）
  const logsDir = join(process.cwd(), 'logs');
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  // Pino ロガーを使用してアプリケーションを作成
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Pino ロガーを設定
  app.useLogger(app.get(Logger));

  // CORS 設定
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // グローバルバリデーションパイプ
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`GraphQL API: http://localhost:${port}/graphql`);
  logger.log(`Log Level: ${process.env.LOG_LEVEL || 'info'}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
