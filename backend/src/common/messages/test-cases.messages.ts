/**
 * テストケース関連のメッセージ定数
 */
export const TEST_CASES_MESSAGES = {
  // 成功メッセージ
  TEST_CASE_CREATED: 'テストケースを作成しました',
  TEST_CASE_UPDATED: 'テストケースを更新しました',
  TEST_CASE_DELETED: 'テストケースを削除しました',

  // エラーメッセージ
  TEST_CASE_NOT_FOUND: (id: number) => `ID ${id} のテストケースが見つかりません`,
  UNAUTHORIZED_UPDATE: 'テストケースの作成者のみ更新できます',
  UNAUTHORIZED_DELETE: 'テストケースの作成者のみ削除できます',
} as const;
