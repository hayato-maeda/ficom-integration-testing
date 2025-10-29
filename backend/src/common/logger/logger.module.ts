import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { pinoLoggerConfig } from './pino-logger.config';

/**
 * ロガーモジュール
 * Pino を使用した高性能ロギングを提供します
 */
@Module({
  imports: [PinoLoggerModule.forRoot(pinoLoggerConfig())],
})
export class LoggerModule {}
