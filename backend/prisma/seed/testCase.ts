import { PrismaClient, User } from '@prisma/client';

export async function createTestCases(prisma: PrismaClient, users: User[]) {
  console.log('Creating test cases...');

  const testCases = await Promise.all([
    prisma.testCase.create({
      data: {
        title: 'ユーザーログイン機能のテスト',
        description: '正常なログインフローを検証する',
        steps: `1. ログイン画面にアクセス
2. 有効なメールアドレスとパスワードを入力
3. ログインボタンをクリック
4. ダッシュボード画面に遷移することを確認`,
        expectedResult: 'ダッシュボード画面が表示され、ユーザー名が右上に表示される',
        actualResult: 'ダッシュボード画面が正常に表示された',
        status: 'APPROVED',
        createdById: users[0].id,
      },
    }),
    prisma.testCase.create({
      data: {
        title: 'パスワードリセット機能のテスト',
        description: 'パスワードを忘れた場合のリセットフローを検証',
        steps: `1. ログイン画面で「パスワードを忘れた」リンクをクリック
2. 登録済みのメールアドレスを入力
3. リセットメールが送信されることを確認
4. メール内のリンクをクリック
5. 新しいパスワードを設定`,
        expectedResult: 'パスワードリセットメールが届き、新しいパスワードでログインできる',
        status: 'IN_REVIEW',
        createdById: users[1].id,
      },
    }),
    prisma.testCase.create({
      data: {
        title: 'テストケース作成機能のテスト',
        description: '新規テストケースの作成が正常に動作することを確認',
        steps: `1. テストケース一覧画面で「新規作成」ボタンをクリック
2. タイトル、説明、手順、期待結果を入力
3. タグを選択
4. 「保存」ボタンをクリック`,
        expectedResult: 'テストケースが作成され、一覧画面に表示される',
        status: 'DRAFT',
        createdById: users[2].id,
      },
    }),
    prisma.testCase.create({
      data: {
        title: 'ファイルアップロード機能のテスト',
        description: 'テストケースへのファイル添付が正常に動作することを確認',
        steps: `1. テストケース詳細画面を開く
2. 「ファイルを添付」ボタンをクリック
3. PNG形式の画像ファイルを選択
4. アップロードが完了することを確認`,
        expectedResult: 'ファイルが正常にアップロードされ、プレビューが表示される',
        actualResult: '500エラーが発生した',
        status: 'REJECTED',
        createdById: users[3].id,
      },
    }),
    prisma.testCase.create({
      data: {
        title: 'タグフィルタリング機能のテスト',
        description: 'タグによるテストケースのフィルタリングを検証',
        steps: `1. テストケース一覧画面を開く
2. タグフィルターで「機能テスト」を選択
3. フィルター結果を確認`,
        expectedResult: '「機能テスト」タグが付いたテストケースのみが表示される',
        status: 'IN_REVIEW',
        createdById: users[4].id,
      },
    }),
    prisma.testCase.create({
      data: {
        title: '承認ワークフローのテスト',
        description: 'テストケースの承認・却下フローを検証',
        steps: `1. レビュー待ちのテストケースを開く
2. 内容を確認
3. コメントを入力
4. 「承認」ボタンをクリック`,
        expectedResult: 'テストケースのステータスが「承認済み」に変更される',
        actualResult: 'ステータスが正常に変更された',
        status: 'APPROVED',
        createdById: users[5].id,
      },
    }),
    prisma.testCase.create({
      data: {
        title: 'コメント機能のテスト',
        description: 'テストケースへのコメント追加・削除を検証',
        steps: `1. テストケース詳細画面を開く
2. コメント入力欄にテキストを入力
3. 「投稿」ボタンをクリック
4. コメントが表示されることを確認`,
        expectedResult: 'コメントが即座に表示され、投稿者名とタイムスタンプが表示される',
        status: 'DRAFT',
        createdById: users[6].id,
      },
    }),
    prisma.testCase.create({
      data: {
        title: '検索機能のテスト',
        description: 'テストケースのキーワード検索を検証',
        steps: `1. テストケース一覧画面で検索ボックスに「ログイン」と入力
2. 検索結果を確認`,
        expectedResult: 'タイトルまたは説明に「ログイン」を含むテストケースが表示される',
        status: 'IN_REVIEW',
        createdById: users[7].id,
      },
    }),
    prisma.testCase.create({
      data: {
        title: 'エクスポート機能のテスト',
        description: 'テストケース一覧のCSVエクスポートを検証',
        steps: `1. テストケース一覧画面で「エクスポート」ボタンをクリック
2. CSV形式を選択
3. ダウンロードが開始されることを確認
4. ダウンロードしたファイルの内容を確認`,
        expectedResult: 'すべてのテストケース情報がCSV形式で正しくエクスポートされる',
        status: 'APPROVED',
        createdById: users[0].id,
      },
    }),
    prisma.testCase.create({
      data: {
        title: 'ページネーション機能のテスト',
        description: 'テストケース一覧のページング動作を検証',
        steps: `1. テストケース一覧画面を開く（20件以上のデータがある状態）
2. ページサイズを10件に設定
3. 次のページボタンをクリック
4. 2ページ目のデータが表示されることを確認`,
        expectedResult: '各ページに指定した件数のテストケースが表示され、ページ遷移が正常に動作する',
        status: 'ARCHIVED',
        createdById: users[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${testCases.length} test cases`);
  return testCases;
}
