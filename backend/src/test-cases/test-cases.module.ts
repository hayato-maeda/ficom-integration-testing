import { Module } from '@nestjs/common';
import { ApprovalsModule } from '../approvals/approvals.module';
import { FeaturesModule } from '../features/features.module';
import { FilesModule } from '../files/files.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TagsModule } from '../tags/tags.module';
import { TestCasesResolver } from './test-cases.resolver';
import { TestCasesService } from './test-cases.service';

/**
 * テストケースモジュール
 * テストケース管理機能を提供します。
 */
@Module({
  imports: [PrismaModule, TagsModule, FeaturesModule, FilesModule, ApprovalsModule],
  providers: [TestCasesResolver, TestCasesService],
  exports: [TestCasesService],
})
export class TestCasesModule {}
