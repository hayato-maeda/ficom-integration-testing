import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { TEST_CASES_MESSAGES } from '../common/messages/test-cases.messages';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestCaseInput } from './dto/create-test-case.input';
import { TestCaseMutationResponse } from './dto/test-case-mutation.response';
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
   * @returns テストケースMutationレスポンス
   */
  async create(createTestCaseInput: CreateTestCaseInput, userId: number): Promise<TestCaseMutationResponse> {
    this.logger.info({ userId, testId: createTestCaseInput.testId, title: createTestCaseInput.title }, 'Creating test case');

    // Testの存在確認
    const test = await this.prismaService.test.findUnique({
      where: { id: createTestCaseInput.testId },
    });

    if (!test) {
      this.logger.warn({ testId: createTestCaseInput.testId }, 'Test not found');
      return {
        isValid: false,
        message: `Test with ID ${createTestCaseInput.testId} not found`,
        data: null,
      };
    }

    // 次のtestCaseIdを取得（そのTest内での最大testCaseId + 1）
    const maxTestCase = await this.prismaService.testCase.findFirst({
      where: { testId: createTestCaseInput.testId },
      orderBy: { testCaseId: 'desc' },
    });

    const nextTestCaseId = maxTestCase ? maxTestCase.testCaseId + 1 : 1;

    const testCase = await this.prismaService.testCase.create({
      data: {
        testId: createTestCaseInput.testId,
        testCaseId: nextTestCaseId,
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

    this.logger.info({ testId: testCase.testId, testCaseId: testCase.testCaseId, userId }, 'Test case created successfully');

    return {
      isValid: true,
      message: TEST_CASES_MESSAGES.TEST_CASE_CREATED,
      data: testCase,
    };
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
   * Test別のテストケース一覧を取得
   * @param testId - テストID
   * @returns テストケースの一覧
   */
  async findByTest(testId: number): Promise<TestCase[]> {
    this.logger.debug({ testId }, 'Fetching test cases by test');

    const testCases = await this.prismaService.testCase.findMany({
      where: { testId },
      include: {
        createdBy: true,
      },
      orderBy: {
        testCaseId: 'asc',
      },
    });

    this.logger.info({ testId, count: testCases.length }, 'Fetched test cases by test');

    return testCases;
  }

  /**
   * 特定のテストケースを取得
   * @param testId - テストID
   * @param testCaseId - テストケースID
   * @returns テストケースまたはnull
   */
  async findOne(testId: number, testCaseId: number): Promise<TestCase | null> {
    this.logger.debug({ testId, testCaseId }, 'Fetching test case');

    const testCase = await this.prismaService.testCase.findUnique({
      where: {
        testId_testCaseId: {
          testId,
          testCaseId,
        },
      },
      include: {
        createdBy: true,
      },
    });

    this.logger.info({ fetchedTestCase: testCase }, 'Fetched test case');

    return testCase;
  }

  /**
   * テストケースを更新
   * @param updateTestCaseInput - 更新データ
   * @param userId - 更新を行うユーザーID
   * @returns テストケースMutationレスポンス
   */
  async update(updateTestCaseInput: UpdateTestCaseInput, userId: number): Promise<TestCaseMutationResponse> {
    this.logger.info({ testId: updateTestCaseInput.testId, testCaseId: updateTestCaseInput.testCaseId, userId }, 'Updating test case');

    // テストケースの存在確認
    const existingTestCase = await this.prismaService.testCase.findUnique({
      where: {
        testId_testCaseId: {
          testId: updateTestCaseInput.testId,
          testCaseId: updateTestCaseInput.testCaseId,
        },
      },
    });

    if (!existingTestCase) {
      this.logger.warn({ testId: updateTestCaseInput.testId, testCaseId: updateTestCaseInput.testCaseId }, 'Test case not found for update');
      return {
        isValid: false,
        message: `Test case with testId ${updateTestCaseInput.testId} and testCaseId ${updateTestCaseInput.testCaseId} not found`,
        data: null,
      };
    }

    // 作成者のみ更新可能
    if (existingTestCase.createdById !== userId) {
      this.logger.warn(
        { testId: updateTestCaseInput.testId, testCaseId: updateTestCaseInput.testCaseId, userId, createdById: existingTestCase.createdById },
        'Unauthorized update attempt',
      );

      return {
        isValid: false,
        message: TEST_CASES_MESSAGES.UNAUTHORIZED_UPDATE,
        data: null,
      };
    }

    // 更新データの準備（testId, testCaseIdを除外し、undefinedのフィールドは除外）
    const { testId: _testId, testCaseId: _testCaseId, ...updateFields } = updateTestCaseInput;
    const updateData = Object.fromEntries(Object.entries(updateFields).filter(([_, value]) => value !== undefined));

    const testCase = await this.prismaService.testCase.update({
      where: {
        testId_testCaseId: {
          testId: updateTestCaseInput.testId,
          testCaseId: updateTestCaseInput.testCaseId,
        },
      },
      data: updateData,
      include: {
        createdBy: true,
      },
    });

    this.logger.info({ testId: testCase.testId, testCaseId: testCase.testCaseId, userId }, 'Test case updated successfully');

    return {
      isValid: true,
      message: TEST_CASES_MESSAGES.TEST_CASE_UPDATED,
      data: testCase,
    };
  }

  /**
   * テストケースを削除
   * @param testId - テストID
   * @param testCaseId - テストケースID
   * @param userId - 削除を行うユーザーID
   * @returns テストケースMutationレスポンス
   */
  async remove(testId: number, testCaseId: number, userId: number): Promise<TestCaseMutationResponse> {
    this.logger.info({ testId, testCaseId, userId }, 'Deleting test case');

    // テストケースの存在確認
    const existingTestCase = await this.prismaService.testCase.findUnique({
      where: {
        testId_testCaseId: {
          testId,
          testCaseId,
        },
      },
      include: {
        createdBy: true,
      },
    });

    if (!existingTestCase) {
      this.logger.warn({ testId, testCaseId }, 'Test case not found for deletion');
      return {
        isValid: false,
        message: `Test case with testId ${testId} and testCaseId ${testCaseId} not found`,
        data: null,
      };
    }

    // 作成者のみ削除可能
    if (existingTestCase.createdById !== userId) {
      this.logger.warn(
        { testId, testCaseId, userId, createdById: existingTestCase.createdById },
        'Unauthorized delete attempt',
      );
      return {
        isValid: false,
        message: TEST_CASES_MESSAGES.UNAUTHORIZED_DELETE,
        data: null,
      };
    }

    await this.prismaService.testCase.delete({
      where: {
        testId_testCaseId: {
          testId,
          testCaseId,
        },
      },
    });

    this.logger.info({ testId, testCaseId, userId }, 'Test case deleted successfully');

    return {
      isValid: true,
      message: TEST_CASES_MESSAGES.TEST_CASE_DELETED,
      data: existingTestCase,
    };
  }
}
