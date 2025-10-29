import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TagsResolver } from './tags.resolver';
import { TagsService } from './tags.service';

/**
 * タグモジュール
 * タグ管理機能を提供します。
 */
@Module({
  imports: [PrismaModule],
  providers: [TagsResolver, TagsService],
  exports: [TagsService],
})
export class TagsModule {}
