# JWT検証の修正 (2025-11-04)

## 問題点

以前の実装では、GraphQLエンドポイントで`GqlSessionGuard`を使用していましたが、このガードは**JWTトークンの検証を一切行っていませんでした**。セッションCookieにユーザー情報があるかだけをチェックしていたため、以下のセキュリティリスクがありました：

### 検出されたセキュリティリスク

1. **トークン失効が機能しない**
   - ログアウト後もセッションCookieがあれば認証が通る
   - `refreshToken`で古いトークンをブラックリストに追加しても意味がない

2. **再ログイン時の旧トークン無効化が機能しない**
   - `tokenValidFromTimestamp`を更新しても検証されない
   - パスワード変更後も古いセッションが有効

3. **トークン署名検証がない**
   - JWTの改ざん検知ができない
   - `JWT_SECRET`を変更しても影響なし

## 修正内容

### 1. `GqlSessionGuard`の修正

**修正前**:
```typescript
@Injectable()
export class GqlSessionGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const session = request.session;
    if (!session || !session.user) {
      throw new UnauthorizedException('セッションが見つかりません。');
    }

    // ⚠️ JWT検証なし！
    const user = await this.prismaService.user.findUnique({
      where: { id: session.user.id },
    });
    
    request.user = user;
    return true;
  }
}
```

**修正後**:
```typescript
@Injectable()
export class GqlSessionGuard extends AuthGuard('jwt') {
  /**
   * GraphQL コンテキストからリクエストオブジェクトを取得
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

### 2. 検証フロー

修正後の認証フローは以下の通り：

1. **GraphQLリクエスト受信**
2. **`GqlSessionGuard`が起動**
   - GraphQLコンテキストからリクエストを取得
3. **`AuthGuard('jwt')`により`JwtStrategy`を呼び出し**
4. **`JwtStrategy.validate()`で以下をチェック**:
   - ✅ セッションからトークンを抽出
   - ✅ JWT署名の検証（Passportが自動実行）
   - ✅ トークンの有効期限チェック（Passportが自動実行）
   - ✅ ブラックリストチェック（`RevokedToken`テーブル）
   - ✅ `tokenValidFromTimestamp`チェック（再ログイン検証）
   - ✅ ユーザー存在確認（Userテーブル）
5. **検証成功時、ユーザー情報をリクエストに設定**

## セキュリティ強化のポイント

### ✅ JWT署名検証
```typescript
// JwtStrategyで自動的に実行される
super({
  secretOrKey: secret,  // JWT_SECRETで署名を検証
  ignoreExpiration: false,  // 有効期限も検証
});
```

### ✅ トークンブラックリストチェック
```typescript
const revokedToken = await this.prismaService.revokedToken.findUnique({
  where: { token },
});

if (revokedToken && new Date() < revokedToken.expiresAt) {
  throw new UnauthorizedException('Token has been revoked');
}
```

### ✅ 再ログイン時のトークン無効化
```typescript
if (user.tokenValidFromTimestamp && payload.iat) {
  const tokenIssuedAt = new Date(payload.iat * 1000);
  if (tokenIssuedAt < user.tokenValidFromTimestamp) {
    throw new UnauthorizedException('Token has been invalidated by re-login');
  }
}
```

## 影響を受けるエンドポイント

以下のGraphQLエンドポイントが、修正後は**完全なJWT検証**を行うようになりました：

- **`TestCasesResolver`**: テストケース関連の全API
- **`TagsResolver`**: タグ関連の全API
- **`FilesResolver`**: ファイル関連の全API
- **`AuthResolver.me`**: 現在のユーザー情報取得

## テスト方法

### 1. 正常系テスト
```graphql
# ログイン
mutation {
  login(loginInput: { email: "test@example.com", password: "password" }) {
    isValid
    data {
      accessToken
      user { id, email }
    }
  }
}

# 認証が必要なクエリ
query {
  me {
    id
    email
    name
  }
}
```

### 2. トークン改ざん検証
- セッションCookieのaccessTokenを手動で変更
- APIリクエスト → `UnauthorizedException`が発生することを確認

### 3. ログアウト後のトークン検証
```graphql
mutation {
  logout {
    isValid
    message
  }
}

# ログアウト後にmeクエリを実行
query {
  me { id }  # → UnauthorizedException
}
```

### 4. 再ログイン後の旧トークン無効化
1. ログインしてトークンAを取得
2. セッションCookieを別の場所に保存
3. 再度ログインしてトークンBを取得
4. トークンAのセッションCookieでAPIリクエスト
5. → `Token has been invalidated by re-login`エラーが発生することを確認

## 注意事項

- この修正により、**REST API**と**GraphQL API**の両方で同じJWT検証が行われます
- `JWT_SECRET`を本番環境では必ず変更してください
- セッションCookieの有効期限（7日）とJWTの有効期限（1時間）は異なります
- リフレッシュトークンは別途`refreshToken` mutationで更新してください

## 関連ファイル

- `src/auth/guards/gql-session.guard.ts` - 修正済み
- `src/auth/strategies/jwt.strategy.ts` - 既存の実装を活用
- `src/auth/guards/jwt-auth.guard.ts` - REST API用（変更なし）
- `src/auth/guards/gql-auth.guard.ts` - 代替実装（使用していない）

## 今後の改善案

1. トークンリフレッシュの自動化（フロントエンド側）
2. 期限切れトークンの自動クリーンアップ（バッチジョブ）
3. レート制限の実装
4. セキュリティログの強化
