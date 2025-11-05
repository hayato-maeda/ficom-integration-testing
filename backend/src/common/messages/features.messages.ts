/**
 * 機能関連のメッセージ定数
 */
export const FEATURES_MESSAGES = {
  // 成功メッセージ
  FEATURE_CREATED: '機能を作成しました',
  FEATURE_UPDATED: '機能を更新しました',
  FEATURE_DELETED: '機能を削除しました',
  FEATURE_ASSIGNED: '機能をテストケースに割り当てました',
  FEATURE_UNASSIGNED: '機能の割り当てを解除しました',

  // エラーメッセージ
  FEATURE_NOT_FOUND: (id: number) => `機能が見つかりません (ID: ${id})`,
  FEATURE_NAME_EXISTS: (name: string) => `この機能名は既に使用されています: ${name}`,
  FEATURE_ALREADY_ASSIGNED: '機能は既にこのテストケースに割り当てられています',
  FEATURE_NOT_ASSIGNED: '機能はこのテストケースに割り当てられていません',
  TEST_CASE_NOT_FOUND: (id: number) => `テストケースが見つかりません (ID: ${id})`,
} as const;
