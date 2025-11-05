import { PrismaClient, Tag, TestCase } from '@prisma/client';

export async function createTestCaseTags(prisma: PrismaClient, testCases: TestCase[], tags: Tag[]) {
  console.log('Creating test case tags...');

  await Promise.all([
    // TestCase 0: 正常ログイン
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[0].featureId,
        testId: testCases[0].testId,
        testCaseId: testCases[0].id,
        tagId: tags[0].id,
      }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[0].featureId,
        testId: testCases[0].testId,
        testCaseId: testCases[0].id,
        tagId: tags[3].id,
      }, // 認証
    }),

    // TestCase 1: パスワード誤り
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[1].featureId,
        testId: testCases[1].testId,
        testCaseId: testCases[1].id,
        tagId: tags[1].id,
      }, // バグ
    }),
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[1].featureId,
        testId: testCases[1].testId,
        testCaseId: testCases[1].id,
        tagId: tags[3].id,
      }, // 認証
    }),

    // TestCase 2: 存在しないユーザー
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[2].featureId,
        testId: testCases[2].testId,
        testCaseId: testCases[2].id,
        tagId: tags[1].id,
      }, // バグ
    }),
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[2].featureId,
        testId: testCases[2].testId,
        testCaseId: testCases[2].id,
        tagId: tags[3].id,
      }, // 認証
    }),

    // TestCase 3: メール送信確認
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[3].featureId,
        testId: testCases[3].testId,
        testCaseId: testCases[3].id,
        tagId: tags[0].id,
      }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[3].featureId,
        testId: testCases[3].testId,
        testCaseId: testCases[3].id,
        tagId: tags[3].id,
      }, // 認証
    }),

    // TestCase 4: トークン検証
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[4].featureId,
        testId: testCases[4].testId,
        testCaseId: testCases[4].id,
        tagId: tags[2].id,
      }, // UI/UX
    }),
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[4].featureId,
        testId: testCases[4].testId,
        testCaseId: testCases[4].id,
        tagId: tags[3].id,
      }, // 認証
    }),

    // TestCase 5: zipファイルアップロード
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[5].featureId,
        testId: testCases[5].testId,
        testCaseId: testCases[5].id,
        tagId: tags[0].id,
      }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[5].featureId,
        testId: testCases[5].testId,
        testCaseId: testCases[5].id,
        tagId: tags[7].id,
      }, // ファイル処理
    }),

    // TestCase 6: pngファイルアップロード
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[6].featureId,
        testId: testCases[6].testId,
        testCaseId: testCases[6].id,
        tagId: tags[0].id,
      }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[6].featureId,
        testId: testCases[6].testId,
        testCaseId: testCases[6].id,
        tagId: tags[7].id,
      }, // ファイル処理
    }),

    // TestCase 7: csvファイルアップロード
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[7].featureId,
        testId: testCases[7].testId,
        testCaseId: testCases[7].id,
        tagId: tags[0].id,
      }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: {
        featureId: testCases[7].featureId,
        testId: testCases[7].testId,
        testCaseId: testCases[7].id,
        tagId: tags[7].id,
      }, // ファイル処理
    }),
  ]);

  console.log('✅ Created 16 test case tags');
}
