# me - 現在のユーザー取得API

現在ログイン中のユーザー情報を取得します。

## 基本情報

| 項目 | 内容 |
|------|------|
| **API名** | me |
| **種類** | Query |
| **エンドポイント** | `/graphql` |
| **認証** | 必要（JWT トークン） |

## 概要

JWT アクセストークンから現在ログイン中のユーザー情報を取得します。トークンの検証も兼ねており、トークンが有効であることを確認するためにも使用できます。

## リクエスト

### パラメータ

このAPIはパラメータを必要としません。Authorization ヘッダーに含まれる JWT トークンからユーザー情報を取得します。

### GraphQLクエリ

```graphql
query Me {
  me {
    id
    email
    name
    createdAt
    updatedAt
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
    "me": {
      "id": 1,
      "email": "user@example.com",
      "name": "山田太郎",
      "createdAt": "2025-10-29T05:00:00.000Z",
      "updatedAt": "2025-10-29T05:30:00.000Z"
    }
  }
}
```

### レスポンスフィールド

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | Int | ユーザーID |
| `email` | String | メールアドレス |
| `name` | String | ユーザー名 |
| `createdAt` | DateTime | アカウント作成日時 |
| `updatedAt` | DateTime | 最終更新日時 |

**注意**: セキュリティ上の理由から、`password` フィールドは返却されません。

## エラー

### 1. 認証トークン不在エラー

**ステータスコード**: 401 Unauthorized

**条件**: Authorization ヘッダーが存在しない、またはトークンが含まれていない

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

### 2. 無効なトークンエラー

**ステータスコード**: 401 Unauthorized

**条件**: トークンの形式が不正、または署名が無効

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

### 3. 期限切れトークンエラー

**ステータスコード**: 401 Unauthorized

**条件**: アクセストークンの有効期限（1時間）が切れている

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

**対応**: [refreshToken](./refresh-token.md) APIで新しいトークンを取得してください。

### 4. ブラックリスト登録済みトークン

**ステータスコード**: 401 Unauthorized

**条件**: トークンリフレッシュ時に無効化されたトークンを使用している

```json
{
  "errors": [
    {
      "message": "Token has been revoked",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**原因**: リフレッシュトークンAPIで新しいトークンを取得した際、古いアクセストークンがブラックリストに追加されます。

### 5. 再ログインによる無効化

**ステータスコード**: 401 Unauthorized

**条件**: 別のデバイスやブラウザで再ログインされた後の古いトークン

```json
{
  "errors": [
    {
      "message": "Token has been invalidated by re-login",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**原因**: ユーザーが再度ログインすると、以前発行されたすべてのトークンが無効化されます。

### 6. ユーザーが存在しない

**ステータスコード**: 401 Unauthorized

**条件**: トークンに含まれるユーザーIDがデータベースに存在しない

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

**原因**: ユーザーアカウントが削除された可能性があります。

## 実装の詳細

### 認証フロー

1. **トークン抽出**: Authorization ヘッダーから Bearer トークンを抽出
2. **JWT 検証**: トークンの署名と有効期限を検証
3. **ユーザー情報取得**: トークンのペイロードからユーザーIDを取得し、データベースからユーザー情報を取得
4. **ブラックリストチェック**: トークンがブラックリストに登録されていないか確認
5. **タイムスタンプ検証**: トークンが `tokenValidFromTimestamp` 以降に発行されたものか確認
6. **ユーザー情報返却**: 検証に成功したらユーザー情報を返却

### セキュリティ

#### トークン検証

以下の条件をすべて満たす必要があります：

1. トークンが正しい署名で発行されている（JWT_SECRET で検証）
2. トークンの有効期限が切れていない（1時間以内）
3. トークンがブラックリストに登録されていない
4. トークンの発行時刻が `tokenValidFromTimestamp` 以降である
5. トークンに含まれるユーザーIDが存在する

#### パスワードの隠蔽

GraphQL スキーマで `@HideField()` デコレーターを使用しているため、パスワードハッシュは絶対に返却されません。

### ユースケース

#### 1. アプリケーション起動時の認証状態確認

ページリロードやアプリ起動時に、保存されているトークンが有効かどうかを確認します。

```typescript
async function checkAuthStatus() {
  try {
    const { data } = await client.query({ query: ME_QUERY });
    console.log('Logged in as:', data.me.name);
    return true;
  } catch (error) {
    console.log('Not authenticated');
    return false;
  }
}
```

#### 2. 保護されたページへのアクセス制御

```typescript
// React Router の例
function ProtectedRoute({ children }) {
  const { data, loading, error } = useQuery(ME_QUERY);

  if (loading) return <div>Loading...</div>;
  if (error) return <Navigate to="/login" />;

  return children;
}
```

#### 3. ユーザー情報の表示

```typescript
function UserProfile() {
  const { data } = useQuery(ME_QUERY);

  return (
    <div>
      <h1>Welcome, {data.me.name}</h1>
      <p>Email: {data.me.email}</p>
      <p>Member since: {new Date(data.me.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
```

## 使用例

### cURL

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "query": "query Me { me { id email name createdAt updatedAt } }"
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
      query Me {
        me {
          id
          email
          name
          createdAt
          updatedAt
        }
      }
    `
  })
});

const { data, errors } = await response.json();

if (errors) {
  console.error('Authentication failed:', errors);
  // トークンリフレッシュまたはログイン画面へ
} else {
  console.log('Current user:', data.me);
}
```

### Apollo Client の例

```typescript
import { gql, useQuery } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      createdAt
      updatedAt
    }
  }
`;

function useCurrentUser() {
  const { data, loading, error, refetch } = useQuery(ME_QUERY, {
    // キャッシュを使用して再レンダリングを最小化
    fetchPolicy: 'cache-first',
    // エラー時は例外をスローしない
    errorPolicy: 'all',
  });

  return {
    user: data?.me,
    loading,
    isAuthenticated: !error && !!data?.me,
    refetch,
  };
}

// 使用例
function App() {
  const { user, loading, isAuthenticated } = useCurrentUser();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
    </div>
  );
}
```

### 認証ヘッダーの自動設定（Apollo Client）

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // localStorage からトークンを取得
  const token = localStorage.getItem('accessToken');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

## ベストプラクティス

### 1. トークンの自動更新と組み合わせる

`me` クエリで 401 エラーが返った場合、自動的にトークンリフレッシュを試みます。

```typescript
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // トークンリフレッシュを試行
        return fromPromise(
          refreshTokens()
            .then((newTokens) => {
              // 新しいトークンで再試行
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: `Bearer ${newTokens.accessToken}`,
                },
              });
              return forward(operation);
            })
            .catch(() => {
              // リフレッシュ失敗 → ログイン画面へ
              window.location.href = '/login';
            })
        );
      }
    }
  }
});
```

### 2. キャッシュ戦略

ユーザー情報は頻繁に変更されないため、キャッシュを活用します。

```typescript
const { data } = useQuery(ME_QUERY, {
  // 初回はネットワーク、2回目以降はキャッシュ
  fetchPolicy: 'cache-first',
  // キャッシュ有効期限: 5分
  nextFetchPolicy: 'cache-first',
});
```

### 3. エラーハンドリング

エラー時の適切な処理を実装します。

```typescript
const { data, error } = useQuery(ME_QUERY);

