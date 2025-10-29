import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TestCasesResolver } from './test-cases.resolver';
import { TestCasesService } from './test-cases.service';

/**
 * テストケースモジュール
 * テストケース管理機能を提供します。
 */
@Module({
  imports: [PrismaModule],
  providers: [TestCasesResolver, TestCasesService],
  exports: [TestCasesService],
})
export class TestCasesModule {}
