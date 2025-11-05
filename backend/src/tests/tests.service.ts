import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
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
   * @returns テストMutationレスポンス
   */
  async create(createTestInput: CreateTestInput): Promise<TestMutationResponse> {
    this.logger.info({ featureId: createTestInput.featureId, title: createTestInput.title }, 'Creating test');

    // 機能の存在確認
    const feature = await this.prismaService.feature.findUnique({
      where: { id: createTestInput.featureId },
    });

    if (!feature) {
      this.logger.warn({ featureId: createTestInput.featureId }, 'Feature not found');
      return {
        isValid: false,
        message: `機能ID ${createTestInput.featureId} が見つかりません`,
        data: null,
      };
    }

    // Feature内での次のID番号を計算
    const existingTests = await this.prismaService.test.findMany({
      where: { featureId: createTestInput.featureId },
      orderBy: { id: 'desc' },
      take: 1,
    });

    const nextId = existingTests.length > 0 ? existingTests[0].id + 1 : 1;

    const test = await this.prismaService.test.create({
      data: {
        featureId: createTestInput.featureId,
        id: nextId,
        title: createTestInput.title,
        description: createTestInput.description,
      },
    });

    this.logger.info({ featureId: test.featureId, testId: test.id, title: test.title }, 'Test created successfully');

    return {
      isValid: true,
      message: 'テストが作成されました',
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
   * @param id - テストID
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
    });

    return test;
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
    });

    if (!existingTest) {
      this.logger.warn({ featureId: updateTestInput.featureId, testId: updateTestInput.id }, 'Test not found for update');
      return {
        isValid: false,
        message: `テスト（機能ID: ${updateTestInput.featureId}, テストID: ${updateTestInput.id}）が見つかりません`,
        data: null,
      };
    }

    // 更新データの準備（featureIdとidを除外）
    const { featureId: _, id: __, ...updateFields } = updateTestInput;
    const updateData = Object.fromEntries(Object.entries(updateFields).filter(([, value]) => value !== undefined));

    const test = await this.prismaService.test.update({
      where: {
        featureId_id: {
          featureId: updateTestInput.featureId,
          id: updateTestInput.id,
        },
      },
      data: updateData,
    });

    this.logger.info({ featureId: test.featureId, testId: test.id }, 'Test updated successfully');

    return {
      isValid: true,
      message: 'テストが更新されました',
      data: test,
    };
  }

  /**
   * テストを削除
   * @param featureId - 機能ID
   * @param id - テストID
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
    });

    if (!existingTest) {
      this.logger.warn({ featureId, testId: id }, 'Test not found for deletion');
      return {
        isValid: false,
        message: `テスト（機能ID: ${featureId}, テストID: ${id}）が見つかりません`,
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
      message: 'テストが削除されました',
      data: existingTest,
    };
  }

  /**
   * 機能に紐づくテストを取得
   * @param featureId - 機能ID
   * @returns テストの一覧
   */
  async getTestsByFeature(featureId: number): Promise<Test[]> {
    this.logger.debug({ featureId }, 'Fetching tests for feature');

    const tests = await this.prismaService.test.findMany({
      where: { featureId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.debug({ featureId, count: tests.length }, 'Tests fetched for feature');

    return tests;
  }

  /**
   * テストに紐づくテストケースを取得
   * @param featureId - 機能ID
   * @param testId - テストID
   * @returns テストケースの一覧
   */
  async getTestCasesByTest(featureId: number, testId: number) {
    this.logger.debug({ featureId, testId }, 'Fetching test cases for test');

    const testCases = await this.prismaService.testCase.findMany({
      where: {
        testFeatureId: featureId,
        testId: testId,
      },
      include: {
        createdBy: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formattedTestCases = testCases.map((testCase) => ({
      ...testCase,
      tags: testCase.tags.map((testCaseTag) => testCaseTag.tag),
    }));

    this.logger.debug({ featureId, testId, count: testCases.length }, 'Test cases fetched for test');

    return formattedTestCases;
  }
}
