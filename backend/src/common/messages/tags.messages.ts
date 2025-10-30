/**
 * タグ関連のメッセージ定数
 */
export const TAGS_MESSAGES = {
  // 成功メッセージ
  TAG_CREATED: 'タグを作成しました',
  TAG_UPDATED: 'タグを更新しました',
  TAG_DELETED: 'タグを削除しました',
  TAG_ASSIGNED: 'タグを割り当てました',
  TAG_UNASSIGNED: 'タグの割り当てを解除しました',

  // エラーメッセージ
  TAG_NAME_EXISTS: (name: string) => `タグ名「${name}」は既に存在します`,
  TAG_NOT_FOUND: (id: number) => `ID ${id} のタグが見つかりません`,
  TEST_CASE_NOT_FOUND: (id: number) => `ID ${id} のテストケースが見つかりません`,
  TAG_ALREADY_ASSIGNED: 'このタグは既にテストケースに割り当てられています',
  TAG_NOT_ASSIGNED: 'このタグはテストケースに割り当てられていません',
} as const;
