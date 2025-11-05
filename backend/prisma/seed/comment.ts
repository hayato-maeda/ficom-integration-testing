import { PrismaClient, TestCase, User } from '@prisma/client';

export async function createComments(prisma: PrismaClient, testCases: TestCase[], users: User[]) {
  console.log('Creating comments...');

  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'ログイン画面のUIが最新版に更新されているか確認してください。',
        testCaseFeatureId: testCases[0].testFeatureId,
        testCaseTestId: testCases[0].testId,
        testCaseId: testCases[0].id,
        userId: users[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'ダッシュボード画面のスクリーンショットを追加しました。',
        testCaseFeatureId: testCases[0].testFeatureId,
        testCaseTestId: testCases[0].testId,
        testCaseId: testCases[0].id,
        userId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'パスワードリセットメールの件名も確認項目に追加すべきです。',
        testCaseFeatureId: testCases[1].testFeatureId,
        testCaseTestId: testCases[1].testId,
        testCaseId: testCases[1].id,
        userId: users[4].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'メールが届かない場合の手順も追記してください。',
        testCaseFeatureId: testCases[1].testFeatureId,
        testCaseTestId: testCases[1].testId,
        testCaseId: testCases[1].id,
        userId: users[6].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '作成フォームのバリデーションも追加で確認が必要です。',
        testCaseFeatureId: testCases[2].testFeatureId,
        testCaseTestId: testCases[2].testId,
        testCaseId: testCases[2].id,
        userId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'エラーログを確認しましたが、権限の問題のようです。',
        testCaseFeatureId: testCases[3].testFeatureId,
        testCaseTestId: testCases[3].testId,
        testCaseId: testCases[3].id,
        userId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'スクリーンショットを添付しました。',
        testCaseFeatureId: testCases[3].testFeatureId,
        testCaseTestId: testCases[3].testId,
        testCaseId: testCases[3].id,
        userId: users[3].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '複数のタグを同時に選択した場合の動作も確認してください。',
        testCaseFeatureId: testCases[4].testFeatureId,
        testCaseTestId: testCases[4].testId,
        testCaseId: testCases[4].id,
        userId: users[7].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'レビューコメントの文字数制限を確認してください。',
        testCaseFeatureId: testCases[5].testFeatureId,
        testCaseTestId: testCases[5].testId,
        testCaseId: testCases[5].id,
        userId: users[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'エクスポートしたCSVファイルのエンコーディングを確認しました。UTF-8で正しく出力されています。',
        testCaseFeatureId: testCases[8].testFeatureId,
        testCaseTestId: testCases[8].testId,
        testCaseId: testCases[8].id,
        userId: users[5].id,
      },
    }),
  ]);

  console.log('✅ Created 10 comments');
}
