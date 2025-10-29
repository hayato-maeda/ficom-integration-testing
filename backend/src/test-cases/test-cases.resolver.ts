import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from '../users/models/user.model';
import { CreateTestCaseInput } from './dto/create-test-case.input';
import { UpdateTestCaseInput } from './dto/update-test-case.input';
import { TestCase } from './models/test-case.model';
import { TestCasesService } from './test-cases.service';

/**
 * テストケースリゾルバー
 * GraphQL のテストケース関連のクエリとミューテーションを処理します。
 */
@Resolver(() => TestCase)
@UseGuards(GqlAuthGuard)
export class TestCasesResolver {
  constructor(private readonly testCasesService: TestCasesService) {}

  /**
   * テストケース作成ミューテーション
   * @param createTestCaseInput - 作成データ
   * @param user - 現在のユーザー
   * @returns 作成されたテストケース
   */
  @Mutation(() => TestCase)
  async createTestCase(
    @Args('createTestCaseInput', { type: () => CreateTestCaseInput })
    createTestCaseInput: CreateTestCaseInput,
    @CurrentUser() user: User,
  ): Promise<TestCase> {
    return this.testCasesService.create(createTestCaseInput, user.id);
  }

  /**
   * テストケース一覧取得クエリ
   * @returns テストケースの一覧
   */
  @Query(() => [TestCase])
  async testCases(): Promise<TestCase[]> {
    return this.testCasesService.findAll();
  }

  /**
   * テストケース取得クエリ
   * @param id - テストケースID
   * @returns テストケース
   */
  @Query(() => TestCase)
  async testCase(@Args('id', { type: () => ID }) id: number): Promise<TestCase> {
    return this.testCasesService.findOne(id);
  }

  /**
   * テストケース更新ミューテーション
   * @param updateTestCaseInput - 更新データ
   * @param user - 現在のユーザー
   * @returns 更新されたテストケース
   */
  @Mutation(() => TestCase)
  async updateTestCase(
    @Args('updateTestCaseInput', { type: () => UpdateTestCaseInput })
    updateTestCaseInput: UpdateTestCaseInput,
    @CurrentUser() user: User,
  ): Promise<TestCase> {
    return this.testCasesService.update(updateTestCaseInput, user.id);
  }

  /**
   * テストケース削除ミューテーション
   * @param id - テストケースID
   * @param user - 現在のユーザー
   * @returns 削除されたテストケース
   */
  @Mutation(() => TestCase)
  async deleteTestCase(@Args('id', { type: () => ID }) id: number, @CurrentUser() user: User): Promise<TestCase> {
    return this.testCasesService.remove(id, user.id);
  }
}
