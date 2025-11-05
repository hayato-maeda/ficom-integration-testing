import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GqlSessionGuard } from '../auth/guards/gql-session.guard';
import { TestCase } from '../test-cases/models/test-case.model';
import { TestCasesService } from '../test-cases/test-cases.service';
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
  constructor(
    private readonly testsService: TestsService,
    private readonly testCasesService: TestCasesService,
  ) {}

  /**
   * テスト作成ミューテーション
   * @param createTestInput - 作成データ
   * @returns テストMutationレスポンス
   */
  @Mutation(() => TestMutationResponse)
  async createTest(
    @Args('createTestInput', { type: () => CreateTestInput })
    createTestInput: CreateTestInput,
  ): Promise<TestMutationResponse> {
    return this.testsService.create(createTestInput);
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
   * Feature別テスト一覧取得クエリ
   * @param featureId - 機能ID
   * @returns テストの一覧
   */
  @Query(() => [Test])
  async testsByFeature(@Args('featureId', { type: () => Int }) featureId: number): Promise<Test[]> {
    return this.testsService.findByFeature(featureId);
  }

  /**
   * テスト取得クエリ
   * @param id - テストID
   * @returns テストまたはnull
   */
  @Query(() => Test, { nullable: true })
  async test(@Args('id', { type: () => Int }) id: number): Promise<Test | null> {
    return this.testsService.findOne(id);
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
   * @param id - テストID
   * @returns テストMutationレスポンス
   */
  @Mutation(() => TestMutationResponse)
  async deleteTest(@Args('id', { type: () => Int }) id: number): Promise<TestMutationResponse> {
    return this.testsService.remove(id);
  }

  /**
   * テストのテストケースフィールドリゾルバー
   * @param test - 親のテストオブジェクト
   * @returns テストケースの一覧
   */
  @ResolveField(() => [TestCase])
  async testCases(@Parent() test: Test): Promise<TestCase[]> {
    return this.testCasesService.findByTest(test.id);
  }
}
