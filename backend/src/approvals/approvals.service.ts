import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApprovalInput } from './dto/create-approval.input';
import { UpdateApprovalInput } from './dto/update-approval.input';
import { Approval } from './models/approval.model';

/**
 * 承認サービス
 * 承認の作成、取得、削除を担当します。
 */
@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 承認を作成します
   * 同じユーザーが複数回承認/却下を行った場合、すべて履歴として残ります
   *
   * @param userId ユーザーID（CurrentUserデコレータから取得）
   * @param createApprovalInput 承認作成入力データ
   * @returns 作成された承認
   */
  async createOrUpdate(userId: number, createApprovalInput: CreateApprovalInput): Promise<Approval> {
    const { featureId, testId, testCaseId, status, comment } = createApprovalInput;

    this.logger.log({
      message: 'Creating approval',
      userId,
      featureId,
      testId,
      testCaseId,
      status,
    });

    // テストケースの存在確認
    const testCaseExists = await this.prismaService.testCase.findUnique({
      where: {
        featureId_testId_id: {
          featureId,
          testId,
          id: testCaseId,
        },
      },
    });

    if (!testCaseExists) {
      throw new NotFoundException(
        `TestCase with featureId=${featureId}, testId=${testId}, testCaseId=${testCaseId} not found`,
      );
    }

    // 常に新しい承認レコードを作成（履歴として残す）
    const approval = await this.prismaService.approval.create({
      data: {
        featureId,
        testId,
        testCaseId,
        userId,
        status,
        comment,
      },
      include: {
        user: true,
        testCase: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    this.logger.log({ message: 'Approval created successfully', approvalId: approval.id });

    // 承認または却下された場合、テストケースのステータスも更新
    if (status === 'APPROVED' || status === 'REJECTED') {
      await this.prismaService.testCase.update({
        where: {
          featureId_testId_id: {
            featureId,
            testId,
            id: testCaseId,
          },
        },
        data: {
          status: status,
        },
      });
      this.logger.log({ message: `TestCase status updated to ${status}`, featureId, testId, testCaseId });
    }

    return approval;
  }

  /**
   * テストケースの承認履歴を取得します
   *
   * @param featureId 機能ID
   * @param testId テストID
   * @param testCaseId テストケースID
   * @returns 承認履歴のリスト
   */
  async findByTestCase(featureId: number, testId: number, testCaseId: number): Promise<Approval[]> {
    this.logger.log({
      message: 'Fetching approvals for test case',
      featureId,
      testId,
      testCaseId,
    });

    const approvals = await this.prismaService.approval.findMany({
      where: {
        featureId,
        testId,
        testCaseId,
      },
      include: {
        user: true,
        testCase: {
          include: {
            createdBy: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return approvals;
  }

  /**
   * 承認を取得します
   *
   * @param id 承認ID
   * @returns 承認
   */
  async findOne(id: number): Promise<Approval> {
    this.logger.log({ message: 'Fetching approval by id', id });

    const approval = await this.prismaService.approval.findUnique({
      where: { id },
      include: {
        user: true,
        testCase: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    if (!approval) {
      throw new NotFoundException(`Approval with id=${id} not found`);
    }

    return approval;
  }

  /**
   * 承認のコメントを更新します
   * 自分の承認のみ更新可能です
   *
   * @param userId ログインユーザーID
   * @param updateApprovalInput 承認更新入力データ
   * @returns 更新された承認
   */
  async update(userId: number, updateApprovalInput: UpdateApprovalInput): Promise<Approval> {
    const { id, comment } = updateApprovalInput;

    this.logger.log({
      message: 'Updating approval comment',
      userId,
      approvalId: id,
    });

    // 承認を取得
    const approval = await this.findOne(id);

    // 自分の承認のみ更新可能
    if (approval.userId !== userId) {
      throw new ForbiddenException('You can only update your own approvals');
    }

    // コメントを更新
    const updated = await this.prismaService.approval.update({
      where: { id },
      data: { comment },
      include: {
        user: true,
        testCase: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    this.logger.log({ message: 'Approval comment updated successfully', approvalId: id });

    return updated;
  }

  /**
   * 承認を削除します
   *
   * @param id 承認ID
   * @param userId ログインユーザーID（自分の承認のみ削除可能）
   * @returns 削除された承認
   */
  async remove(id: number, userId: number): Promise<Approval> {
    this.logger.log({ message: 'Removing approval', id, userId });

    const approval = await this.findOne(id);

    // 自分の承認のみ削除可能
    if (approval.userId !== userId) {
      throw new NotFoundException('You can only delete your own approvals');
    }

    const deleted = await this.prismaService.approval.delete({
      where: { id },
      include: {
        user: true,
        testCase: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    this.logger.log({ message: 'Approval removed successfully', id });

    return deleted;
  }
}
