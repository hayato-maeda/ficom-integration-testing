import { PrismaClient, TestCase, User } from '@prisma/client';

export async function createComments(prisma: PrismaClient, testCases: TestCase[], users: User[]) {
  console.log('Creating comments...');

  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'ログイン画面のUIが最新版に更新されているか確認してください。',
        featureId: testCases[0].featureId,
        testId: testCases[0].testId,
        testCaseId: testCases[0].id,
        userId: users[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'ダッシュボード画面のスクリーンショットを追加しました。',
        featureId: testCases[0].featureId,
        testId: testCases[0].testId,
        testCaseId: testCases[0].id,
        userId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'パスワードリセットメールの件名も確認項目に追加すべきです。',
        featureId: testCases[1].featureId,
        testId: testCases[1].testId,
        testCaseId: testCases[1].id,
        userId: users[4].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'メールが届かない場合の手順も追記してください。',
        featureId: testCases[1].featureId,
        testId: testCases[1].testId,
        testCaseId: testCases[1].id,
        userId: users[3].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'このエラーは既知の問題です。バグチケット #123 を参照してください。',
        featureId: testCases[3].featureId,
        testId: testCases[3].testId,
        testCaseId: testCases[3].id,
        userId: users[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'ファイルサイズの上限についてもテストケースに含めるべきです。',
        featureId: testCases[3].featureId,
        testId: testCases[3].testId,
        testCaseId: testCases[3].id,
        userId: users[4].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '複数タグを同時に選択した場合の動作も確認しましょう。',
        featureId: testCases[4].featureId,
        testId: testCases[4].testId,
        testCaseId: testCases[4].id,
        userId: users[6].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '承認者が複数いる場合の動作についても記載してください。',
        featureId: testCases[5].featureId,
        testId: testCases[5].testId,
        testCaseId: testCases[5].id,
        userId: users[7].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '検索結果が0件の場合の表示についても確認項目に追加してください。',
        featureId: testCases[7].featureId,
        testId: testCases[7].testId,
        testCaseId: testCases[7].id,
        userId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'エクスポートしたCSVの文字コードはUTF-8ですか？',
        featureId: testCases[6].featureId,
        testId: testCases[6].testId,
        testCaseId: testCases[6].id,
        userId: users[3].id,
      },
    }),
  ]);

  console.log('✅ Created 10 comments');
}
