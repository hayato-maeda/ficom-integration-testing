import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { TESTS_MESSAGES } from '../common/messages/tests.messages';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestInput } from './dto/create-test.input';
import { TestMutationResponse } from './dto/test-mutation.response';
import { UpdateTestInput } from './dto/update-test.input';
import { Test } from './models/test.model';

/**
 * テスト管理サービス
 * テストのCRUD操作を提供します。
 */
@Injectable()
export class TestsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TestsService.name);
  }

  /**
   * テストを作成
   * @param createTestInput - 作成データ
   * @param userId - 作成ユーザーID
   * @returns テストMutationレスポンス
   */
  async create(createTestInput: CreateTestInput, userId: number): Promise<TestMutationResponse> {
    this.logger.info({ name: createTestInput.name, featureId: createTestInput.featureId }, 'Creating test');

    // 機能の存在確認
    const feature = await this.prismaService.feature.findUnique({
      where: { id: createTestInput.featureId },
    });

    if (!feature) {
      this.logger.warn({ featureId: createTestInput.featureId }, 'Feature not found');
      return {
        isValid: false,
        message: TESTS_MESSAGES.FEATURE_NOT_FOUND(createTestInput.featureId),
        data: null,
      };
    }

    // 同じ機能内でのテスト名の重複チェック
    const existingTest = await this.prismaService.test.findFirst({
      where: {
        featureId: createTestInput.featureId,
        name: createTestInput.name,
      },
    });

    if (existingTest) {
      this.logger.warn(
        { name: createTestInput.name, featureId: createTestInput.featureId },
        'Test name already exists in this feature',
      );
      return {
        isValid: false,
        message: TESTS_MESSAGES.TEST_NAME_EXISTS_IN_FEATURE(createTestInput.name, createTestInput.featureId),
        data: null,
      };
    }

    const test = await this.prismaService.test.create({
      data: {
        featureId: createTestInput.featureId,
        name: createTestInput.name,
        description: createTestInput.description,
        status: createTestInput.status || 'DRAFT',
        createdById: userId,
      },
      include: {
        feature: true,
        createdBy: true,
      },
    });

    this.logger.info({ testId: test.id, name: test.name }, 'Test created successfully');

    return {
      isValid: true,
      message: TESTS_MESSAGES.TEST_CREATED,
      data: test,
    };
  }

  /**
   * すべてのテストを取得
   * @returns テストの一覧
   */
  async findAll(): Promise<Test[]> {
    this.logger.debug('Fetching all tests');

    const tests = await this.prismaService.test.findMany({
      include: {
        feature: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.info({ count: tests.length }, 'Fetched all tests');

    return tests;
  }

  /**
   * 特定のテストを取得
   * @param id - テストID
   * @returns テストまたはnull
   */
  async findOne(id: number): Promise<Test | null> {
    this.logger.debug({ testId: id }, 'Fetching test');

    const test = await this.prismaService.test.findUnique({
      where: { id },
      include: {
        feature: true,
        createdBy: true,
      },
    });

    return test;
  }

  /**
   * 機能に属するテストを取得
   * @param featureId - 機能ID
   * @returns テストの一覧
   */
  async findByFeature(featureId: number): Promise<Test[]> {
    this.logger.debug({ featureId }, 'Fetching tests by feature');

    const tests = await this.prismaService.test.findMany({
      where: { featureId },
      include: {
        feature: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.debug({ featureId, count: tests.length }, 'Tests fetched for feature');

    return tests;
  }

  /**
   * テストを更新
   * @param updateTestInput - 更新データ
   * @returns テストMutationレスポンス
   */
  async update(updateTestInput: UpdateTestInput): Promise<TestMutationResponse> {
    this.logger.info({ testId: updateTestInput.id }, 'Updating test');

    // テストの存在確認
    const existingTest = await this.prismaService.test.findUnique({
      where: { id: updateTestInput.id },
      include: {
        feature: true,
      },
    });

    if (!existingTest) {
      this.logger.warn({ testId: updateTestInput.id }, 'Test not found for update');
      return {
        isValid: false,
        message: TESTS_MESSAGES.TEST_NOT_FOUND(updateTestInput.id),
        data: null,
      };
    }

    // テスト名の重複チェック（名前を変更する場合のみ）
    if (updateTestInput.name && updateTestInput.name !== existingTest.name) {
      const duplicateTest = await this.prismaService.test.findFirst({
        where: {
          featureId: existingTest.featureId,
          name: updateTestInput.name,
          id: { not: updateTestInput.id },
        },
      });

      if (duplicateTest) {
        this.logger.warn(
          { name: updateTestInput.name, featureId: existingTest.featureId },
          'Test name already exists in this feature',
        );
        return {
          isValid: false,
          message: TESTS_MESSAGES.TEST_NAME_EXISTS_IN_FEATURE(updateTestInput.name, existingTest.featureId),
          data: null,
        };
      }
    }

    // 更新データの準備
    const { id: _, ...updateFields } = updateTestInput;
    const updateData = Object.fromEntries(Object.entries(updateFields).filter(([, value]) => value !== undefined));

    const test = await this.prismaService.test.update({
      where: { id: updateTestInput.id },
      data: updateData,
      include: {
        feature: true,
        createdBy: true,
      },
    });

    this.logger.info({ testId: test.id }, 'Test updated successfully');

    return {
      isValid: true,
      message: TESTS_MESSAGES.TEST_UPDATED,
      data: test,
    };
  }

  /**
   * テストを削除
   * @param id - テストID
   * @returns テストMutationレスポンス
   */
  async remove(id: number): Promise<TestMutationResponse> {
    this.logger.info({ testId: id }, 'Deleting test');

    // テストの存在確認
    const existingTest = await this.prismaService.test.findUnique({
      where: { id },
      include: {
        feature: true,
        createdBy: true,
      },
    });

    if (!existingTest) {
      this.logger.warn({ testId: id }, 'Test not found for deletion');
      return {
        isValid: false,
        message: TESTS_MESSAGES.TEST_NOT_FOUND(id),
        data: null,
      };
    }

    await this.prismaService.test.delete({
      where: { id },
    });

    this.logger.info({ testId: id }, 'Test deleted successfully');

    return {
      isValid: true,
      message: TESTS_MESSAGES.TEST_DELETED,
      data: existingTest,
    };
  }
}
