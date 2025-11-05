import { PrismaClient, User, Feature } from '@prisma/client';

export async function createTestCases(prisma: PrismaClient, users: User[], features: Feature[]) {
  console.log('Creating tests and test cases...');

  // Feature 1: ユーザー認証機能
  const authFeature = features.find((f) => f.name === 'ユーザー認証機能');
  if (!authFeature) {
    throw new Error('ユーザー認証機能のFeatureが見つかりません');
  }

  // Test 1-1: ログインテスト
  const loginTest = await prisma.test.create({
    data: {
      featureId: authFeature.id,
      id: 1,
      name: 'ログインテスト',
      description: 'ログイン機能の正常系・異常系テスト',
      status: 'APPROVED',
      createdById: users[0].id,
    },
  });

  // TestCase 1-1-1: 正常ログイン
  await prisma.testCase.create({
    data: {
      featureId: authFeature.id,
      testId: 1,
      id: 1,
      title: '正常ログイン',
      description: '有効な認証情報でログインできることを確認',
      steps: `1. ログイン画面にアクセス
2. 有効なメールアドレスとパスワードを入力
3. ログインボタンをクリック`,
      expectedResult: 'ダッシュボード画面に遷移し、ユーザー名が表示される',
      actualResult: '正常にログインできた',
      status: 'APPROVED',
      createdById: users[0].id,
    },
  });

  // TestCase 1-1-2: パスワード誤り
  await prisma.testCase.create({
    data: {
      featureId: authFeature.id,
      testId: 1,
      id: 2,
      title: 'パスワード誤り',
      description: '誤ったパスワードでログインできないことを確認',
      steps: `1. ログイン画面にアクセス
2. 有効なメールアドレスと誤ったパスワードを入力
3. ログインボタンをクリック`,
      expectedResult: 'エラーメッセージが表示され、ログインできない',
      actualResult: '「パスワードが正しくありません」と表示された',
      status: 'APPROVED',
      createdById: users[1].id,
    },
  });

  // TestCase 1-1-3: 存在しないユーザー
  await prisma.testCase.create({
    data: {
      featureId: authFeature.id,
      testId: 1,
      id: 3,
      title: '存在しないユーザー',
      description: '登録されていないユーザーでログインできないことを確認',
      steps: `1. ログイン画面にアクセス
2. 存在しないメールアドレスとパスワードを入力
3. ログインボタンをクリック`,
      expectedResult: 'エラーメッセージが表示され、ログインできない',
      actualResult: '「ユーザーが見つかりません」と表示された',
      status: 'APPROVED',
      createdById: users[2].id,
    },
  });

  // Test 1-2: パスワードリセットテスト
  const resetTest = await prisma.test.create({
    data: {
      featureId: authFeature.id,
      id: 2,
      name: 'パスワードリセットテスト',
      description: 'パスワードリセット機能のテスト',
      status: 'IN_REVIEW',
      createdById: users[1].id,
    },
  });

  // TestCase 1-2-1: メール送信確認
  await prisma.testCase.create({
    data: {
      featureId: authFeature.id,
      testId: 2,
      id: 1,
      title: 'メール送信確認',
      description: 'パスワードリセットメールが正しく送信されることを確認',
      steps: `1. ログイン画面で「パスワードを忘れた」をクリック
2. 登録済みのメールアドレスを入力
3. 送信ボタンをクリック`,
      expectedResult: 'パスワードリセット用のメールが送信される',
      status: 'IN_REVIEW',
      createdById: users[1].id,
    },
  });

  // TestCase 1-2-2: トークン検証
  await prisma.testCase.create({
    data: {
      featureId: authFeature.id,
      testId: 2,
      id: 2,
      title: 'トークン検証',
      description: 'リセットトークンの有効性が正しく検証されることを確認',
      steps: `1. メール内のリセットリンクをクリック
2. 新しいパスワードを入力
3. パスワード変更ボタンをクリック`,
      expectedResult: 'パスワードが変更され、新しいパスワードでログインできる',
      status: 'IN_REVIEW',
      createdById: users[2].id,
    },
  });

  // Feature 2: ファイルアップロード
  const uploadFeature = features.find((f) => f.name === 'ファイルアップロード');
  if (!uploadFeature) {
    throw new Error('ファイルアップロードのFeatureが見つかりません');
  }

  // Test 2-1: 正常系
  const uploadTest = await prisma.test.create({
    data: {
      featureId: uploadFeature.id,
      id: 1,
      name: '正常系',
      description: '各種ファイル形式のアップロードテスト',
      status: 'DRAFT',
      createdById: users[3].id,
    },
  });

  // TestCase 2-1-1: zipファイルアップロード
  await prisma.testCase.create({
    data: {
      featureId: uploadFeature.id,
      testId: 1,
      id: 1,
      title: 'zipファイルアップロード',
      description: 'ZIP形式のファイルが正常にアップロードできることを確認',
      steps: `1. ファイルアップロード画面を開く
2. ZIPファイルを選択
3. アップロードボタンをクリック`,
      expectedResult: 'ファイルが正常にアップロードされる',
      status: 'DRAFT',
      createdById: users[3].id,
    },
  });

  // TestCase 2-1-2: pngファイルアップロード
  await prisma.testCase.create({
    data: {
      featureId: uploadFeature.id,
      testId: 1,
      id: 2,
      title: 'pngファイルアップロード',
      description: 'PNG形式の画像ファイルが正常にアップロードできることを確認',
      steps: `1. ファイルアップロード画面を開く
2. PNGファイルを選択
3. アップロードボタンをクリック`,
      expectedResult: 'ファイルが正常にアップロードされ、プレビューが表示される',
      status: 'DRAFT',
      createdById: users[4].id,
    },
  });

  // TestCase 2-1-3: csvファイルアップロード
  await prisma.testCase.create({
    data: {
      featureId: uploadFeature.id,
      testId: 1,
      id: 3,
      title: 'csvファイルアップロード',
      description: 'CSV形式のファイルが正常にアップロードできることを確認',
      steps: `1. ファイルアップロード画面を開く
2. CSVファイルを選択
3. アップロードボタンをクリック`,
      expectedResult: 'ファイルが正常にアップロードされる',
      status: 'DRAFT',
      createdById: users[5].id,
    },
  });

  console.log(`✅ Created 3 tests with 8 test cases`);
}
