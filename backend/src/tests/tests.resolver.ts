import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlSessionGuard } from '../auth/guards/gql-session.guard';
import { User } from '../users/models/user.model';
import { CreateTestInput } from './dto/create-test.input';
import { TestMutationResponse } from './dto/test-mutation.response';
import { UpdateTestInput } from './dto/update-test.input';
import { Test } from './models/test.model';
import { TestsService } from './tests.service';

/**
 * テストリゾルバー
 * GraphQL のテスト関連のクエリとミューテーションを処理します。
 */
@Resolver(() => Test)
@UseGuards(GqlSessionGuard)
export class TestsResolver {
  constructor(private readonly testsService: TestsService) {}

  /**
   * テスト作成ミューテーション
   * @param createTestInput - 作成データ
   * @param user - 現在のユーザー
   * @returns テストMutationレスポンス
   */
  @Mutation(() => TestMutationResponse)
  async createTest(
    @Args('createTestInput', { type: () => CreateTestInput })
    createTestInput: CreateTestInput,
    @CurrentUser() user: User,
  ): Promise<TestMutationResponse> {
    return this.testsService.create(createTestInput, user.id);
  }

  /**
   * テスト一覧取得クエリ
   * @returns テストの一覧
   */
  @Query(() => [Test])
  async tests(): Promise<Test[]> {
    return this.testsService.findAll();
  }

  /**
   * テスト取得クエリ
   * @param featureId - 機能ID
   * @param id - テストID
   * @returns テストまたはnull
   */
  @Query(() => Test, { nullable: true })
  async test(
    @Args('featureId', { type: () => Int }) featureId: number,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Test | null> {
    return this.testsService.findOne(featureId, id);
  }

  /**
   * 機能に属するテスト取得クエリ
   * @param featureId - 機能ID
   * @returns テストの一覧
   */
  @Query(() => [Test])
  async testsByFeature(@Args('featureId', { type: () => Int }) featureId: number): Promise<Test[]> {
    return this.testsService.findByFeature(featureId);
  }

  /**
   * テスト更新ミューテーション
   * @param updateTestInput - 更新データ
   * @returns テストMutationレスポンス
   */
  @Mutation(() => TestMutationResponse)
  async updateTest(
    @Args('updateTestInput', { type: () => UpdateTestInput })
    updateTestInput: UpdateTestInput,
  ): Promise<TestMutationResponse> {
    return this.testsService.update(updateTestInput);
  }

  /**
   * テスト削除ミューテーション
   * @param featureId - 機能ID
   * @param id - テストID
   * @returns テストMutationレスポンス
   */
  @Mutation(() => TestMutationResponse)
  async deleteTest(
    @Args('featureId', { type: () => Int }) featureId: number,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<TestMutationResponse> {
    return this.testsService.remove(featureId, id);
  }
}
