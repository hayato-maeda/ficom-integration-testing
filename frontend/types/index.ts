// ユーザー型
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

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

// テストケース型
export interface TestCase {
  id: number;
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

// テストケース作成入力型
export interface CreateTestCaseInput {
  title: string;
  description?: string;
  steps: string;
  expectedResult: string;
  actualResult?: string;
}

// テストケース更新入力型
export interface UpdateTestCaseInput {
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
