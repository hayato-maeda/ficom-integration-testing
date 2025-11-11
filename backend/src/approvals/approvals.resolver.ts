import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from '../users/models/user.model';
import { ApprovalsService } from './approvals.service';
import { ApprovalMutationResponse } from './dto/approval-mutation.response';
import { CreateApprovalInput } from './dto/create-approval.input';
import { UpdateApprovalInput } from './dto/update-approval.input';
import { Approval } from './models/approval.model';

/**
 * 承認リゾルバー
 * 承認のGraphQL API を提供します。
 */
@Resolver(() => Approval)
@UseGuards(GqlAuthGuard)
export class ApprovalsResolver {
  constructor(private readonly approvalsService: ApprovalsService) {}

  /**
   * 承認を作成または更新します
   *
   * @param currentUser ログインユーザー
   * @param createApprovalInput 承認作成入力データ
   * @returns 承認作成結果
   */
  @Mutation(() => ApprovalMutationResponse)
  async createApproval(
    @CurrentUser() currentUser: User,
    @Args('input') createApprovalInput: CreateApprovalInput,
  ): Promise<ApprovalMutationResponse> {
    try {
      const approval = await this.approvalsService.createOrUpdate(currentUser.id, createApprovalInput);
      return {
        isValid: true,
        message: '承認を登録しました',
        data: approval,
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message || '承認の登録に失敗しました',
        data: null,
      };
    }
  }

  /**
   * テストケースの承認履歴を取得します
   *
   * @param featureId 機能ID
   * @param testId テストID
   * @param testCaseId テストケースID
   * @returns 承認履歴のリスト
   */
  @Query(() => [Approval])
  async approvalsByTestCase(
    @Args('featureId', { type: () => Int }) featureId: number,
    @Args('testId', { type: () => Int }) testId: number,
    @Args('testCaseId', { type: () => Int }) testCaseId: number,
  ): Promise<Approval[]> {
    return this.approvalsService.findByTestCase(featureId, testId, testCaseId);
  }

  /**
   * 承認を取得します
   *
   * @param id 承認ID
   * @returns 承認
   */
  @Query(() => Approval, { nullable: true })
  async approval(@Args('id', { type: () => Int }) id: number): Promise<Approval | null> {
    return this.approvalsService.findOne(id);
  }

  /**
   * 承認のコメントを更新します
   *
   * @param currentUser ログインユーザー
   * @param updateApprovalInput 承認更新入力データ
   * @returns 承認更新結果
   */
  @Mutation(() => ApprovalMutationResponse)
  async updateApproval(
    @CurrentUser() currentUser: User,
    @Args('input') updateApprovalInput: UpdateApprovalInput,
  ): Promise<ApprovalMutationResponse> {
    try {
      const approval = await this.approvalsService.update(currentUser.id, updateApprovalInput);
      return {
        isValid: true,
        message: 'コメントを更新しました',
        data: approval,
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message || 'コメントの更新に失敗しました',
        data: null,
      };
    }
  }

  /**
   * 承認を削除します
   *
   * @param currentUser ログインユーザー
   * @param id 承認ID
   * @returns 承認削除結果
   */
  @Mutation(() => ApprovalMutationResponse)
  async deleteApproval(
    @CurrentUser() currentUser: User,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<ApprovalMutationResponse> {
    try {
      const approval = await this.approvalsService.remove(id, currentUser.id);
      return {
        isValid: true,
        message: '承認を削除しました',
        data: approval,
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message || '承認の削除に失敗しました',
        data: null,
      };
    }
  }
}
