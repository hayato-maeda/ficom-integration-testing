# login - ログインAPI

既存ユーザーの認証を行い、新しいトークンを発行します。

## 基本情報

| 項目 | 内容 |
|------|------|
| **API名** | login |
| **種類** | Mutation |
| **エンドポイント** | `/graphql` |
| **認証** | 不要 |

## 概要

メールアドレスとパスワードでユーザーを認証し、アクセストークンとリフレッシュトークンを発行します。ログイン成功時、既存のすべてのセッション（トークン）が無効化されます。

## リクエスト

### パラメータ

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `loginInput` | LoginInput | ✓ | ログイン情報 |
| `loginInput.email` | String | ✓ | メールアドレス |
| `loginInput.password` | String | ✓ | パスワード |

### GraphQLクエリ

```graphql
mutation Login($loginInput: LoginInput!) {
  login(loginInput: $loginInput) {
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
  "loginInput": {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
}
```

## レスポンス

### 成功時（200 OK）

```json
{
  "data": {
    "login": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "山田太郎",
        "createdAt": "2025-10-29T05:00:00.000Z",
        "updatedAt": "2025-10-29T05:30:00.000Z"
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
| `user` | User | ユーザー情報 |
| `user.id` | Int | ユーザーID |
| `user.email` | String | メールアドレス |
| `user.name` | String | ユーザー名 |
| `user.createdAt` | DateTime | アカウント作成日時 |
| `user.updatedAt` | DateTime | 最終更新日時 |

## エラー

### 1. 認証失敗エラー

**ステータスコード**: 401 Unauthorized

**条件**:
- メールアドレスが存在しない
- パスワードが正しくない

```json
{
  "errors": [
    {
      "message": "Invalid credentials",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**セキュリティ上の理由**:
- メールアドレスの存在/不存在を判別できないよう、同じエラーメッセージを返します
- これにより、メールアドレスの列挙攻撃を防ぎます

### 2. バリデーションエラー

**ステータスコード**: 400 Bad Request

**条件**: 必須フィールドが欠けている場合

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
            "message": "email should not be empty"
          }
        ]
      }
    }
  ]
}
```

## 実装の詳細

### セキュリティ

#### パスワード検証
- bcrypt を使用してハッシュ化されたパスワードを検証
- タイミング攻撃を防ぐため、一定時間の処理が保証されます

#### セッション無効化

ログイン時、以下のトークンがすべて無効化されます：

1. **既存のリフレッシュトークン**: すべて無効化
2. **既存のアクセストークン**: `tokenValidFromTimestamp` の更新により無効化

これにより、他のデバイス/ブラウザでのセッションがすべて終了します。

#### トークン発行

新しいトークンペアが発行されます：
- **アクセストークン**: JWT（HS256）、有効期限1時間
- **リフレッシュトークン**: UUID、有効期限7日

### ログ

以下のログが記録されます：

**成功時**:
```json
{
  "level": 30,
  "context": "AuthService",
  "userId": 1,
  "email": "user@example.com",
  "msg": "Login successful"
}
```

**失敗時（ユーザー不在）**:
```json
{
  "level": 40,
  "context": "AuthService",
  "email": "user@example.com",
  "msg": "Login failed: user not found"
}
```

**失敗時（パスワード不正）**:
```json
{
  "level": 40,
  "context": "AuthService",
  "userId": 1,
  "email": "user@example.com",
  "msg": "Login failed: invalid password"
}
```

## 使用例

### cURL

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($loginInput: LoginInput!) { login(loginInput: $loginInput) { accessToken refreshToken user { id email name } } }",
    "variables": {
      "loginInput": {
        "email": "user@example.com",
        "password": "SecurePassword123!"
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
      mutation Login($loginInput: LoginInput!) {
        login(loginInput: $loginInput) {
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
      loginInput: {
        email: 'user@example.com',
        password: 'SecurePassword123!'
      }
    }
  })
});

const { data } = await response.json();

// トークンを保存
localStorage.setItem('accessToken', data.login.accessToken);
localStorage.setItem('refreshToken', data.login.refreshToken);
```

### React Hook の例

```typescript
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

function LoginForm() {
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const { data } = await login({
      variables: {
        loginInput: {
          email: formData.get('email'),
          password: formData.get('password')
        }
      }
    });

    // トークンを保存
    localStorage.setItem('accessToken', data.login.accessToken);
    localStorage.setItem('refreshToken', data.login.refreshToken);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={loading}>
        ログイン
      </button>
      {error && <p>ログインに失敗しました</p>}
    </form>
  );
}
```

## 重要な注意事項

### セッション管理

ログインすると、**他のすべてのデバイス/ブラウザのセッションが無効化**されます。

これは以下のようなシナリオで発生します：

1. デバイスAでログイン → トークンA発行
2. デバイスBでログイン → トークンB発行、**トークンAは無効化**
3. デバイスAで再度APIを呼ぶ → 認証エラー

### トークンの保存

**推奨**:
- `accessToken`: メモリまたは HttpOnly Cookie
- `refreshToken`: HttpOnly Cookie

**非推奨**:
- `localStorage` に保存（XSS脆弱性のリスク）

## 次のステップ

ログイン後の認証フロー：

1. `accessToken` を Authorization ヘッダーに設定してAPIを呼び出す
2. `401 Unauthorized` が返ったら `refreshToken` APIでトークンを更新
3. 新しい `accessToken` で再度APIを呼び出す

## 関連API

- [signUp](./signup.md) - ユーザー登録
- [refreshToken](./refresh-token.md) - トークンリフレッシュ
- [me](./me.md) - 現在のユーザー取得
