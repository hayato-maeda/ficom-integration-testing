import { PrismaClient, Tag, TestCase } from '@prisma/client';

export async function createTestCaseTags(prisma: PrismaClient, testCases: TestCase[], tags: Tag[]) {
  console.log('Creating test case tags...');

  await Promise.all([
    // TestCase 0: 正常ログイン
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[0].id, tagId: tags[0].id }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[0].id, tagId: tags[3].id }, // 認証
    }),

    // TestCase 1: パスワード誤り
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[1].id, tagId: tags[1].id }, // バグ
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[1].id, tagId: tags[3].id }, // 認証
    }),

    // TestCase 2: 存在しないユーザー
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[2].id, tagId: tags[1].id }, // バグ
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[2].id, tagId: tags[3].id }, // 認証
    }),

    // TestCase 3: メール送信確認
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[3].id, tagId: tags[0].id }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[3].id, tagId: tags[3].id }, // 認証
    }),

    // TestCase 4: トークン検証
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[4].id, tagId: tags[2].id }, // UI/UX
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[4].id, tagId: tags[3].id }, // 認証
    }),

    // TestCase 5: zipファイルアップロード
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[5].id, tagId: tags[0].id }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[5].id, tagId: tags[7].id }, // ファイル処理
    }),

    // TestCase 6: pngファイルアップロード
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[6].id, tagId: tags[0].id }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[6].id, tagId: tags[7].id }, // ファイル処理
    }),

    // TestCase 7: csvファイルアップロード
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[7].id, tagId: tags[0].id }, // 機能テスト
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[7].id, tagId: tags[7].id }, // ファイル処理
    }),
  ]);

  console.log('✅ Created 16 test case tags');
}
