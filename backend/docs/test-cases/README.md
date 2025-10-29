# テストケース管理API ドキュメント

結合テストのテストケースを作成・管理するためのAPIドキュメントです。

## 概要

このモジュールは、結合テストのテストケースを管理するためのCRUD操作を提供します。テストケースには、テスト手順、期待結果、実績結果、ステータス管理などの機能が含まれています。

## API一覧

### クイックリファレンス

| API | 種類 | 認証 | 説明 |
|-----|------|------|------|
| [createTestCase](./create-test-case.md) | Mutation | ✅ 必要 | テストケース作成 |
| [testCases](#testcases---テストケース一覧取得) | Query | ✅ 必要 | テストケース一覧取得 |
| [testCase](#testcase---テストケース取得) | Query | ✅ 必要 | テストケース取得 |
| [updateTestCase](#updatetestcase---テストケース更新) | Mutation | ✅ 必要 | テストケース更新 |
| [deleteTestCase](#deletetestcase---テストケース削除) | Mutation | ✅ 必要 | テストケース削除 |

---

## createTestCase - テストケース作成

新規テストケースを作成します。詳細は [create-test-case.md](./create-test-case.md) を参照してください。

**GraphQL**:
```graphql
mutation CreateTestCase($createTestCaseInput: CreateTestCaseInput!) {
  createTestCase(createTestCaseInput: $createTestCaseInput) {
    id
    title
    status
    createdBy { name }
  }
}
```

**主な機能**:
- 認証されたユーザーが作成者として自動記録
- 初期ステータスは `DRAFT`（下書き）
- タイトル、手順、期待結果は必須

---

## testCases - テストケース一覧取得

すべてのテストケースを取得します。

**GraphQL**:
```graphql
query TestCases {
  testCases {
    id
    title
    description
    status
    createdBy {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
}
```

**レスポンス例**:
```json
{
  "data": {
    "testCases": [
      {
        "id": "1",
        "title": "ログイン機能のテスト",
        "description": "正常なログインフローの確認",
        "status": "DRAFT",
        "createdBy": {
          "id": "1",
          "name": "山田太郎",
          "email": "yamada@example.com"
        },
        "createdAt": "2025-10-29T05:00:00.000Z",
        "updatedAt": "2025-10-29T05:00:00.000Z"
      }
    ]
  }
}
```

**特徴**:
- 作成日時の降順（新しいものが先頭）で返却
- 作成者情報を含む
- 認証必須

---

## testCase - テストケース取得

特定のテストケースを取得します。

**GraphQL**:
```graphql
query TestCase($id: ID!) {
  testCase(id: $id) {
    id
    title
    description
    steps
    expectedResult
    actualResult
    status
    createdById
    createdBy {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
}
```

**Variables**:
```json
{
  "id": "1"
}
```

**エラー**:
- テストケースが存在しない場合: `NotFoundException`

---

## updateTestCase - テストケース更新

既存のテストケースを更新します。

**GraphQL**:
```graphql
mutation UpdateTestCase($updateTestCaseInput: UpdateTestCaseInput!) {
  updateTestCase(updateTestCaseInput: $updateTestCaseInput) {
    id
    title
    description
    steps
    expectedResult
    actualResult
    status
    updatedAt
  }
}
```

**Variables**:
```json
{
  "updateTestCaseInput": {
    "id": "1",
    "title": "ログイン機能のテスト（更新版）",
    "status": "IN_REVIEW"
  }
}
```

**重要な制限**:
- **作成者のみ**が更新可能
- 他のユーザーが更新しようとすると `UnauthorizedException`
- すべてのフィールドはオプション（変更したいフィールドのみ指定）

---

## deleteTestCase - テストケース削除

テストケースを削除します。

**GraphQL**:
```graphql
mutation DeleteTestCase($id: ID!) {
  deleteTestCase(id: $id) {
    id
    title
  }
}
```

**Variables**:
```json
{
  "id": "1"
}
```

**重要な制限**:
- **作成者のみ**が削除可能
- 他のユーザーが削除しようとすると `UnauthorizedException`
- 削除は物理削除（データベースから完全に削除される）
- 関連データ（タグ、ファイル、承認、コメント）もカスケード削除される

---

## テストケースのステータス

テストケースは以下の5つのステータスを持ちます：

| ステータス | 説明 | 典型的な使用例 |
|----------|------|-------------|
| **DRAFT** | 下書き | 作成直後、編集中 |
| **IN_REVIEW** | レビュー中 | レビュー依頼後 |
| **APPROVED** | 承認済み | レビュー承認後、テスト実行可能 |
| **REJECTED** | 却下 | レビューで却下された |
| **ARCHIVED** | アーカイブ済み | 使用されなくなったテストケース |

### ステータスフロー

```
DRAFT
  ↓ (レビュー依頼)
IN_REVIEW
  ↓ ↓
  ↓ (承認)   (却下) ↓
  ↓          ↓
APPROVED    REJECTED
  ↓          ↓
  ↓ (アーカイブ)
  ↓          ↓
ARCHIVED ← ←
```

---

## データモデル

### TestCase

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | ID | ✓ | テストケースID（自動採番） |
| title | String | ✓ | タイトル |
| description | String | | 説明 |
| steps | String | ✓ | テスト手順（複数行可） |
| expectedResult | String | ✓ | 期待結果 |
| actualResult | String | | 実績結果 |
| status | String | ✓ | ステータス（デフォルト: DRAFT） |
| createdById | ID | ✓ | 作成者ID |
| createdBy | User | ✓ | 作成者情報 |
| createdAt | DateTime | ✓ | 作成日時 |
| updatedAt | DateTime | ✓ | 更新日時 |

---

## 権限管理

### 作成
- すべての認証済みユーザーが作成可能

### 閲覧
- すべての認証済みユーザーが閲覧可能

### 更新
- **作成者のみ**が更新可能
- 他のユーザーは更新不可

### 削除
- **作成者のみ**が削除可能
- 他のユーザーは削除不可

---

## 使用例

### 完全なCRUDフロー

```typescript
import { gql, useMutation, useQuery } from '@apollo/client';

// 1. テストケース作成
const CREATE_TEST_CASE = gql`
  mutation CreateTestCase($createTestCaseInput: CreateTestCaseInput!) {
    createTestCase(createTestCaseInput: $createTestCaseInput) {
      id
      title
      status
    }
  }
`;

const [createTestCase] = useMutation(CREATE_TEST_CASE);

await createTestCase({
  variables: {
    createTestCaseInput: {
      title: 'ログイン機能のテスト',
      steps: '1. ログインページにアクセス...',
      expectedResult: 'ダッシュボードに遷移'
    }
  }
});

// 2. 一覧取得
const GET_TEST_CASES = gql`
  query TestCases {
    testCases {
      id
      title
      status
      createdBy { name }
    }
  }
`;

const { data } = useQuery(GET_TEST_CASES);

// 3. 更新
const UPDATE_TEST_CASE = gql`
  mutation UpdateTestCase($updateTestCaseInput: UpdateTestCaseInput!) {
    updateTestCase(updateTestCaseInput: $updateTestCaseInput) {
      id
      status
    }
  }
`;

const [updateTestCase] = useMutation(UPDATE_TEST_CASE);

await updateTestCase({
  variables: {
    updateTestCaseInput: {
      id: '1',
      status: 'IN_REVIEW'
    }
  }
});

// 4. 削除
const DELETE_TEST_CASE = gql`
  mutation DeleteTestCase($id: ID!) {
    deleteTestCase(id: $id) {
      id
    }
  }
`;

const [deleteTestCase] = useMutation(DELETE_TEST_CASE);

await deleteTestCase({
  variables: { id: '1' }
});
```

---

## エラーハンドリング

### 共通エラー

| エラー | コード | 原因 | 対処方法 |
|--------|--------|------|---------|
| 認証エラー | UNAUTHENTICATED | トークン無効・期限切れ | トークンリフレッシュまたは再ログイン |
| 権限エラー | UNAUTHORIZED | 作成者以外が更新・削除を試行 | 作成者のみが操作可能であることを通知 |
| 存在しないリソース | NOT_FOUND | 指定されたIDのテストケースが存在しない | IDの確認、削除済みでないか確認 |
| バリデーションエラー | BAD_USER_INPUT | 必須フィールドの不足や不正な値 | 入力内容の修正 |

### エラーハンドリング例

```typescript
try {
  await updateTestCase({
    variables: {
      updateTestCaseInput: {
        id: testCaseId,
        status: 'APPROVED'
      }
    }
  });
} catch (error) {
  if (error.message.includes('Only the creator can update')) {
    alert('このテストケースを更新する権限がありません');
  } else if (error.message.includes('not found')) {
    alert('テストケースが見つかりません');
  } else {
    alert('エラーが発生しました');
  }
}
```

---

## ベストプラクティス

### 1. テスト手順の書き方

明確で再現可能な手順を記述します：

```
✅ 良い例:
1. ログインページ（/login）にアクセス
2. メールアドレス欄に "test@example.com" を入力
3. パスワード欄に "password123" を入力
4. 「ログイン」ボタンをクリック

❌ 悪い例:
ログインする
```

### 2. 期待結果の明確化

検証可能な具体的な結果を記述します：

```
✅ 良い例:
- URL が /dashboard に変わる
- ヘッダーに "ようこそ、テストユーザーさん" と表示
- HTTPステータスコードは 200

❌ 悪い例:
正しく動作する
```

### 3. ステータス管理

適切なワークフローでステータスを更新します：

```typescript
// 作成直後
status: 'DRAFT'

// レビュー依頼時
await updateTestCase({
  id,
  status: 'IN_REVIEW'
});

// 承認時
await updateTestCase({
  id,
  status: 'APPROVED'
});
```

---

## 今後の拡張予定

以下の機能が今後追加される予定です：

- **タグ機能**: テストケースにタグを付けて分類
- **ファイル添付**: スクリーンショットやログファイルの添付
- **承認フロー**: レビュワーによる承認・却下機能
- **コメント機能**: テストケースへのコメント追加
- **フィルタリング**: ステータスや作成者でのフィルタリング
- **検索機能**: キーワード検索
- **バージョン管理**: テストケースの履歴管理

---

## 関連ドキュメント

- [全体ドキュメント](../README.md) - バックエンド全体の概要
- [認証API](../auth/) - 認証関連のAPI
- [ロギングガイド](../common/logging.md) - ロギングの使用方法

---

**最終更新**: 2025-10-29
**バージョン**: 1.0.0
