# signUp - ユーザー登録API

新規ユーザーをシステムに登録します。

## 基本情報

| 項目 | 内容 |
|------|------|
| **API名** | signUp |
| **種類** | Mutation |
| **エンドポイント** | `/graphql` |
| **認証** | 不要 |

## 概要

新しいユーザーアカウントを作成し、アクセストークンとリフレッシュトークンを発行します。登録が成功すると、ユーザーは即座にログイン状態になります。

## リクエスト

### パラメータ

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `signUpInput` | SignUpInput | ✓ | ユーザー登録情報 |
| `signUpInput.email` | String | ✓ | メールアドレス（一意） |
| `signUpInput.password` | String | ✓ | パスワード |
| `signUpInput.name` | String | ✓ | ユーザー名 |

### GraphQLクエリ

```graphql
mutation SignUp($signUpInput: SignUpInput!) {
  signUp(signUpInput: $signUpInput) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      createdAt
      updatedAt
    }
  }
}
```

### Variables

```json
{
  "signUpInput": {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "山田太郎"
  }
}
```

## レスポンス

### 成功時（200 OK）

```json
{
  "data": {
    "signUp": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "山田太郎",
        "createdAt": "2025-10-29T05:00:00.000Z",
        "updatedAt": "2025-10-29T05:00:00.000Z"
      }
    }
  }
}
```

### レスポンスフィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `accessToken` | String | JWT アクセストークン（有効期限: 1時間） |
| `refreshToken` | String | リフレッシュトークン（有効期限: 7日） |
| `user` | User | 登録されたユーザー情報 |
| `user.id` | Int | ユーザーID |
| `user.email` | String | メールアドレス |
| `user.name` | String | ユーザー名 |
| `user.createdAt` | DateTime | 作成日時 |
| `user.updatedAt` | DateTime | 更新日時 |

## エラー

### 1. メールアドレス重複エラー

**ステータスコード**: 409 Conflict

**条件**: 既に登録済みのメールアドレスを使用した場合

```json
{
  "errors": [
    {
      "message": "Email already exists",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

### 2. バリデーションエラー

**ステータスコード**: 400 Bad Request

**条件**: 必須フィールドが欠けている、または形式が不正な場合

```json
{
  "errors": [
    {
      "message": "Validation error",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "validationErrors": [
          {
            "field": "email",
            "message": "email must be an email"
          }
        ]
      }
    }
  ]
}
```

## 実装の詳細

### セキュリティ

- パスワードは bcrypt でハッシュ化されます（ソルトラウンド: 10）
- 平文パスワードはデータベースに保存されません
- トークンは JWT 形式で発行されます

### トークン管理

- **アクセストークン**:
  - 有効期限: 1時間
  - 用途: API認証
  - 形式: JWT（HS256）

- **リフレッシュトークン**:
  - 有効期限: 7日
  - 用途: アクセストークンの更新
  - 形式: UUID v4
  - データベースに保存

### ログ

以下のログが記録されます：

- ユーザー登録開始: `info` レベル
- 重複メール検出: `warn` レベル
- 登録成功: `info` レベル

```json
{
  "level": 30,
  "time": "2025-10-29T05:00:00.000Z",
  "context": "AuthService",
  "email": "user@example.com",
  "msg": "User registration started"
}
```

## 使用例

### cURL

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation SignUp($signUpInput: SignUpInput!) { signUp(signUpInput: $signUpInput) { accessToken refreshToken user { id email name } } }",
    "variables": {
      "signUpInput": {
        "email": "user@example.com",
        "password": "SecurePassword123!",
        "name": "山田太郎"
      }
    }
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      mutation SignUp($signUpInput: SignUpInput!) {
        signUp(signUpInput: $signUpInput) {
          accessToken
          refreshToken
          user {
            id
            email
            name
          }
        }
      }
    `,
    variables: {
      signUpInput: {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        name: '山田太郎'
      }
    }
  })
});

const { data } = await response.json();
console.log('Access Token:', data.signUp.accessToken);
```

## 次のステップ

登録後は以下のAPIを使用できます：

1. 認証が必要なAPIには `accessToken` をAuthorizationヘッダーに設定
2. トークンが期限切れになったら `refreshToken` APIで更新
3. `me` APIで現在のユーザー情報を取得

## 関連API

- [login](./login.md) - ログイン
- [refreshToken](./refresh-token.md) - トークンリフレッシュ
- [me](./me.md) - 現在のユーザー取得
