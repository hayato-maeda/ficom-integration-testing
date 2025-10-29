import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestCaseInput } from './dto/create-test-case.input';
import { UpdateTestCaseInput } from './dto/update-test-case.input';
import { TestCase } from './models/test-case.model';

/**
 * テストケース管理サービス
 * テストケースのCRUD操作を提供します。
 */
@Injectable()
export class TestCasesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TestCasesService.name);
  }

  /**
   * テストケースを作成
   * @param createTestCaseInput - 作成データ
   * @param userId - 作成者のユーザーID
   * @returns 作成されたテストケース
   */
  async create(createTestCaseInput: CreateTestCaseInput, userId: number): Promise<TestCase> {
    this.logger.info({ userId, title: createTestCaseInput.title }, 'Creating test case');

    const testCase = await this.prismaService.testCase.create({
      data: {
        title: createTestCaseInput.title,
        description: createTestCaseInput.description,
        steps: createTestCaseInput.steps,
        expectedResult: createTestCaseInput.expectedResult,
        actualResult: createTestCaseInput.actualResult,
        createdById: userId,
      },
      include: {
        createdBy: true,
      },
    });

    this.logger.info({ testCaseId: testCase.id, userId }, 'Test case created successfully');

    return testCase;
  }

  /**
   * すべてのテストケースを取得
   * @returns テストケースの一覧
   */
  async findAll(): Promise<TestCase[]> {
    this.logger.debug('Fetching all test cases');

    const testCases = await this.prismaService.testCase.findMany({
      include: {
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.info({ count: testCases.length }, 'Fetched all test cases');

    return testCases;
  }

  /**
   * 特定のテストケースを取得
   * @param id - テストケースID
   * @returns テストケース
   * @throws NotFoundException - テストケースが見つからない場合
   */
  async findOne(id: number): Promise<TestCase> {
    this.logger.debug({ testCaseId: id }, 'Fetching test case');

    const testCase = await this.prismaService.testCase.findUnique({
      where: { id },
      include: {
        createdBy: true,
      },
    });

    if (!testCase) {
      this.logger.warn({ testCaseId: id }, 'Test case not found');
      throw new NotFoundException(`Test case with ID ${id} not found`);
    }

    this.logger.debug({ testCaseId: id }, 'Test case fetched successfully');

    return testCase;
  }

  /**
   * テストケースを更新
   * @param updateTestCaseInput - 更新データ
   * @param userId - 更新を行うユーザーID
   * @returns 更新されたテストケース
   * @throws NotFoundException - テストケースが見つからない場合
   * @throws UnauthorizedException - 作成者以外が更新しようとした場合
   */
  async update(updateTestCaseInput: UpdateTestCaseInput, userId: number): Promise<TestCase> {
    this.logger.info({ testCaseId: updateTestCaseInput.id, userId }, 'Updating test case');

    // テストケースの存在確認
    const existingTestCase = await this.prismaService.testCase.findUnique({
      where: { id: updateTestCaseInput.id },
    });

    if (!existingTestCase) {
      this.logger.warn({ testCaseId: updateTestCaseInput.id }, 'Test case not found for update');
      throw new NotFoundException(`Test case with ID ${updateTestCaseInput.id} not found`);
    }

    // 作成者のみ更新可能
    if (existingTestCase.createdById !== userId) {
      this.logger.warn(
        { testCaseId: updateTestCaseInput.id, userId, createdById: existingTestCase.createdById },
        'Unauthorized update attempt',
      );
      throw new UnauthorizedException('Only the creator can update this test case');
    }

    // 更新データの準備（idを除外し、undefinedのフィールドは除外）
    const { id: _id, ...updateFields } = updateTestCaseInput;
    const updateData = Object.fromEntries(Object.entries(updateFields).filter(([_, value]) => value !== undefined));

    const testCase = await this.prismaService.testCase.update({
      where: { id: updateTestCaseInput.id },
      data: updateData,
      include: {
        createdBy: true,
      },
    });

    this.logger.info({ testCaseId: testCase.id, userId }, 'Test case updated successfully');

    return testCase;
  }

  /**
   * テストケースを削除
   * @param id - テストケースID
   * @param userId - 削除を行うユーザーID
   * @returns 削除されたテストケース
   * @throws NotFoundException - テストケースが見つからない場合
   * @throws UnauthorizedException - 作成者以外が削除しようとした場合
   */
  async remove(id: number, userId: number): Promise<TestCase> {
    this.logger.info({ testCaseId: id, userId }, 'Deleting test case');

    // テストケースの存在確認
    const existingTestCase = await this.prismaService.testCase.findUnique({
      where: { id },
      include: {
        createdBy: true,
      },
    });

    if (!existingTestCase) {
      this.logger.warn({ testCaseId: id }, 'Test case not found for deletion');
      throw new NotFoundException(`Test case with ID ${id} not found`);
    }

    // 作成者のみ削除可能
    if (existingTestCase.createdById !== userId) {
      this.logger.warn(
        { testCaseId: id, userId, createdById: existingTestCase.createdById },
        'Unauthorized delete attempt',
      );
      throw new UnauthorizedException('Only the creator can delete this test case');
    }

    await this.prismaService.testCase.delete({
      where: { id },
    });

    this.logger.info({ testCaseId: id, userId }, 'Test case deleted successfully');

    return existingTestCase;
  }
}