if (error) {
  // トークン期限切れまたは無効化
  if (error.message.includes('Unauthorized')) {
    // リフレッシュを試みる
    await refreshTokens();
  } else {
    // その他のエラー
    console.error('Unexpected error:', error);
  }
}
```

### 4. アプリケーション起動時の初期化

```typescript
// App.tsx
function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initialize() {
      const token = localStorage.getItem('accessToken');

      if (token) {
        // トークンが有効か確認
        try {
          await client.query({ query: ME_QUERY });
        } catch (error) {
          // トークンが無効な場合、リフレッシュを試みる
          try {
            await refreshTokens();
          } catch {
            // リフレッシュ失敗 → トークンをクリア
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      }

      setIsInitialized(true);
    }

    initialize();
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <Router>...</Router>;
}
```

## 重要な注意事項

### トークンの保存場所

**推奨**:
- メモリに保存（最も安全だが、リロード時に再ログインが必要）
- HttpOnly Cookie（XSS攻撃から保護）

**非推奨**:
- `localStorage` に保存（XSS脆弱性のリスクが高い）
- `sessionStorage` に保存（XSS脆弱性のリスク）

### 401エラーの種類

401エラーには複数の原因があります：

1. **トークン期限切れ** → リフレッシュ可能
2. **トークン無効化（ブラックリスト）** → リフレッシュ可能
3. **再ログインによる無効化** → 再ログインが必要
4. **リフレッシュトークン期限切れ** → 再ログインが必要
5. **ユーザー削除** → 再ログインが必要

### パフォーマンス最適化

- 不必要な `me` クエリの実行を避ける
- Apollo Client のキャッシュを活用する
- 認証状態の変更時のみクエリを再実行する

## トラブルシューティング

### 問題: 常に 401 エラーが返される

**確認事項**:
1. Authorization ヘッダーが正しく設定されているか
2. トークンの形式が `Bearer <token>` になっているか
3. トークンが期限切れでないか
4. 別のデバイスで再ログインしていないか

### 問題: ユーザー情報が古い

**解決策**:
```typescript
// キャッシュをクリアして最新情報を取得
await client.query({
  query: ME_QUERY,
  fetchPolicy: 'network-only',
});
```

## 関連API

- [login](./login.md) - ログイン（トークン取得）
- [signUp](./signup.md) - ユーザー登録
- [refreshToken](./refresh-token.md) - トークンリフレッシュ
