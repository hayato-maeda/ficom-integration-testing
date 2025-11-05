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
    this.logger.info({ featureId: createTestInput.featureId, name: createTestInput.name }, 'Creating test');

    // Feature の存在確認
    const feature = await this.prismaService.feature.findUnique({
      where: { id: createTestInput.featureId },
    });

    if (!feature) {
      this.logger.warn({ featureId: createTestInput.featureId }, 'Feature not found');
      return {
        isValid: false,
        message: `Feature with ID ${createTestInput.featureId} not found`,
        data: null,
      };
    }

    const test = await this.prismaService.test.create({
      data: {
        featureId: createTestInput.featureId,
        name: createTestInput.name,
        description: createTestInput.description,
      },
      include: {
        feature: true,
      },
    });

    this.logger.info({ testId: test.id, featureId: test.featureId }, 'Test created successfully');

    return {
      isValid: true,
      message: 'Test created successfully',
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.info({ count: tests.length }, 'Fetched all tests');

    return tests;
  }

  /**
   * Featureに紐づくテストを取得
   * @param featureId - 機能ID
   * @returns テストの一覧
   */
  async findByFeature(featureId: number): Promise<Test[]> {
    this.logger.debug({ featureId }, 'Fetching tests by feature');

    const tests = await this.prismaService.test.findMany({
      where: { featureId },
      include: {
        feature: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.info({ featureId, count: tests.length }, 'Fetched tests by feature');

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
      },
    });

    this.logger.info({ fetchedTest: test }, 'Fetched test');

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
        message: `Test with ID ${updateTestInput.id} not found`,
        data: null,
      };
    }

    // 更新データの準備（idを除外し、undefinedのフィールドは除外）
    const { id: _id, ...updateFields } = updateTestInput;
    const updateData = Object.fromEntries(Object.entries(updateFields).filter(([_, value]) => value !== undefined));

    const test = await this.prismaService.test.update({
      where: { id: updateTestInput.id },
      data: updateData,
      include: {
        feature: true,
      },
    });

    this.logger.info({ testId: test.id }, 'Test updated successfully');

    return {
      isValid: true,
      message: 'Test updated successfully',
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
      },
    });

    if (!existingTest) {
      this.logger.warn({ testId: id }, 'Test not found for deletion');
      return {
        isValid: false,
        message: `Test with ID ${id} not found`,
        data: null,
      };
    }

    await this.prismaService.test.delete({
      where: { id },
    });

    this.logger.info({ testId: id }, 'Test deleted successfully');

    return {
      isValid: true,
      message: 'Test deleted successfully',
      data: existingTest,
    };
  }
}
