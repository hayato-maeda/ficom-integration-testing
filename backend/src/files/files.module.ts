import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FilesController } from './files.controller';
import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';

/**
 * ファイルモジュール
 * ファイルのアップロード、ダウンロード、管理機能を提供します。
 */
@Module({
  imports: [PrismaModule],
  controllers: [FilesController],
  providers: [FilesResolver, FilesService],
  exports: [FilesService],
})
export class FilesModule {}
