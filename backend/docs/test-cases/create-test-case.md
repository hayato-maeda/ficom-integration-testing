# createTestCase - テストケース作成API

新規テストケースを作成します。

## 基本情報

| 項目 | 内容 |
|------|------|
| **API名** | createTestCase |
| **種類** | Mutation |
| **エンドポイント** | `/graphql` |
| **認証** | 必要（JWT トークン） |

## 概要

新しいテストケースを作成します。認証されたユーザーが作成者として記録され、初期ステータスはDRAFT（下書き）になります。

## リクエスト

### パラメータ

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `createTestCaseInput` | CreateTestCaseInput | ✓ | テストケース作成情報 |
| `createTestCaseInput.title` | String | ✓ | タイトル |
| `createTestCaseInput.description` | String | | 説明 |
| `createTestCaseInput.steps` | String | ✓ | テスト手順 |
| `createTestCaseInput.expectedResult` | String | ✓ | 期待結果 |
| `createTestCaseInput.actualResult` | String | | 実績結果 |

### GraphQLクエリ

```graphql
mutation CreateTestCase($createTestCaseInput: CreateTestCaseInput!) {
  createTestCase(createTestCaseInput: $createTestCaseInput) {
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
      email
      name
    }
    createdAt
    updatedAt
  }
}
```

### Variables

```json
{
  "createTestCaseInput": {
    "title": "ログイン機能のテスト",
    "description": "正常なログインフローの確認",
    "steps": "1. ログインページにアクセス\n2. 有効なメールアドレスとパスワードを入力\n3. ログインボタンをクリック",
    "expectedResult": "ダッシュボード画面に遷移し、ユーザー名が表示される",
    "actualResult": null
  }
}
```

### ヘッダー

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## レスポンス

### 成功時（200 OK）

```json
{
  "data": {
    "createTestCase": {
      "id": "1",
      "title": "ログイン機能のテスト",
      "description": "正常なログインフローの確認",
      "steps": "1. ログインページにアクセス\n2. 有効なメールアドレスとパスワードを入力\n3. ログインボタンをクリック",
      "expectedResult": "ダッシュボード画面に遷移し、ユーザー名が表示される",
      "actualResult": null,
      "status": "DRAFT",
      "createdById": "1",
      "createdBy": {
        "id": "1",
        "email": "user@example.com",
        "name": "山田太郎"
      },
      "createdAt": "2025-10-29T05:00:00.000Z",
      "updatedAt": "2025-10-29T05:00:00.000Z"
    }
  }
}
```

### レスポンスフィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | Int | テストケースID |
| `title` | String | タイトル |
| `description` | String | 説明 |
| `steps` | String | テスト手順 |
| `expectedResult` | String | 期待結果 |
| `actualResult` | String | 実績結果 |
| `status` | String | ステータス（DRAFT/IN_REVIEW/APPROVED/REJECTED/ARCHIVED） |
| `createdById` | Int | 作成者ID |
| `createdBy` | User | 作成者情報 |
| `createdAt` | DateTime | 作成日時 |
| `updatedAt` | DateTime | 更新日時 |

## エラー

### 1. 認証エラー

**ステータスコード**: 401 Unauthorized

**条件**: トークンが無効または期限切れ

```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### 2. バリデーションエラー

**ステータスコード**: 400 Bad Request

**条件**: 必須フィールドが不足している場合

```json
{
  "errors": [
    {
      "message": "Validation error",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "validationErrors": [
          {
            "field": "title",
            "message": "title should not be empty"
          }
        ]
      }
    }
  ]
}
```

## 実装の詳細

### 初期ステータス

作成時、ステータスは自動的に `DRAFT`（下書き）に設定されます。

### 作成者の記録

認証されたユーザーが自動的に `createdBy` として記録されます。手動で作成者を指定することはできません。

### ログ

以下のログが記録されます：

**成功時**:
```json
{
  "level": 30,
  "context": "TestCasesService",
  "userId": 1,
  "title": "ログイン機能のテスト",
  "msg": "Creating test case"
}
```

```json
{
  "level": 30,
  "context": "TestCasesService",
  "testCaseId": 1,
  "userId": 1,
  "msg": "Test case created successfully"
}
```

## 使用例

### cURL

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <アクセストークン>" \
  -d '{
    "query": "mutation CreateTestCase($createTestCaseInput: CreateTestCaseInput!) { createTestCase(createTestCaseInput: $createTestCaseInput) { id title status createdBy { name } createdAt } }",
    "variables": {
      "createTestCaseInput": {
        "title": "ログイン機能のテスト",
        "description": "正常なログインフローの確認",
        "steps": "1. ログインページにアクセス\\n2. 有効なメールアドレスとパスワードを入力\\n3. ログインボタンをクリック",
        "expectedResult": "ダッシュボード画面に遷移し、ユーザー名が表示される"
      }
    }
  }'
```

