import { Feature, PrismaClient, Test } from '@prisma/client';

export async function createTests(prisma: PrismaClient, features: Feature[]): Promise<Test[]> {
  console.log('Creating tests...');

  const tests: Test[] = [];

  // 認証機能のテスト (Feature ID: 1)
  const authTests = await Promise.all([
    prisma.test.create({
      data: {
        featureId: features[0].id,
        id: 1,
        title: 'ログイン機能テスト',
        description: '正常なログインフローと異常系のテスト',
      },
    }),
    prisma.test.create({
      data: {
        featureId: features[0].id,
        id: 2,
        title: 'パスワードリセットテスト',
        description: 'パスワードリセットフローのテスト',
      },
    }),
  ]);
  tests.push(...authTests);

  // テストケース管理のテスト (Feature ID: 2)
  const testMgmtTests = await Promise.all([
    prisma.test.create({
      data: {
        featureId: features[1].id,
        id: 1,
        title: 'テストケース作成テスト',
        description: '新規テストケース作成機能のテスト',
      },
    }),
  ]);
  tests.push(...testMgmtTests);

  // ファイル管理のテスト (Feature ID: 3)
  const fileMgmtTests = await Promise.all([
    prisma.test.create({
      data: {
        featureId: features[2].id,
        id: 1,
        title: 'ファイルアップロードテスト',
        description: 'ファイルアップロード機能のテスト',
      },
    }),
  ]);
  tests.push(...fileMgmtTests);

  // フィルタリング・検索のテスト (Feature ID: 4)
  const searchTests = await Promise.all([
    prisma.test.create({
      data: {
        featureId: features[3].id,
        id: 1,
        title: 'タグフィルタリングテスト',
        description: 'タグによるフィルタリング機能のテスト',
      },
    }),
    prisma.test.create({
      data: {
        featureId: features[3].id,
        id: 2,
        title: 'キーワード検索テスト',
        description: 'キーワードによる検索機能のテスト',
      },
    }),
  ]);
  tests.push(...searchTests);

  // ワークフローのテスト (Feature ID: 5)
  const workflowTests = await Promise.all([
    prisma.test.create({
      data: {
        featureId: features[4].id,
        id: 1,
        title: '承認ワークフローテスト',
        description: '承認・却下フローのテスト',
      },
    }),
    prisma.test.create({
      data: {
        featureId: features[4].id,
        id: 2,
        title: 'コメント機能テスト',
        description: 'コメント追加・削除機能のテスト',
      },
    }),
  ]);
  tests.push(...workflowTests);

  // データ表示のテスト (Feature ID: 6)
  const displayTests = await Promise.all([
    prisma.test.create({
      data: {
        featureId: features[5].id,
        id: 1,
        title: 'エクスポート機能テスト',
        description: 'CSVエクスポート機能のテスト',
      },
    }),
    prisma.test.create({
      data: {
        featureId: features[5].id,
        id: 2,
        title: 'ページネーションテスト',
        description: 'ページング機能のテスト',
      },
    }),
  ]);
  tests.push(...displayTests);

  console.log(`✅ Created ${tests.length} tests`);
  return tests;
}
