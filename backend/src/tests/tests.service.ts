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

    const test = await this.prismaService.test.create({
      data: {
        featureId: createTestInput.featureId,
        title: createTestInput.title,
        description: createTestInput.description,
      },
    });

    this.logger.info({ testId: test.id, title: test.title }, 'Test created successfully');

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
   * @param id - テストID
   * @returns テストまたはnull
   */
  async findOne(id: number): Promise<Test | null> {
    this.logger.debug({ testId: id }, 'Fetching test');

    const test = await this.prismaService.test.findUnique({
      where: { id },
    });

    return test;
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
    });

    if (!existingTest) {
      this.logger.warn({ testId: updateTestInput.id }, 'Test not found for update');
      return {
        isValid: false,
        message: `テストID ${updateTestInput.id} が見つかりません`,
        data: null,
      };
    }

    // 更新データの準備
    const { id: _, ...updateFields } = updateTestInput;
    const updateData = Object.fromEntries(Object.entries(updateFields).filter(([, value]) => value !== undefined));

    const test = await this.prismaService.test.update({
      where: { id: updateTestInput.id },
      data: updateData,
    });

    this.logger.info({ testId: test.id }, 'Test updated successfully');

    return {
      isValid: true,
      message: 'テストが更新されました',
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
    });

    if (!existingTest) {
      this.logger.warn({ testId: id }, 'Test not found for deletion');
      return {
        isValid: false,
        message: `テストID ${id} が見つかりません`,
        data: null,
      };
    }

    await this.prismaService.test.delete({
      where: { id },
    });

    this.logger.info({ testId: id }, 'Test deleted successfully');

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
   * @param testId - テストID
   * @returns テストケースの一覧
   */
  async getTestCasesByTest(testId: number) {
    this.logger.debug({ testId }, 'Fetching test cases for test');

    const testCases = await this.prismaService.testCase.findMany({
      where: { testId },
      include: {
        createdBy: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedTestCases = testCases.map((testCase) => ({
      ...testCase,
      tags: testCase.tags.map((testCaseTag) => testCaseTag.tag),
    }));

    this.logger.debug({ testId, count: testCases.length }, 'Test cases fetched for test');

    return formattedTestCases;
  }
}
