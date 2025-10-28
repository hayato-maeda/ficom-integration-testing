import { PrismaClient, TestCase, User } from '@prisma/client';

export async function createComments(
  prisma: PrismaClient,
  testCases: TestCase[],
  users: User[],
) {
  console.log('Creating comments...');

  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'ログイン画面のUIが最新版に更新されているか確認してください。',
        testCaseId: testCases[0].id,
        userId: users[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'ダッシュボード画面のスクリーンショットを追加しました。',
        testCaseId: testCases[0].id,
        userId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'パスワードリセットメールの件名も確認項目に追加すべきです。',
        testCaseId: testCases[1].id,
        userId: users[4].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'メールが届かない場合の手順も追記してください。',
        testCaseId: testCases[1].id,
        userId: users[3].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'このエラーは既知の問題です。バグチケット #123 を参照してください。',
        testCaseId: testCases[3].id,
        userId: users[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'ファイルサイズの上限についてもテストケースに含めるべきです。',
        testCaseId: testCases[3].id,
        userId: users[4].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '複数タグを同時に選択した場合の動作も確認しましょう。',
        testCaseId: testCases[4].id,
        userId: users[6].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '承認者が複数いる場合の動作についても記載してください。',
        testCaseId: testCases[5].id,
        userId: users[7].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: '検索結果が0件の場合の表示についても確認項目に追加してください。',
        testCaseId: testCases[7].id,
        userId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'エクスポートしたCSVの文字コードはUTF-8ですか？',
        testCaseId: testCases[8].id,
        userId: users[3].id,
      },
    }),
  ]);

  console.log('✅ Created 10 comments');
}
