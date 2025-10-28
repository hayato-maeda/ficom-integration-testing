import { PrismaClient, Tag, TestCase } from '@prisma/client';

export async function createTestCaseTags(prisma: PrismaClient, testCases: TestCase[], tags: Tag[]) {
  console.log('Creating test case tags...');

  await Promise.all([
    // Test case 1: ユーザーログイン
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[0].id, tagId: tags[0].id },
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[0].id, tagId: tags[3].id },
    }),

    // Test case 2: パスワードリセット
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[1].id, tagId: tags[0].id },
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[1].id, tagId: tags[3].id },
    }),

    // Test case 3: テストケース作成
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[2].id, tagId: tags[0].id },
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[2].id, tagId: tags[2].id },
    }),

    // Test case 4: ファイルアップロード
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[3].id, tagId: tags[0].id },
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[3].id, tagId: tags[7].id },
    }),

    // Test case 5: タグフィルタリング
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[4].id, tagId: tags[0].id },
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[4].id, tagId: tags[2].id },
    }),

    // Test case 6: 承認ワークフロー
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[5].id, tagId: tags[0].id },
    }),

    // Test case 7: コメント機能
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[6].id, tagId: tags[0].id },
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[6].id, tagId: tags[2].id },
    }),

    // Test case 8: 検索機能
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[7].id, tagId: tags[0].id },
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[7].id, tagId: tags[4].id },
    }),

    // Test case 9: エクスポート機能
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[8].id, tagId: tags[0].id },
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[8].id, tagId: tags[5].id },
    }),

    // Test case 10: ページネーション
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[9].id, tagId: tags[0].id },
    }),
    prisma.testCaseTag.create({
      data: { testCaseId: testCases[9].id, tagId: tags[4].id },
    }),
  ]);

  console.log('✅ Created 18 test case tags');
}
