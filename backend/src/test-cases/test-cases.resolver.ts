import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlSessionGuard } from '../auth/guards/gql-session.guard';
import { Feature } from '../features/models/feature.model';
import { FeaturesService } from '../features/features.service';
import { FilesService } from '../files/files.service';
import { File } from '../files/models/file.model';
import { Tag } from '../tags/models/tag.model';
import { TagsService } from '../tags/tags.service';
import { User } from '../users/models/user.model';
import { CreateTestCaseInput } from './dto/create-test-case.input';
import { TestCaseMutationResponse } from './dto/test-case-mutation.response';
import { UpdateTestCaseInput } from './dto/update-test-case.input';
import { TestCase } from './models/test-case.model';
import { TestCasesService } from './test-cases.service';

/**
 * テストケースリゾルバー
 * GraphQL のテストケース関連のクエリとミューテーションを処理します。
 */
@Resolver(() => TestCase)
@UseGuards(GqlSessionGuard)
export class TestCasesResolver {
  constructor(
    private readonly testCasesService: TestCasesService,
    private readonly tagsService: TagsService,
    private readonly filesService: FilesService,
    private readonly featuresService: FeaturesService,
  ) {}

  /**
   * テストケース作成ミューテーション
   * @param createTestCaseInput - 作成データ
   * @param user - 現在のユーザー
   * @returns テストケースMutationレスポンス
   */
  @Mutation(() => TestCaseMutationResponse)
  async createTestCase(
    @Args('createTestCaseInput', { type: () => CreateTestCaseInput })
    createTestCaseInput: CreateTestCaseInput,
    @CurrentUser() user: User,
  ): Promise<TestCaseMutationResponse> {
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
   * @param testFeatureId - 機能ID
   * @param testId - テストID
   * @param id - テストケースID
   * @returns テストケースまたはnull
   */
  @Query(() => TestCase, { nullable: true })
  async testCase(
    @Args('testFeatureId', { type: () => Int }) testFeatureId: number,
    @Args('testId', { type: () => Int }) testId: number,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<TestCase | null> {
    return this.testCasesService.findOne(testFeatureId, testId, id);
  }

  /**
   * テストケース更新ミューテーション
   * @param updateTestCaseInput - 更新データ
   * @param user - 現在のユーザー
   * @returns テストケースMutationレスポンス
   */
  @Mutation(() => TestCaseMutationResponse)
  async updateTestCase(
    @Args('updateTestCaseInput', { type: () => UpdateTestCaseInput })
    updateTestCaseInput: UpdateTestCaseInput,
    @CurrentUser() user: User,
  ): Promise<TestCaseMutationResponse> {
    return this.testCasesService.update(updateTestCaseInput, user.id);
  }

  /**
   * テストケース削除ミューテーション
   * @param testFeatureId - 機能ID
   * @param testId - テストID
   * @param id - テストケースID
   * @param user - 現在のユーザー
   * @returns テストケースMutationレスポンス
   */
  @Mutation(() => TestCaseMutationResponse)
  async deleteTestCase(
    @Args('testFeatureId', { type: () => Int }) testFeatureId: number,
    @Args('testId', { type: () => Int }) testId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<TestCaseMutationResponse> {
    return this.testCasesService.remove(testFeatureId, testId, id, user.id);
  }

  /**
   * テストケースのタグフィールドリゾルバー
   * @param testCase - 親のテストケースオブジェクト
   * @returns タグの一覧
   */
  @ResolveField(() => [Tag])
  async tags(@Parent() testCase: TestCase): Promise<Tag[]> {
    return this.tagsService.getTagsByTestCase(testCase.testFeatureId, testCase.testId, testCase.id);
  }

  /**
   * テストケースの機能フィールドリゾルバー
   * @param testCase - 親のテストケースオブジェクト
   * @returns 機能の一覧
   */
  @ResolveField(() => [Feature])
  async features(@Parent() testCase: TestCase): Promise<Feature[]> {
    return this.featuresService.getFeaturesByTestCase(testCase.testFeatureId, testCase.testId, testCase.id);
  }

  /**
   * テストケースのファイルフィールドリゾルバー
   * @param testCase - 親のテストケースオブジェクト
   * @returns ファイルの一覧
   */
  @ResolveField(() => [File])
  async files(@Parent() testCase: TestCase): Promise<File[]> {
    return this.filesService.findByTestCase(testCase.testFeatureId, testCase.testId, testCase.id);
  }
}
