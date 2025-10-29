# 認証API ドキュメント

ユーザー認証とトークン管理に関するAPIドキュメントです。

## 概要

このモジュールは、JWT（JSON Web Token）ベースの認証システムを提供します。ユーザー登録、ログイン、トークン管理など、アプリケーションのセキュリティに関わる重要な機能を含んでいます。

## API一覧

### 1. [signUp](./signup.md) - ユーザー登録

新規ユーザーをシステムに登録します。

- **種類**: Mutation
- **認証**: 不要
- **説明**: 新しいアカウントを作成し、アクセストークンとリフレッシュトークンを発行します。登録後は即座にログイン状態になります。

**主な機能**:
- メールアドレスとパスワードによる新規登録
- パスワードの自動ハッシュ化（bcrypt）
- JWT トークンペアの発行

---

### 2. [login](./login.md) - ログイン

既存ユーザーの認証を行い、新しいトークンを発行します。

- **種類**: Mutation
- **認証**: 不要
- **説明**: メールアドレスとパスワードで認証し、新しいアクセストークンとリフレッシュトークンを発行します。

**重要な動作**:
- ログイン時、既存のすべてのセッション（他デバイス含む）が無効化されます
- 他のデバイスで使用中のトークンも使用不可になります

---

### 3. [refreshToken](./refresh-token.md) - トークンリフレッシュ

期限切れ間近または期限切れのアクセストークンを新しいトークンで更新します。

- **種類**: Mutation
- **認証**: 不要（リフレッシュトークンが必要）
- **説明**: リフレッシュトークンを使用して新しいトークンペアを発行します。

**トークンローテーション**:
1. 古いリフレッシュトークンを無効化
2. 古いアクセストークンをブラックリストに追加
3. 新しいトークンペアを発行

**セキュリティ**:
- 使用済みのリフレッシュトークンは再利用不可
- 古いアクセストークンは1時間ブラックリストに登録

---

### 4. [me](./me.md) - 現在のユーザー取得

現在ログイン中のユーザー情報を取得します。

- **種類**: Query
- **認証**: 必要（JWT トークン）
- **説明**: JWT トークンから現在ログイン中のユーザー情報を取得します。

**主なユースケース**:
- アプリケーション起動時の認証状態確認
- 保護されたページへのアクセス制御
- ユーザー情報の表示

---

## トークン管理

### トークンの種類

| トークン | 有効期限 | 用途 | 形式 |
|---------|---------|------|------|
| **アクセストークン** | 1時間 | API認証 | JWT（HS256） |
| **リフレッシュトークン** | 7日 | アクセストークン更新 | UUID v4 |

### トークンのライフサイクル

```
1. ログイン/登録
   ↓
2. アクセストークン + リフレッシュトークン発行
   ↓
3. アクセストークンでAPI呼び出し（～1時間）
   ↓
4. アクセストークン期限切れ（401 Unauthorized）
   ↓
5. リフレッシュトークンで新しいトークンペア取得
   ↓
6. 新しいアクセストークンでAPI呼び出し
   ↓
7. リフレッシュトークン期限切れ（7日後）
   ↓
8. 再ログインが必要
```

### トークンの無効化条件

以下の場合、トークンは使用不可になります：

1. **有効期限切れ**
   - アクセストークン: 1時間後
   - リフレッシュトークン: 7日後

2. **トークンリフレッシュ時**
   - 古いアクセストークン: ブラックリストに追加（1時間）
   - 古いリフレッシュトークン: 即座に無効化

3. **再ログイン時**
   - 既存のすべてのトークン（全デバイス）: 即座に無効化

4. **手動無効化**
   - ユーザーアカウント削除時など

---

## 認証フロー

### 初回ログイン

```typescript
// 1. ログイン
const { data } = await client.mutate({
  mutation: LOGIN_MUTATION,
  variables: {
    loginInput: {
      email: 'user@example.com',
      password: 'password123'
    }
  }
});

// 2. トークンを保存
localStorage.setItem('accessToken', data.login.accessToken);
localStorage.setItem('refreshToken', data.login.refreshToken);

// 3. 以降のAPIリクエストでアクセストークンを使用
```

### 自動トークンリフレッシュ

```typescript
// 401エラー時に自動的にトークンをリフレッシュ
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors?.some(err => err.extensions?.code === 'UNAUTHENTICATED')) {
    return fromPromise(
      refreshAccessToken()
        .then((newTokens) => {
          // トークンを更新
          localStorage.setItem('accessToken', newTokens.accessToken);
          localStorage.setItem('refreshToken', newTokens.refreshToken);

          // リクエストを再試行
          operation.setContext({
            headers: {
              authorization: `Bearer ${newTokens.accessToken}`,
            },
          });
          return forward(operation);
        })
    );
  }
});
```

