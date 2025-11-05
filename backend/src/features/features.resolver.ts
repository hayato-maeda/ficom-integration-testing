import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlSessionGuard } from '../auth/guards/gql-session.guard';
import { TestCase } from '../test-cases/models/test-case.model';
import { Test } from '../tests/models/test.model';
import { TestsService } from '../tests/tests.service';
import { AssignFeatureInput } from './dto/assign-feature.input';
import { CreateFeatureInput } from './dto/create-feature.input';
import { FeatureAssignMutationResponse, FeatureMutationResponse } from './dto/feature-mutation.response';
import { UpdateFeatureInput } from './dto/update-feature.input';
import { FeaturesService } from './features.service';
import { Feature } from './models/feature.model';

/**
 * 機能リゾルバー
 * GraphQL の機能関連のクエリとミューテーションを処理します。
 */
@Resolver(() => Feature)
@UseGuards(GqlSessionGuard)
export class FeaturesResolver {
  constructor(
    private readonly featuresService: FeaturesService,
    private readonly testsService: TestsService,
  ) {}

  /**
   * 機能作成ミューテーション
   * @param createFeatureInput - 作成データ
   * @returns 機能Mutationレスポンス
   */
  @Mutation(() => FeatureMutationResponse)
  async createFeature(
    @Args('createFeatureInput', { type: () => CreateFeatureInput })
    createFeatureInput: CreateFeatureInput,
  ): Promise<FeatureMutationResponse> {
    return this.featuresService.create(createFeatureInput);
  }

  /**
   * 機能一覧取得クエリ
   * @returns 機能の一覧
   */
  @Query(() => [Feature])
  async features(): Promise<Feature[]> {
    return this.featuresService.findAll();
  }

  /**
   * 機能取得クエリ
   * @param id - 機能ID
   * @returns 機能またはnull
   */
  @Query(() => Feature, { nullable: true })
  async feature(@Args('id', { type: () => Int }) id: number): Promise<Feature | null> {
    return this.featuresService.findOne(id);
  }

  /**
   * 機能更新ミューテーション
   * @param updateFeatureInput - 更新データ
   * @returns 機能Mutationレスポンス
   */
  @Mutation(() => FeatureMutationResponse)
  async updateFeature(
    @Args('updateFeatureInput', { type: () => UpdateFeatureInput })
    updateFeatureInput: UpdateFeatureInput,
  ): Promise<FeatureMutationResponse> {
    return this.featuresService.update(updateFeatureInput);
  }

  /**
   * 機能削除ミューテーション
   * @param id - 機能ID
   * @returns 機能Mutationレスポンス
   */
  @Mutation(() => FeatureMutationResponse)
  async deleteFeature(@Args('id', { type: () => Int }) id: number): Promise<FeatureMutationResponse> {
    return this.featuresService.remove(id);
  }

  /**
   * テストケースへの機能割り当てミューテーション
   * @param assignFeatureInput - 割り当てデータ
   * @returns 機能割り当てMutationレスポンス
   */
  @Mutation(() => FeatureAssignMutationResponse)
  async assignFeature(
    @Args('assignFeatureInput', { type: () => AssignFeatureInput })
    assignFeatureInput: AssignFeatureInput,
  ): Promise<FeatureAssignMutationResponse> {
    return this.featuresService.assignFeature(assignFeatureInput);
  }

  /**
   * テストケースからの機能削除ミューテーション
   * @param testCaseId - テストケースID
   * @param featureId - 機能ID
   * @returns 機能割り当てMutationレスポンス
   */
  @Mutation(() => FeatureAssignMutationResponse)
  async unassignFeature(
    @Args('testCaseId', { type: () => Int }) testCaseId: number,
    @Args('featureId', { type: () => Int }) featureId: number,
  ): Promise<FeatureAssignMutationResponse> {
    return this.featuresService.unassignFeature(testCaseId, featureId);
  }

  /**
   * テストケースに割り当てられている機能取得クエリ
   * @param testCaseId - テストケースID
   * @returns 機能の一覧
   */
  @Query(() => [Feature])
  async featuresByTestCase(@Args('testCaseId', { type: () => Int }) testCaseId: number): Promise<Feature[]> {
    return this.featuresService.getFeaturesByTestCase(testCaseId);
  }

  /**
   * 機能に割り当てられているテストケース取得クエリ
   * @param featureId - 機能ID
   * @returns テストケースの一覧
   */
  @Query(() => [TestCase])
  async testCasesByFeature(@Args('featureId', { type: () => Int }) featureId: number): Promise<TestCase[]> {
    return this.featuresService.getTestCasesByFeature(featureId);
  }

  /**
   * 機能に紐づくテスト取得クエリ
   * @param featureId - 機能ID
   * @returns テストの一覧
   */
  @Query(() => [Test])
  async testsByFeature(@Args('featureId', { type: () => Int }) featureId: number): Promise<Test[]> {
    return this.testsService.getTestsByFeature(featureId);
  }
}
