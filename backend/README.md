# 結合テスト管理ツール - Backend

NestJS + GraphQL + Prisma + PostgreSQLで構築された結合テスト管理ツールのバックエンドAPIです。

## 技術スタック

- **Framework**: NestJS 11.x
- **API**: GraphQL (Apollo Server + Code First)
- **Database**: PostgreSQL
- **ORM**: Prisma 6.x
- **Authentication**: JWT + Passport
- **Validation**: class-validator, class-transformer
- **Logging**: Pino (高性能JSON構造化ログ)
- **Code Quality**: Biome (Linter + Formatter)

## 機能

- ✅ JWT認証（サインアップ/ログイン/トークンリフレッシュ）
- ✅ ユーザー管理
- ✅ 高性能ロギングシステム（Pino）
- ✅ GraphQL API（Apollo Sandbox付き）
- 🚧 テストケース管理（CRUD）
- 🚧 タグ・カテゴリによる分類
- 🚧 コメント付き承認フロー
- 🚧 ファイル添付機能

## データモデル

### User（ユーザー）
- 認証情報（email, password）
- プロフィール（name）

### TestCase（テストケース）
- 基本情報（title, description）
- 手順（steps）
- 期待結果（expectedResult）
- 実績（actualResult）
- ステータス（DRAFT, IN_REVIEW, APPROVED, REJECTED, ARCHIVED）

### Tag（タグ）
- タグ名とカラー
- テストケースとの多対多リレーション

### Approval（承認）
- テストケースに対する承認/却下
- コメント機能

### Comment（コメント）
- テストケースへのコメント

### File（ファイル）
- テストケースへのファイル添付

## セットアップ

### 前提条件

- Node.js 20.x以上
- npm 10.x以上
- PostgreSQL 14.x以上

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして、環境変数を設定します。

```bash
cp .env.example .env
```

`.env`ファイルを編集して、データベース接続情報とJWTシークレットを設定します：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ficom_integration_test?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development
```

### 3. データベースのセットアップ

PostgreSQLデータベースを作成し、Prismaマイグレーションを実行します。

```bash
# Prismaクライアントを生成
npm run prisma:generate

# データベースマイグレーション
npm run prisma:migrate
```

### 4. アプリケーションの起動

```bash
# 開発モード（ホットリロード付き）
npm run start:dev

# 本番モード
npm run build
npm run start:prod
```

アプリケーションは `http://localhost:4000` で起動します。
GraphQL Playgroundは `http://localhost:4000/graphql` でアクセスできます。

## スクリプト

### 開発

```bash
npm run start:dev      # 開発モードで起動（ホットリロード）
npm run start:debug    # デバッグモードで起動
```

### ビルド

```bash
npm run build          # プロダクションビルド
npm run start:prod     # ビルド済みアプリを起動
```

### コード品質

```bash
npm run format         # Biomeでコードをフォーマット
npm run format:check   # フォーマットチェック（変更なし）
npm run lint           # Biomeでリント（自動修正）
npm run lint:check     # リントチェック（変更なし）
```

### テスト

```bash
npm run test           # ユニットテスト
npm run test:watch     # ユニットテスト（ウォッチモード）
npm run test:cov       # カバレッジ付きテスト
npm run test:e2e       # E2Eテスト
```

### Prisma

```bash
npm run prisma:generate  # Prismaクライアントを生成
npm run prisma:migrate   # マイグレーションを実行
npm run prisma:studio    # Prisma Studio（GUIツール）を起動
```

## GraphQL API

### 認証

#### サインアップ

```graphql
mutation SignUp {
  signUp(
    signUpInput: {
      email: "user@example.com"
      password: "password123"
      name: "Test User"
    }
  ) {
    accessToken
    user {
      id
      email
      name
    }
  }
}
```

#### ログイン

```graphql
mutation Login {
  login(
    loginInput: {
      email: "user@example.com"
      password: "password123"
    }
  ) {
    accessToken
    user {
      id
      email
      name
    }
  }
}
```

#### 現在のユーザー取得

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

認証が必要なクエリ/ミューテーションには、HTTPヘッダーに以下を設定します：

```
Authorization: Bearer <accessToken>
```

## ロギング

Pinoを使用した高性能ロギングシステムを採用しています。

### 基本的な使い方

```typescript
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class YourService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(YourService.name);
  }

  someMethod() {
    // 情報ログ
    this.logger.info('Processing started');

    // 構造化ログ（追加コンテキスト付き）
    this.logger.info({ userId: 123 }, 'User logged in');

    // エラーログ
    try {
      // ...
    } catch (error) {
      this.logger.error(error, 'Operation failed');
    }
  }
}
```

### ログレベル

環境変数 `LOG_LEVEL` で制御：

```env
LOG_LEVEL=info  # fatal, error, warn, info, debug, trace
```

### ログ出力先

- **開発環境**: コンソール（pino-pretty） + ファイル（`logs/app.*.log`）
- **本番環境**: ファイル（`logs/app.*.log`、JSON形式）

### ログファイル

- **保存先**: `backend/logs/`
- **ローテーション**: 日次 + 10MB
- **保持期間**: 30日

詳細は [`docs/logging.md`](./docs/logging.md) を参照してください。

## プロジェクト構造

```
backend/
├── prisma/
│   ├── schema.prisma          # Prismaスキーマ定義
│   └── migrations/            # マイグレーションファイル
├── src/
│   ├── auth/                  # 認証モジュール
│   │   ├── decorators/        # カスタムデコレーター
│   │   ├── dto/               # データ転送オブジェクト
│   │   ├── guards/            # 認証ガード
│   │   ├── strategies/        # Passport戦略
│   │   ├── auth.module.ts
│   │   ├── auth.resolver.ts
│   │   └── auth.service.ts
│   ├── prisma/                # Prismaサービス
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── users/                 # ユーザーモジュール
│   │   └── models/
│   │       └── user.model.ts  # GraphQL型定義
│   ├── app.module.ts          # ルートモジュール
│   ├── main.ts                # エントリーポイント
├── biome.json                 # Biome設定
├── nest-cli.json              # NestJS CLI設定
├── tsconfig.json              # TypeScript設定
└── package.json               # 依存関係
└── schema.gql             # 自動生成されるGraphQLスキーマ
```

## 次のステップ

実装予定の機能：

1. TestCaseモジュールの実装（CRUD操作）
2. Tagモジュールの実装
3. Approvalモジュールの実装
4. Commentモジュールの実装
5. Fileアップロード機能の実装
6. ページネーション、フィルタリング、ソート機能
7. E2Eテストの追加
8. APIドキュメントの拡充

## ライセンス

UNLICENSED
