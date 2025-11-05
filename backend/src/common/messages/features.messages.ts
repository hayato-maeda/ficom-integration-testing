/**
 * 機能関連のメッセージ定数
 */
export const FEATURES_MESSAGES = {
  // 成功メッセージ
  FEATURE_CREATED: 'テストを作成しました',
  FEATURE_UPDATED: 'テストを更新しました',
  FEATURE_DELETED: 'テストを削除しました',
  FEATURE_ASSIGNED: 'テストケースに割り当てました',
  FEATURE_UNASSIGNED: 'テストケースの割り当てを解除しました',

  // エラーメッセージ
  FEATURE_NOT_FOUND: (id: number) => `テストが見つかりません (ID: ${id})`,
  FEATURE_NAME_EXISTS: (name: string) => `このテスト名は既に使用されています: ${name}`,
  FEATURE_ALREADY_ASSIGNED: 'テストは既にこのテストケースに割り当てられています',
  FEATURE_NOT_ASSIGNED: 'テストはこのテストケースに割り当てられていません',
  TEST_CASE_NOT_FOUND: (id: number) => `テストケースが見つかりません (ID: ${id})`,
} as const;
