import { Module } from '@nestjs/common';
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
  imports: [PrismaModule, TagsModule, FilesModule],
  providers: [TestCasesResolver, TestCasesService],
  exports: [TestCasesService],
})
export class TestCasesModule {}
