# バックエンドドキュメント

このディレクトリには、バックエンドシステムの技術仕様とAPIドキュメントが含まれています。

## ドキュメント構成

ドキュメントは機能モジュールごとに整理されています。各モジュールは `src/` ディレクトリの構成と対応しています。

```
backend/docs/
├── README.md              # このファイル
├── auth/                  # 認証機能
│   ├── README.md         # 認証APIガイド
│   ├── signup.md         # ユーザー登録API
│   ├── login.md          # ログインAPI
│   ├── refresh-token.md  # トークンリフレッシュAPI
│   └── me.md            # 現在のユーザー取得API
└── common/               # 共通機能
    └── logging.md        # ロギングガイド
```

## モジュール別ドキュメント

### 🔐 [認証 (auth)](./auth/)

ユーザー認証とトークン管理に関するAPIドキュメント

- **対象ユーザー**: すべてのフロントエンド開発者
- **主な機能**: ユーザー登録、ログイン、JWT トークン管理
- **認証方式**: JWT（JSON Web Token）

**含まれるAPI**:
- [signUp](./auth/signup.md) - 新規ユーザー登録
- [login](./auth/login.md) - ログイン
- [refreshToken](./auth/refresh-token.md) - トークンリフレッシュ
- [me](./auth/me.md) - 現在のユーザー取得

### 🛠️ [共通機能 (common)](./common/)

アプリケーション全体で使用される共通機能のドキュメント

- **対象ユーザー**: すべてのバックエンド開発者
- **主な内容**: ロギング、エラーハンドリング、ユーティリティ

**含まれるドキュメント**:
- [logging.md](./common/logging.md) - ロギングの使用方法とベストプラクティス

## クイックスタート

### 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集してください

# データベースのセットアップ
npx prisma migrate dev
npx prisma db seed

# サーバーの起動
npm run start:dev
```

### GraphQL Playground (Apollo Sandbox)

開発サーバー起動後、以下のURLでAPIをテストできます：

```
http://localhost:4000/graphql
```

### 最初のAPIリクエスト

1. **ユーザー登録**:
```graphql
mutation SignUp {
  signUp(signUpInput: {
    email: "test@example.com"
    password: "SecurePassword123!"
    name: "テストユーザー"
  }) {
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

2. **取得したトークンを使用して認証**:

HTTP Headers に以下を追加:
```json
{
  "Authorization": "Bearer <取得したaccessToken>"
}
```

3. **現在のユーザー情報を取得**:
```graphql
query Me {
  me {
    id
    email
    name
    createdAt
  }
}
```

## 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| **フレームワーク** | NestJS | 11.0.1 |
| **API** | GraphQL (Apollo Server) | 4.x |
| **データベース** | PostgreSQL | - |
| **ORM** | Prisma | 6.18.0 |
| **認証** | Passport JWT | - |
| **ロギング** | Pino | - |
| **言語** | TypeScript | 5.x |

## 環境変数

アプリケーションの動作に必要な環境変数は `.env.example` に記載されています。

**主要な環境変数**:

```env
# データベース接続
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT 認証
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1h"
REFRESH_TOKEN_EXPIRES_IN="7d"

# サーバー設定
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"

# ロギング
LOG_LEVEL=info
```

## API認証フロー

```
┌─────────────┐
│ ユーザー    │
└──────┬──────┘
       │
       │ 1. signUp / login
       ▼
┌─────────────────────────────────┐
│ アクセストークン (1時間)         │
│ リフレッシュトークン (7日)       │
└─────────────┬───────────────────┘
              │
              │ 2. APIリクエスト (Authorization: Bearer <token>)
              ▼
┌─────────────────────────────────┐
│ 保護されたAPIエンドポイント      │
└─────────────┬───────────────────┘
              │
              │ トークン期限切れ (401)
              ▼
┌─────────────────────────────────┐
│ refreshToken APIで更新           │
└─────────────┬───────────────────┘
              │
              │ 新しいトークンペア
              ▼
┌─────────────────────────────────┐
│ APIリクエスト再試行              │
└─────────────────────────────────┘
```

## 開発ガイドライン

### コーディング規約

- TypeScript の厳格モードを使用
- `as any` の使用は原則禁止
- 戻り値は明示的に定義
- 不変性を保つ（直接的な変更を避ける）

### セキュリティ

- パスワードは必ず bcrypt でハッシュ化
- JWT シークレットは環境変数で管理
- ログに機密情報（パスワード、トークン）を出力しない
- CORS 設定を適切に行う

### ロギング

- 構造化ログを使用（JSON形式）
- 適切なログレベルを設定（debug, info, warn, error）
- ユーザーIDやリクエストIDを含める
- 詳細は [logging.md](./common/logging.md) を参照

## トラブルシューティング

### サーバーが起動しない

1. `.env` ファイルが存在するか確認
2. データベースが起動しているか確認
3. `logs` ディレクトリの権限を確認
4. `node_modules` を削除して再インストール

### データベース接続エラー

```bash
# データベースの状態を確認
npx prisma db push

# マイグレーションをリセット
npx prisma migrate reset
```

### 認証エラー

- JWT_SECRET が設定されているか確認
- トークンの形式が `Bearer <token>` になっているか確認
- トークンの有効期限を確認

## 今後の拡張予定

以下の機能モジュールが今後追加される予定です：

- **test-cases/** - テストケース管理API
- **tags/** - タグ管理API
- **approvals/** - 承認フロー管理API
- **comments/** - コメント機能API
- **files/** - ファイル管理API

各モジュールのドキュメントは、実装時に対応するディレクトリに追加されます。

## 参考リンク

- [NestJS ドキュメント](https://docs.nestjs.com/)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [Apollo Server ドキュメント](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL 仕様](https://graphql.org/)

## 貢献

ドキュメントの改善提案や誤字脱字の修正は歓迎します。

---

**最終更新**: 2025-10-29
**バージョン**: 1.0.0
