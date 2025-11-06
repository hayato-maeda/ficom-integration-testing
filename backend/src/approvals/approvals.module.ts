import { Module } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalsResolver } from './approvals.resolver';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * 承認モジュール
 * 承認に関連する機能を提供します。
 */
@Module({
  imports: [PrismaModule],
  providers: [ApprovalsService, ApprovalsResolver],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
