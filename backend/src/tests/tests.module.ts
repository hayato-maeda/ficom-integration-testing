import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TestsResolver } from './tests.resolver';
import { TestsService } from './tests.service';

/**
 * テストモジュール
 * テスト管理に関するサービスとリゾルバーを提供します。
 */
@Module({
  imports: [PrismaModule],
  providers: [TestsService, TestsResolver],
  exports: [TestsService],
})
export class TestsModule {}
