import { PrismaClient, Tag, TestCase } from '@prisma/client';

export async function createTestCaseTags(prisma: PrismaClient, testCases: TestCase[], tags: Tag[]) {
  console.log('Creating test case tags...');

  await Promise.all([
    // Test case 1: Login test - 機能テスト, 優先度:高
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[0].testFeatureId,
        testCaseTestId: testCases[0].testId,
        testCaseId: testCases[0].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[0].testFeatureId,
        testCaseTestId: testCases[0].testId,
        testCaseId: testCases[0].id,
        tagId: tags[2].id, // 優先度:高
      },
    }),

    // Test case 2: Password reset - 機能テスト, セキュリティ
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[1].testFeatureId,
        testCaseTestId: testCases[1].testId,
        testCaseId: testCases[1].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[1].testFeatureId,
        testCaseTestId: testCases[1].testId,
        testCaseId: testCases[1].id,
        tagId: tags[5].id, // セキュリティ
      },
    }),

    // Test case 3: Create test case - 機能テスト
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[2].testFeatureId,
        testCaseTestId: testCases[2].testId,
        testCaseId: testCases[2].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),

    // Test case 4: File upload - 機能テスト, バグ
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[3].testFeatureId,
        testCaseTestId: testCases[3].testId,
        testCaseId: testCases[3].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[3].testFeatureId,
        testCaseTestId: testCases[3].testId,
        testCaseId: testCases[3].id,
        tagId: tags[6].id, // バグ
      },
    }),

    // Test case 5: Tag filtering - 機能テスト, UI
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[4].testFeatureId,
        testCaseTestId: testCases[4].testId,
        testCaseId: testCases[4].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[4].testFeatureId,
        testCaseTestId: testCases[4].testId,
        testCaseId: testCases[4].id,
        tagId: tags[7].id, // UI
      },
    }),

    // Test case 6: Approval workflow - 機能テスト, 優先度:高
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[5].testFeatureId,
        testCaseTestId: testCases[5].testId,
        testCaseId: testCases[5].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[5].testFeatureId,
        testCaseTestId: testCases[5].testId,
        testCaseId: testCases[5].id,
        tagId: tags[2].id, // 優先度:高
      },
    }),

    // Test case 7: Comment function - 機能テスト
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[6].testFeatureId,
        testCaseTestId: testCases[6].testId,
        testCaseId: testCases[6].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),

    // Test case 8: Search - 機能テスト
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[7].testFeatureId,
        testCaseTestId: testCases[7].testId,
        testCaseId: testCases[7].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),

    // Test case 9: Export - 機能テスト, 優先度:中
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[8].testFeatureId,
        testCaseTestId: testCases[8].testId,
        testCaseId: testCases[8].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[8].testFeatureId,
        testCaseTestId: testCases[8].testId,
        testCaseId: testCases[8].id,
        tagId: tags[3].id, // 優先度:中
      },
    }),

    // Test case 10: Pagination - 機能テスト, UI
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[9].testFeatureId,
        testCaseTestId: testCases[9].testId,
        testCaseId: testCases[9].id,
        tagId: tags[0].id, // 機能テスト
      },
    }),
    prisma.testCaseTag.create({
      data: {
        testCaseFeatureId: testCases[9].testFeatureId,
        testCaseTestId: testCases[9].testId,
        testCaseId: testCases[9].id,
        tagId: tags[7].id, // UI
      },
    }),
  ]);

  console.log('✅ Created 18 test case tags');
}
