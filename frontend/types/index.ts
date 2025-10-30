// ユーザー型
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// テストケースステータス
export enum TestCaseStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

// テストケース優先度
export enum TestCasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// タグ型
export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// テストケース型
export interface TestCase {
  id: number;
  title: string;
  description?: string;
  steps?: string;
  expectedResult?: string;
  actualResult?: string;
  status: TestCaseStatus;
  priority: TestCasePriority;
  createdBy: User;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

// 認証レスポンス型
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
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
  steps?: string;
  expectedResult?: string;
  status?: TestCaseStatus;
  priority?: TestCasePriority;
}

// テストケース更新入力型
export interface UpdateTestCaseInput {
  title?: string;
  description?: string;
  steps?: string;
  expectedResult?: string;
  actualResult?: string;
  status?: TestCaseStatus;
  priority?: TestCasePriority;
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
