import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { FEATURES_MESSAGES } from '../common/messages/features.messages';
import { PrismaService } from '../prisma/prisma.service';
import { AssignFeatureInput } from './dto/assign-feature.input';
import { CreateFeatureInput } from './dto/create-feature.input';
import { FeatureAssignMutationResponse, FeatureMutationResponse } from './dto/feature-mutation.response';
import { UpdateFeatureInput } from './dto/update-feature.input';
import { Feature } from './models/feature.model';

/**
 * 機能管理サービス
 * 機能のCRUD操作とテストケースへの割り当てを提供します。
 */
@Injectable()
export class FeaturesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(FeaturesService.name);
  }

  /**
   * 機能を作成
   * @param createFeatureInput - 作成データ
   * @returns 機能Mutationレスポンス
   */
  async create(createFeatureInput: CreateFeatureInput): Promise<FeatureMutationResponse> {
    this.logger.info({ name: createFeatureInput.name }, 'Creating feature');

    // 機能名の重複チェック
    const existingFeature = await this.prismaService.feature.findUnique({
      where: { name: createFeatureInput.name },
    });

    if (existingFeature) {
      this.logger.warn({ name: createFeatureInput.name }, 'Feature name already exists');
      return {
        isValid: false,
        message: FEATURES_MESSAGES.FEATURE_NAME_EXISTS(createFeatureInput.name),
        data: null,
      };
    }

    const feature = await this.prismaService.feature.create({
      data: {
        name: createFeatureInput.name,
        description: createFeatureInput.description,
        color: createFeatureInput.color,
      },
    });

    this.logger.info({ featureId: feature.id, name: feature.name }, 'Feature created successfully');

    return {
      isValid: true,
      message: FEATURES_MESSAGES.FEATURE_CREATED,
      data: feature,
    };
  }

  /**
   * すべての機能を取得
   * @returns 機能の一覧
   */
  async findAll(): Promise<Feature[]> {
    this.logger.debug('Fetching all features');

    const features = await this.prismaService.feature.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    this.logger.info({ count: features.length }, 'Fetched all features');

    return features;
  }

  /**
   * 特定の機能を取得
   * @param id - 機能ID
   * @returns 機能またはnull
   */
  async findOne(id: number): Promise<Feature | null> {
    this.logger.debug({ featureId: id }, 'Fetching feature');

    const feature = await this.prismaService.feature.findUnique({
      where: { id },
    });

    return feature;
  }

  /**
   * 機能を更新
   * @param updateFeatureInput - 更新データ
   * @returns 機能Mutationレスポンス
   */
  async update(updateFeatureInput: UpdateFeatureInput): Promise<FeatureMutationResponse> {
    this.logger.info({ featureId: updateFeatureInput.id }, 'Updating feature');

    // 機能の存在確認
    const existingFeature = await this.prismaService.feature.findUnique({
      where: { id: updateFeatureInput.id },
    });

    if (!existingFeature) {
      this.logger.warn({ featureId: updateFeatureInput.id }, 'Feature not found for update');
      return {
        isValid: false,
        message: FEATURES_MESSAGES.FEATURE_NOT_FOUND(updateFeatureInput.id),
        data: null,
      };
    }

    // 機能名の重複チェック（名前を変更する場合のみ）
    if (updateFeatureInput.name && updateFeatureInput.name !== existingFeature.name) {
      const duplicateFeature = await this.prismaService.feature.findUnique({
        where: { name: updateFeatureInput.name },
      });

      if (duplicateFeature) {
        this.logger.warn({ name: updateFeatureInput.name }, 'Feature name already exists');
        return {
          isValid: false,
          message: FEATURES_MESSAGES.FEATURE_NAME_EXISTS(updateFeatureInput.name),
          data: null,
        };
      }
    }

    // 更新データの準備
    const { id: _, ...updateFields } = updateFeatureInput;
    const updateData = Object.fromEntries(Object.entries(updateFields).filter(([, value]) => value !== undefined));

    const feature = await this.prismaService.feature.update({
      where: { id: updateFeatureInput.id },
      data: updateData,
    });

    this.logger.info({ featureId: feature.id }, 'Feature updated successfully');

    return {
      isValid: true,
      message: FEATURES_MESSAGES.FEATURE_UPDATED,
      data: feature,
    };
  }

  /**
   * 機能を削除
   * @param id - 機能ID
   * @returns 機能Mutationレスポンス
   */
  async remove(id: number): Promise<FeatureMutationResponse> {
    this.logger.info({ featureId: id }, 'Deleting feature');

    // 機能の存在確認
    const existingFeature = await this.prismaService.feature.findUnique({
      where: { id },
    });

    if (!existingFeature) {
      this.logger.warn({ featureId: id }, 'Feature not found for deletion');
      return {
        isValid: false,
        message: FEATURES_MESSAGES.FEATURE_NOT_FOUND(id),
        data: null,
      };
    }

    await this.prismaService.feature.delete({
      where: { id },
    });

    this.logger.info({ featureId: id }, 'Feature deleted successfully');

    return {
      isValid: true,
      message: FEATURES_MESSAGES.FEATURE_DELETED,
      data: existingFeature,
    };
  }

  /**
   * テストケースに機能を割り当て
   * @param assignFeatureInput - 割り当てデータ
   * @returns 機能割り当てMutationレスポンス
   */
  async assignFeature(assignFeatureInput: AssignFeatureInput): Promise<FeatureAssignMutationResponse> {
    this.logger.info(
      { testCaseId: assignFeatureInput.testCaseId, featureId: assignFeatureInput.featureId },
      'Assigning feature to test case',
    );

    // テストケースの存在確認
    const testCase = await this.prismaService.testCase.findUnique({
      where: { id: assignFeatureInput.testCaseId },
    });

    if (!testCase) {
      this.logger.warn({ testCaseId: assignFeatureInput.testCaseId }, 'Test case not found');
      return {
        isValid: false,
        message: FEATURES_MESSAGES.TEST_CASE_NOT_FOUND(assignFeatureInput.testCaseId),
        data: null,
      };
    }

    // 機能の存在確認
    const feature = await this.prismaService.feature.findUnique({
      where: { id: assignFeatureInput.featureId },
    });

    if (!feature) {
      this.logger.warn({ featureId: assignFeatureInput.featureId }, 'Feature not found');
      return {
        isValid: false,
        message: FEATURES_MESSAGES.FEATURE_NOT_FOUND(assignFeatureInput.featureId),
        data: null,
      };
    }

    // 既に割り当て済みかチェック
    const existing = await this.prismaService.testCaseFeature.findUnique({
      where: {
        testCaseId_featureId: {
          testCaseId: assignFeatureInput.testCaseId,
          featureId: assignFeatureInput.featureId,
        },
      },
    });

    if (existing) {
      this.logger.warn(
        { testCaseId: assignFeatureInput.testCaseId, featureId: assignFeatureInput.featureId },
        'Feature already assigned to test case',
      );
      return {
        isValid: false,
        message: FEATURES_MESSAGES.FEATURE_ALREADY_ASSIGNED,
        data: null,
      };
    }

    await this.prismaService.testCaseFeature.create({
      data: {
        testCaseId: assignFeatureInput.testCaseId,
        featureId: assignFeatureInput.featureId,
      },
    });

    // 更新後のテストケースを取得
    const updatedTestCase = await this.prismaService.testCase.findUnique({
      where: { id: assignFeatureInput.testCaseId },
      include: {
        createdBy: true,
      },
    });

    this.logger.info(
      { testCaseId: assignFeatureInput.testCaseId, featureId: assignFeatureInput.featureId },
      'Feature assigned to test case successfully',
    );

    return {
      isValid: true,
      message: FEATURES_MESSAGES.FEATURE_ASSIGNED,
      data: updatedTestCase,
    };
  }

  /**
   * テストケースから機能を削除
   * @param testCaseId - テストケースID
   * @param featureId - 機能ID
   * @returns 機能割り当てMutationレスポンス
   */
  async unassignFeature(testCaseId: number, featureId: number): Promise<FeatureAssignMutationResponse> {
    this.logger.info({ testCaseId, featureId }, 'Unassigning feature from test case');

    // 割り当ての存在確認
    const existing = await this.prismaService.testCaseFeature.findUnique({
      where: {
        testCaseId_featureId: {
          testCaseId,
          featureId,
        },
      },
    });

    if (!existing) {
      this.logger.warn({ testCaseId, featureId }, 'Feature assignment not found');
      return {
        isValid: false,
        message: FEATURES_MESSAGES.FEATURE_NOT_ASSIGNED,
        data: null,
      };
    }

    await this.prismaService.testCaseFeature.delete({
      where: {
        testCaseId_featureId: {
          testCaseId,
          featureId,
        },
      },
    });

    // 更新後のテストケースを取得
    const updatedTestCase = await this.prismaService.testCase.findUnique({
      where: { id: testCaseId },
      include: {
        createdBy: true,
      },
    });

    this.logger.info({ testCaseId, featureId }, 'Feature unassigned from test case successfully');

    return {
      isValid: true,
      message: FEATURES_MESSAGES.FEATURE_UNASSIGNED,
      data: updatedTestCase,
    };
  }

  /**
   * テストケースに割り当てられている機能を取得
   * @param testCaseId - テストケースID
   * @returns 機能の一覧
   */
  async getFeaturesByTestCase(testCaseId: number): Promise<Feature[]> {
    this.logger.debug({ testCaseId }, 'Fetching features for test case');

    const testCaseFeatures = await this.prismaService.testCaseFeature.findMany({
      where: { testCaseId },
      include: { feature: true },
    });

    const features = testCaseFeatures.map((testCaseFeature) => testCaseFeature.feature);

    this.logger.debug({ testCaseId, count: features.length }, 'Features fetched for test case');

    return features;
  }

  /**
   * 機能に割り当てられているテストケースを取得
   * @param featureId - 機能ID
   * @returns テストケースの一覧
   */
  async getTestCasesByFeature(featureId: number) {
    this.logger.debug({ featureId }, 'Fetching test cases for feature');

    const testCaseFeatures = await this.prismaService.testCaseFeature.findMany({
      where: { featureId },
      include: {
        testCase: {
          include: {
            createdBy: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    const testCases = testCaseFeatures.map((testCaseFeature) => {
      const testCase = testCaseFeature.testCase;
      return {
        ...testCase,
        tags: testCase.tags.map((testCaseTag) => testCaseTag.tag),
      };
    });

    this.logger.debug({ featureId, count: testCases.length }, 'Test cases fetched for feature');

    return testCases;
  }
}
