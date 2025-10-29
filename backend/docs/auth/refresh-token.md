# refreshToken - トークンリフレッシュAPI

期限切れ間近または期限切れのアクセストークンを新しいトークンで更新します。

## 基本情報

| 項目 | 内容 |
|------|------|
| **API名** | refreshToken |
| **種類** | Mutation |
| **エンドポイント** | `/graphql` |
| **認証** | 不要（リフレッシュトークンが必要） |

## 概要

リフレッシュトークンを使用して新しいアクセストークンとリフレッシュトークンを発行します。トークンローテーション方式を採用しており、古いトークンはすべて無効化されます。

## リクエスト

### パラメータ

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `refreshTokenInput` | RefreshTokenInput | ✓ | トークンリフレッシュ情報 |
| `refreshTokenInput.refreshToken` | String | ✓ | リフレッシュトークン（UUID） |
| `refreshTokenInput.oldAccessToken` | String | ✓ | 古いアクセストークン（JWT） |

### GraphQLクエリ

```graphql
mutation RefreshToken($refreshTokenInput: RefreshTokenInput!) {
  refreshToken(refreshTokenInput: $refreshTokenInput) {
    accessToken
    refreshToken
    user {
      id
      email
      name
    }
  }
}
```

### Variables

```json
{
  "refreshTokenInput": {
    "refreshToken": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
    "oldAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## レスポンス

### 成功時（200 OK）

```json
{
  "data": {
    "refreshToken": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(NEW)",
      "refreshToken": "p7q8r9s0-t1u2-v3w4-x5y6-z7a8b9c0d1e2(NEW)",
      "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "山田太郎"
      }
    }
  }
}
```

### レスポンスフィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `accessToken` | String | **新しい** JWT アクセストークン（有効期限: 1時間） |
| `refreshToken` | String | **新しい** リフレッシュトークン（有効期限: 7日） |
| `user` | User | ユーザー情報 |
| `user.id` | Int | ユーザーID |
| `user.email` | String | メールアドレス |
| `user.name` | String | ユーザー名 |

## エラー

### 1. 無効なリフレッシュトークン

**ステータスコード**: 401 Unauthorized

**条件**: リフレッシュトークンが存在しない、または無効

```json
{
  "errors": [
    {
      "message": "Invalid refresh token",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### 2. 無効化済みトークン

**ステータスコード**: 401 Unauthorized

**条件**: リフレッシュトークンが既に無効化されている

```json
{
  "errors": [
    {
      "message": "Refresh token has been revoked",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**考えられる原因**:
- ユーザーが別デバイスでログインした
- トークンが既に使用された（トークンローテーション）
- 手動で無効化された

### 3. 期限切れトークン

**ステータスコード**: 401 Unauthorized

**条件**: リフレッシュトークンの有効期限が切れている

```json
{
  "errors": [
    {
      "message": "Refresh token has expired",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**対応**: ユーザーに再ログインを促してください。

## 実装の詳細

### トークンローテーション

このAPIはトークンローテーション方式を採用しています：

1. **古いリフレッシュトークンを無効化**
2. **古いアクセストークンをブラックリストに追加**
3. **新しいトークンペアを発行**

これにより、トークンの盗難リスクを最小化します。

### セキュリティ

#### 古いアクセストークンの無効化

`oldAccessToken` はブラックリストに追加され、以下の期間使用不可になります：
- 追加時点から **1時間**（アクセストークンの元の有効期限まで）

#### リフレッシュトークンの検証

以下の条件をすべて満たす必要があります：
1. トークンがデータベースに存在する
2. `isRevoked` が `false`
3. 有効期限（`expiresAt`）が現在時刻より後

### ログ

以下のログが記録されます：

**成功時**:
```json
{
  "level": 30,
  "context": "AuthService",
  "userId": 1,
  "msg": "Token refresh successful"
}
```

**失敗時（無効なトークン）**:
```json
{
  "level": 40,
  "context": "AuthService",
  "msg": "Token refresh failed: invalid refresh token"
}
```

**失敗時（無効化済み）**:
```json
{
  "level": 40,
  "context": "AuthService",
  "userId": 1,
  "msg": "Token refresh failed: token revoked"
}
```

## 使用例

### cURL

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation RefreshToken($refreshTokenInput: RefreshTokenInput!) { refreshToken(refreshTokenInput: $refreshTokenInput) { accessToken refreshToken user { id email } } }",
    "variables": {
      "refreshTokenInput": {
        "refreshToken": "a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6",
        "oldAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
      mutation RefreshToken($refreshTokenInput: RefreshTokenInput!) {
        refreshToken(refreshTokenInput: $refreshTokenInput) {
          accessToken
          refreshToken
          user {
            id
            email
          }
        }
      }
    `,
    variables: {
      refreshTokenInput: {
        refreshToken: localStorage.getItem('refreshToken'),
        oldAccessToken: localStorage.getItem('accessToken')
      }
    }
  })
});

const { data } = await response.json();

// 新しいトークンで更新
localStorage.setItem('accessToken', data.refreshToken.accessToken);
localStorage.setItem('refreshToken', data.refreshToken.refreshToken);
```

### Apollo Client の自動リフレッシュ例

```typescript
import { ApolloClient, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

let isRefreshing = false;
let pendingRequests = [];

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        if (!isRefreshing) {
          isRefreshing = true;

          return fromPromise(
            refreshAccessToken()
              .then((newTokens) => {
                localStorage.setItem('accessToken', newTokens.accessToken);
                localStorage.setItem('refreshToken', newTokens.refreshToken);
                isRefreshing = false;
                return newTokens.accessToken;
              })
              .catch(() => {
                // リフレッシュ失敗 → ログイン画面へ
                window.location.href = '/login';
                return;
              })
          ).flatMap((accessToken) => {
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: `Bearer ${accessToken}`,
              },
            });
            return forward(operation);
          });
        }
      }
    }
  }
});

async function refreshAccessToken() {
  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: REFRESH_TOKEN_MUTATION,
      variables: {
        refreshTokenInput: {
          refreshToken: localStorage.getItem('refreshToken'),
          oldAccessToken: localStorage.getItem('accessToken')
        }
      }
    })
  });

  const { data } = await response.json();
  return data.refreshToken;
}
```

## ベストプラクティス

### 1. 自動トークンリフレッシュ

アクセストークンの有効期限が切れる前（例: 残り5分）に自動的にリフレッシュすることを推奨します。

```typescript
function scheduleTokenRefresh(accessToken: string) {
  const decoded = jwtDecode(accessToken);
  const expiresIn = decoded.exp * 1000 - Date.now();
  const refreshTime = expiresIn - 5 * 60 * 1000; // 5分前

  setTimeout(() => {
    refreshAccessToken();
  }, refreshTime);
}
```

### 2. エラーハンドリング

401エラー時は自動的にトークンをリフレッシュし、元のリクエストをリトライします。

### 3. リフレッシュ失敗時

リフレッシュが失敗した場合は、ユーザーをログイン画面にリダイレクトします。

## 重要な注意事項

### トークンの使い回し禁止

リフレッシュトークンは**一度だけ**使用できます。使用後は無効化されるため、再利用すると認証エラーになります。

### 同時リクエスト

複数のAPIリクエストが同時に401エラーを返した場合、リフレッシュAPIを重複して呼ばないように注意してください。

## 関連API

- [signUp](./signup.md) - ユーザー登録
- [login](./login.md) - ログイン
- [me](./me.md) - 現在のユーザー取得
