/**
 * テスト関連のメッセージ定数
 */
export const TESTS_MESSAGES = {
  // 成功メッセージ
  TEST_CREATED: 'テストを作成しました',
  TEST_UPDATED: 'テストを更新しました',
  TEST_DELETED: 'テストを削除しました',

  // エラーメッセージ
  TEST_NOT_FOUND: (id: number) => `テストが見つかりません (ID: ${id})`,
  TEST_NAME_EXISTS_IN_FEATURE: (name: string, featureId: number) =>
    `この機能には既に同じテスト名が存在します: ${name} (機能ID: ${featureId})`,
  FEATURE_NOT_FOUND: (id: number) => `機能が見つかりません (ID: ${id})`,
} as const;
