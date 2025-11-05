import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TestsModule } from '../tests/tests.module';
import { FeaturesResolver } from './features.resolver';
import { FeaturesService } from './features.service';

/**
 * 機能モジュール
 * 機能管理に関するサービスとリゾルバーを提供します。
 */
@Module({
  imports: [PrismaModule, TestsModule],
  providers: [FeaturesService, FeaturesResolver],
  exports: [FeaturesService],
})
export class FeaturesModule {}