### JavaScript (fetch)

```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    query: `
      mutation CreateTestCase($createTestCaseInput: CreateTestCaseInput!) {
        createTestCase(createTestCaseInput: $createTestCaseInput) {
          id
          title
          status
          createdBy {
            name
          }
          createdAt
        }
      }
    `,
    variables: {
      createTestCaseInput: {
        title: 'ログイン機能のテスト',
        description: '正常なログインフローの確認',
        steps: '1. ログインページにアクセス\n2. 有効なメールアドレスとパスワードを入力\n3. ログインボタンをクリック',
        expectedResult: 'ダッシュボード画面に遷移し、ユーザー名が表示される'
      }
    }
  })
});

const { data, errors } = await response.json();

if (errors) {
  console.error('Error creating test case:', errors);
} else {
  console.log('Test case created:', data.createTestCase);
}
```

### Apollo Client の例

```typescript
import { gql, useMutation } from '@apollo/client';

const CREATE_TEST_CASE_MUTATION = gql`
  mutation CreateTestCase($createTestCaseInput: CreateTestCaseInput!) {
    createTestCase(createTestCaseInput: $createTestCaseInput) {
      id
      title
      description
      steps
      expectedResult
      actualResult
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
`;

function CreateTestCaseForm() {
  const [createTestCase, { loading, error }] = useMutation(CREATE_TEST_CASE_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const { data } = await createTestCase({
        variables: {
          createTestCaseInput: {
            title: formData.get('title'),
            description: formData.get('description'),
            steps: formData.get('steps'),
            expectedResult: formData.get('expectedResult'),
            actualResult: formData.get('actualResult') || null,
          }
        }
      });

      console.log('Test case created:', data.createTestCase);
      // 成功時の処理（例: 一覧画面へリダイレクト）
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="タイトル" required />
      <textarea name="description" placeholder="説明" />
      <textarea name="steps" placeholder="テスト手順" required />
      <textarea name="expectedResult" placeholder="期待結果" required />
      <textarea name="actualResult" placeholder="実績結果" />
      <button type="submit" disabled={loading}>
        作成
      </button>
      {error && <p>エラーが発生しました: {error.message}</p>}
    </form>
  );
}
```

## ベストプラクティス

### 1. テスト手順の明確化

テスト手順は番号付きリストで記述し、再現可能な形で記載します。

```
✅ 良い例:
1. ログインページ（/login）にアクセス
2. メールアドレス欄に "test@example.com" を入力
3. パスワード欄に "password123" を入力
4. 「ログイン」ボタンをクリック

❌ 悪い例:
ログインする
```

### 2. 期待結果の具体化

期待結果は具体的かつ検証可能な形で記述します。

```
✅ 良い例:
- ダッシュボード画面（/dashboard）に遷移
- ヘッダーに「ようこそ、テストユーザーさん」と表示
- ステータスコードは200

❌ 悪い例:
正しく動作する
```

### 3. 下書き段階での保存

完全に準備ができていない場合でも、DRAFT状態で保存できます。後で編集して完成させることができます。

## テストケースステータスの説明

| ステータス | 説明 | 次のアクション |
|----------|------|-------------|
| **DRAFT** | 下書き（初期状態） | 編集・レビュー申請 |
| **IN_REVIEW** | レビュー中 | 承認・却下 |
| **APPROVED** | 承認済み | テスト実行 |
| **REJECTED** | 却下 | 修正・再申請 |
| **ARCHIVED** | アーカイブ済み | 復元 |

## 関連API

- [testCases](./test-cases.md) - テストケース一覧取得
- [testCase](./test-case.md) - テストケース取得
- [updateTestCase](./update-test-case.md) - テストケース更新
- [deleteTestCase](./delete-test-case.md) - テストケース削除

---

**最終更新**: 2025-10-29
