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

    // 機能内での次のIDを生成（連番）
    const maxTest = await this.prismaService.test.findFirst({
      where: { featureId: createTestInput.featureId },
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const nextId = maxTest ? maxTest.id + 1 : 1;

    const test = await this.prismaService.test.create({
      data: {
        id: nextId,
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
   * @param featureId - 機能ID
   * @param id - テストID（機能内での連番）
   * @returns テストまたはnull
   */
  async findOne(featureId: number, id: number): Promise<Test | null> {
    this.logger.debug({ featureId, testId: id }, 'Fetching test');

    const test = await this.prismaService.test.findUnique({
      where: {
        featureId_id: {
          featureId,
          id,
        },
      },
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
    this.logger.info({ featureId: updateTestInput.featureId, testId: updateTestInput.id }, 'Updating test');

    // テストの存在確認
    const existingTest = await this.prismaService.test.findUnique({
      where: {
        featureId_id: {
          featureId: updateTestInput.featureId,
          id: updateTestInput.id,
        },
      },
      include: {
        feature: true,
      },
    });

    if (!existingTest) {
      this.logger.warn({ featureId: updateTestInput.featureId, testId: updateTestInput.id }, 'Test not found for update');
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
          featureId: updateTestInput.featureId,
          name: updateTestInput.name,
          NOT: {
            id: updateTestInput.id,
          },
        },
      });

      if (duplicateTest) {
        this.logger.warn(
          { name: updateTestInput.name, featureId: updateTestInput.featureId },
          'Test name already exists in this feature',
        );
        return {
          isValid: false,
          message: TESTS_MESSAGES.TEST_NAME_EXISTS_IN_FEATURE(updateTestInput.name, updateTestInput.featureId),
          data: null,
        };
      }
    }

    // 更新データの準備（id, featureIdを除外し、undefinedのフィールドは除外）
    const { id: _, featureId: __, ...updateFields } = updateTestInput;
    const updateData = Object.fromEntries(Object.entries(updateFields).filter(([, value]) => value !== undefined));

    const test = await this.prismaService.test.update({
      where: {
        featureId_id: {
          featureId: updateTestInput.featureId,
          id: updateTestInput.id,
        },
      },
      data: updateData,
      include: {
        feature: true,
        createdBy: true,
      },
    });

    this.logger.info({ featureId: test.featureId, testId: test.id }, 'Test updated successfully');

    return {
      isValid: true,
      message: TESTS_MESSAGES.TEST_UPDATED,
      data: test,
    };
  }

  /**
   * テストを削除
   * @param featureId - 機能ID
   * @param id - テストID（機能内での連番）
   * @returns テストMutationレスポンス
   */
  async remove(featureId: number, id: number): Promise<TestMutationResponse> {
    this.logger.info({ featureId, testId: id }, 'Deleting test');

    // テストの存在確認
    const existingTest = await this.prismaService.test.findUnique({
      where: {
        featureId_id: {
          featureId,
          id,
        },
      },
      include: {
        feature: true,
        createdBy: true,
      },
    });

    if (!existingTest) {
      this.logger.warn({ featureId, testId: id }, 'Test not found for deletion');
      return {
        isValid: false,
        message: TESTS_MESSAGES.TEST_NOT_FOUND(id),
        data: null,
      };
    }

    await this.prismaService.test.delete({
      where: {
        featureId_id: {
          featureId,
          id,
        },
      },
    });

    this.logger.info({ featureId, testId: id }, 'Test deleted successfully');

    return {
      isValid: true,
      message: TESTS_MESSAGES.TEST_DELETED,
      data: existingTest,
    };
  }
}