---

## エラーコード一覧

| コード | 説明 | 対処方法 |
|-------|------|---------|
| `UNAUTHENTICATED` | 認証失敗、トークン無効、期限切れ | トークンリフレッシュまたは再ログイン |
| `BAD_USER_INPUT` | 入力データのバリデーションエラー、重複メール | 入力内容を修正 |

---

## セキュリティベストプラクティス

### 1. トークンの保存

**推奨**:
- メモリ内保存（最も安全だが、リロード時に再認証が必要）
- HttpOnly Cookie（XSS攻撃から保護）

**非推奨**:
- `localStorage`（XSS脆弱性のリスク）
- `sessionStorage`（XSS脆弱性のリスク）

### 2. HTTPS の使用

本番環境では必ず HTTPS を使用してください。トークンが平文で送信されるのを防ぎます。

### 3. CORS 設定

信頼できるオリジンのみを許可してください。

```typescript
app.enableCors({
  origin: 'https://your-frontend-domain.com',
  credentials: true,
});
```

### 4. パスワードポリシー

- 最小8文字以上
- 英数字と記号を含む
- 辞書に載っている単語の使用を避ける

---

## 開発環境でのテスト

### Apollo Sandbox

GraphQL APIのテストには Apollo Sandbox を使用できます。

**アクセス方法**:
```
http://localhost:4000/graphql
```

**認証が必要なAPIのテスト**:

1. まず `login` または `signUp` でトークンを取得
2. HTTP Headers に以下を追加:
```json
{
  "Authorization": "Bearer <取得したアクセストークン>"
}
```

### cURL でのテスト

```bash
# ログイン
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($loginInput: LoginInput!) { login(loginInput: $loginInput) { accessToken refreshToken user { id email name } } }",
    "variables": {
      "loginInput": {
        "email": "user@example.com",
        "password": "password123"
      }
    }
  }'

# 現在のユーザー取得（認証必須）
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <アクセストークン>" \
  -d '{
    "query": "query Me { me { id email name } }"
  }'
```

---

## よくある質問

### Q1. トークンの有効期限はどのくらいですか？

- **アクセストークン**: 1時間
- **リフレッシュトークン**: 7日間

### Q2. トークンが期限切れになったらどうすればいいですか？

リフレッシュトークンを使用して新しいトークンペアを取得してください。リフレッシュトークンも期限切れの場合は、再ログインが必要です。

### Q3. 複数のデバイスで同時にログインできますか？

いいえ。再ログインすると既存のすべてのセッション（トークン）が無効化されます。最後にログインしたデバイスのみがアクティブになります。

### Q4. トークンはどこに保存すべきですか？

**開発環境**: `localStorage` でも可（簡易性優先）
**本番環境**: HttpOnly Cookie または メモリ内保存を推奨（セキュリティ優先）

### Q5. パスワードを変更する方法は？

現時点ではパスワード変更APIは実装されていません。今後追加予定です。

---

## 実装の詳細

### データベーススキーマ

認証機能で使用される主なテーブル：

- **User**: ユーザー情報（メール、パスワード、tokenValidFromTimestamp）
- **RefreshToken**: リフレッシュトークンの管理
- **RevokedToken**: 無効化されたアクセストークンのブラックリスト

詳細は [Prismaスキーマ](../../prisma/schema.prisma) を参照してください。

### ログ出力

認証関連のログは構造化されたJSON形式で出力されます。詳細は [ロギングガイド](../common/logging.md) を参照してください。

**ログ例**:
```json
{
  "level": 30,
  "context": "AuthService",
  "userId": 1,
  "email": "user@example.com",
  "msg": "Login successful"
}
```

---

## クイックリファレンス

| API | 種類 | 認証 | 説明 |
|-----|------|------|------|
| [signUp](./signup.md) | Mutation | ❌ 不要 | 新規ユーザー登録 |
| [login](./login.md) | Mutation | ❌ 不要 | ログイン |
| [refreshToken](./refresh-token.md) | Mutation | ❌ 不要 ※1 | トークンリフレッシュ |
| [me](./me.md) | Query | ✅ 必要 | 現在のユーザー取得 |

※1: リフレッシュトークンが必要（Authorization ヘッダーは不要）

---

## 関連ドキュメント

- [全体ドキュメント](../README.md) - バックエンド全体の概要
- [ロギングガイド](../common/logging.md) - ロギングの使用方法
- [Prismaスキーマ](../../prisma/schema.prisma) - データベーススキーマ定義

---

**最終更新**: 2025-10-29
**バージョン**: 1.0.0
