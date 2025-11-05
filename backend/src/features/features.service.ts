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

  // ===================================================================
  // 以下のメソッドは旧構造（TestCaseFeature）用なので非推奨です
  // 新構造ではTestはFeatureに直接属し、TestCaseはTestに属します
  // ===================================================================

  /*
  async assignFeature(assignFeatureInput: AssignFeatureInput): Promise<FeatureAssignMutationResponse> {
    // 旧構造用のメソッド - 非推奨
    throw new Error('This method is deprecated. Use the new Test structure instead.');
  }

  async unassignFeature(testCaseId: number, featureId: number): Promise<FeatureAssignMutationResponse> {
    // 旧構造用のメソッド - 非推奨
    throw new Error('This method is deprecated. Use the new Test structure instead.');
  }

  async getFeaturesByTestCase(testCaseId: number): Promise<Feature[]> {
    // 旧構造用のメソッド - 非推奨
    throw new Error('This method is deprecated. Use the new Test structure instead.');
  }

  async getTestCasesByFeature(featureId: number) {
    // 旧構造用のメソッド - 非推奨
    throw new Error('This method is deprecated. Use the new Test structure instead.');
  }
  */
}
