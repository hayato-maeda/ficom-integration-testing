# refreshToken API の改善 (2025-11-04)

## 変更内容

`refreshToken` mutationを、リクエストパラメーターからトークンを受け取る方式から、**セッションCookieから自動的に取得する方式**に改善しました。

## 変更前

### 呼び出し方法（旧）
```graphql
mutation RefreshToken {
  refreshToken(refreshTokenInput: {
    refreshToken: "uuid-refresh-token-string"
    oldAccessToken: "jwt-access-token-string"
  }) {
    isValid
    message
    data {
      accessToken
      refreshToken
      user { id, email }
    }
  }
}
```

### 問題点
- ❌ クライアント側でトークンを管理する必要がある
- ❌ トークンがGraphQLリクエストボディに含まれる（ログに残る可能性）
- ❌ 手動でトークンを渡す必要があり、UXが悪い

## 変更後

### 呼び出し方法（新）
```graphql
mutation RefreshToken {
  refreshToken {
    isValid
    message
    data {
      accessToken
      refreshToken
      user { id, email }
    }
  }
}
```

### 改善点
- ✅ **引数なし**で呼び出せる
- ✅ セッションCookieから自動的にトークンを取得
- ✅ トークンがリクエストボディに含まれない（セキュリティ向上）
- ✅ クライアント側の実装がシンプルになる

## 実装の詳細

### auth.resolver.ts の変更

**変更前**:
```typescript
@Mutation(() => AuthMutationResponse)
async refreshToken(
  @Args('refreshTokenInput', { type: () => RefreshTokenInput })
  refreshTokenInput: RefreshTokenInput,
  @Session() session: IronSession<SessionData>,
): Promise<AuthMutationResponse> {
  const result = await this.authService.refreshAccessToken(
    refreshTokenInput.refreshToken,
    refreshTokenInput.oldAccessToken
  );
  // ...
}
```

**変更後**:
```typescript
@Mutation(() => AuthMutationResponse)
async refreshToken(
  @Session() session: IronSession<SessionData>,
): Promise<AuthMutationResponse> {
  // セッションからトークンを取得
  const refreshToken = session.refreshToken;
  const oldAccessToken = session.accessToken;

  if (!refreshToken || !oldAccessToken) {
    return {
      isValid: false,
      message: 'セッションにトークンが見つかりません。再度ログインしてください。',
      data: null,
    };
  }

  const result = await this.authService.refreshAccessToken(refreshToken, oldAccessToken);
  // ...
}
```

### トークンの流れ

1. **ログイン時**:
   ```typescript
   session.accessToken = "jwt-token";
   session.refreshToken = "uuid-token";
   await session.save();
   // → ブラウザにセッションCookieが送信される
   ```

2. **refreshToken呼び出し時**:
   ```typescript
   // ブラウザが自動的にセッションCookieを送信
   // → サーバーがセッションからトークンを取得
   const refreshToken = session.refreshToken;
   const oldAccessToken = session.accessToken;
   ```

3. **トークン更新成功時**:
   ```typescript
   session.accessToken = newAccessToken;
   session.refreshToken = newRefreshToken;
   await session.save();
   // → 新しいトークンがセッションに保存される
   ```

## セキュリティ上の利点

### 1. トークンの露出削減
- トークンがGraphQLリクエストボディに含まれない
- ログやトレースにトークンが記録されるリスクが減少

### 2. CSRF対策
- セッションCookieは `httpOnly: true` で設定されている
- JavaScriptからアクセス不可能

### 3. セッション整合性
- トークンが常にセッションと同期している
- 手動でトークンを管理する必要がない

## 使用例

### Playgroundでの使用

```graphql
# 1. ログイン
mutation {
  login(loginInput: {
    email: "test@example.com"
    password: "password123"
  }) {
    isValid
    data {
      user { id, email }
    }
  }
}

# 2. トークンリフレッシュ（引数なし！）
mutation {
  refreshToken {
    isValid
    message
    data {
      user { id, email }
    }
  }
}
```

### フロントエンド（React + Apollo Client）での使用

```typescript
// トークンリフレッシュ
const [refreshToken] = useMutation(REFRESH_TOKEN_MUTATION);

const handleRefresh = async () => {
  try {
    const { data } = await refreshToken();
    // 引数を渡す必要なし！
    // セッションCookieが自動的に送信される
    
    if (data.refreshToken.isValid) {
      console.log('トークンがリフレッシュされました');
    }
  } catch (error) {
    console.error('リフレッシュ失敗:', error);
  }
};
```

## エラーハンドリング

### セッションにトークンがない場合
```json
{
  "data": {
    "refreshToken": {
      "isValid": false,
      "message": "セッションにトークンが見つかりません。再度ログインしてください。",
      "data": null
    }
  }
}
```

この場合、クライアント側で再ログインを促す必要があります。

## 互換性

### 破壊的変更
- ⚠️ **`RefreshTokenInput`が不要になりました**
- ⚠️ 既存のクライアントコードで引数を渡している場合は修正が必要

### 移行方法

**変更前のコード**:
```typescript
const { data } = await refreshToken({
  variables: {
    refreshTokenInput: {
      refreshToken: storedRefreshToken,
      oldAccessToken: storedAccessToken,
    }
  }
});
```

**変更後のコード**:
```typescript
const { data } = await refreshToken();
// 引数なし！セッションから自動取得
```

## まとめ

この改善により：
- ✅ **より安全** - トークンがリクエストボディに含まれない
- ✅ **よりシンプル** - 引数なしで呼び出せる
- ✅ **より一貫性** - 他のAPI（login, logout, me）と同じセッションベース
- ✅ **より便利** - クライアント側でトークン管理が不要

セッションベースの認証フローが完全に統一されました。
