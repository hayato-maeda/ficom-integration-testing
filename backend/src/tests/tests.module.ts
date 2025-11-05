import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TestCasesModule } from '../test-cases/test-cases.module';
import { TestsResolver } from './tests.resolver';
import { TestsService } from './tests.service';

/**
 * テストモジュール
 * テスト管理機能を提供します。
 */
@Module({
  imports: [PrismaModule, TestCasesModule],
  providers: [TestsResolver, TestsService],
  exports: [TestsService],
})
export class TestsModule {}
