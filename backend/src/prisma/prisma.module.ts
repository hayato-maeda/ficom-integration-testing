import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Prisma モジュール
 * データベース接続を提供するグローバルモジュールです。
 * PrismaService を他のモジュールで使用できるようにエクスポートします。
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
