/**
 * 型定義のメインエクスポートファイル
 *
 * GraphQL Code Generator で自動生成された型と、
 * プロジェクト固有の追加型定義をまとめてエクスポートします。
 */

// GraphQL Code Generator で自動生成された型をすべてエクスポート
export * from './generated';

// プロジェクト固有の追加型定義
// ※ 必要に応じて、バックエンドで enum として定義されていない
//    補助的な型をここで定義できます

/**
 * テストケースステータスの定数
 * ※ バックエンドでは String として定義されていますが、
 *    フロントエンドでの型安全性のために定数として定義
 */
export const TEST_CASE_STATUS = {
  PENDING: 'PENDING',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
} as const;

export type TestCaseStatus = typeof TEST_CASE_STATUS[keyof typeof TEST_CASE_STATUS];

/**
 * テストケース優先度の定数
 * ※ 将来的にバックエンドで実装される場合に備えて定義
 */
export const TEST_CASE_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type TestCasePriority = typeof TEST_CASE_PRIORITY[keyof typeof TEST_CASE_PRIORITY];
