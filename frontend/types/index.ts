// ユーザー型
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// テストステータス定数
export const TestStatus = {
  /** 下書き */
  DRAFT: 'DRAFT',
  /** レビュー中 */
  IN_REVIEW: 'IN_REVIEW',
  /** 承認済み */
  APPROVED: 'APPROVED',
  /** 却下 */
  REJECTED: 'REJECTED',
  /** アーカイブ */
  ARCHIVED: 'ARCHIVED',
} as const;

// テストステータスの型
export type TestStatusType = (typeof TestStatus)[keyof typeof TestStatus];

// テストケースステータス定数
export const TestCaseStatus = {
  /** 下書き */
  DRAFT: 'DRAFT',
  /** レビュー中 */
  IN_REVIEW: 'IN_REVIEW',
  /** 承認済み */
  APPROVED: 'APPROVED',
  /** 却下 */
  REJECTED: 'REJECTED',
  /** アーカイブ */
  ARCHIVED: 'ARCHIVED',
} as const;

// テストケースステータスの型
export type TestCaseStatusType = (typeof TestCaseStatus)[keyof typeof TestCaseStatus];

// タグ型
export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
}

// 機能型（前方宣言）
export interface Feature {
  id: number;
  name: string;
  description?: string;
  color?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// テスト型
export interface Test {
  id: number;
  featureId: number;
  name: string;
  description?: string;
  status: string;
  createdById: number;
  createdBy: User;
  feature?: Feature;
  createdAt: string;
  updatedAt: string;
}

// テストケース型
export interface TestCase {
  id: number;
  featureId: number;
  testId: number;
  test?: Test;
  title: string;
  description?: string;
  steps: string;
  expectedResult: string;
  actualResult?: string;
  status: string;
  createdBy: User;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

// 認証レスポンス型
// トークンはhttpOnly Cookieで管理されるため、レスポンスには含まれません
export interface AuthResponse {
  user: User;
}

// ミューテーションレスポンス型
export interface MutationResponse<T> {
  isValid: boolean;
  message: string;
  data: T | null;
}

// ログイン入力型
export interface LoginInput {
  email: string;
  password: string;
}

// サインアップ入力型
export interface SignupInput {
  email: string;
  password: string;
  name: string;
}

// テスト作成入力型
export interface CreateTestInput {
  featureId: number;
  name: string;
  description?: string;
  status?: string;
}

// テスト更新入力型
export interface UpdateTestInput {
  featureId: number;
  id: number;
  name?: string;
  description?: string;
  status?: string;
}

// テストケース作成入力型
export interface CreateTestCaseInput {
  featureId: number;
  testId: number;
  title: string;
  description?: string;
  steps: string;
  expectedResult: string;
  actualResult?: string;
}

// テストケース更新入力型
export interface UpdateTestCaseInput {
  featureId: number;
  testId: number;
  id: number;
  title?: string;
  description?: string;
  steps?: string;
  expectedResult?: string;
  actualResult?: string;
  status?: string;
}

// タグ作成入力型
export interface CreateTagInput {
  name: string;
  color?: string;
}

// タグ更新入力型
export interface UpdateTagInput {
  name?: string;
  color?: string;
}

// 機能ステータス定数
export const FeatureStatus = {
  /** 計画中 */
  PLANNING: 'PLANNING',
  /** 開発中 */
  DEVELOPING: 'DEVELOPING',
  /** テスト中 */
  TESTING: 'TESTING',
  /** 完了 */
  COMPLETED: 'COMPLETED',
  /** 保留 */
  ON_HOLD: 'ON_HOLD',
} as const;

// 機能ステータスの型
export type FeatureStatusType = (typeof FeatureStatus)[keyof typeof FeatureStatus];

// 機能作成入力型
export interface CreateFeatureInput {
  name: string;
  description?: string;
  color?: string;
}

// 機能更新入力型
export interface UpdateFeatureInput {
  id: number;
  name?: string;
  description?: string;
  color?: string;
  status?: string;
}
