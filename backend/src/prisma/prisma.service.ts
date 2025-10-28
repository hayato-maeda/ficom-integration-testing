import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma サービス
 * データベース接続を管理します。
 * アプリケーションのライフサイクルに合わせて自動的に接続・切断を行います。
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * モジュール初期化時にデータベースに接続
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * モジュール破棄時にデータベース接続を切断
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
