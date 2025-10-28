# FICOM 結合テスト管理ツール

結合テストの内容を作成、管理、承認できるWebアプリケーションです。

## プロジェクト構成

このプロジェクトは以下のような構成になっています：

- `backend/` - NestJS + GraphQL + Prismaによるバックエンド API
- `frontend/` - （未実装）フロントエンドアプリケーション

## バックエンド

バックエンドは以下の技術スタックで構築されています：

- **Framework**: NestJS 11.x
- **API**: GraphQL (Code First)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Code Quality**: Biome

詳細は [backend/README.md](./backend/README.md) を参照してください。

## セットアップ

### 1. PostgreSQLのインストール

PostgreSQL 14.x以上をインストールしてください。

### 2. バックエンドのセットアップ

```bash
cd backend
npm install
cp .env.example .env
# .envファイルを編集してデータベース接続情報を設定
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

アプリケーションは http://localhost:4000 で起動します。
GraphQL Playground: http://localhost:4000/graphql

## 機能

### 実装済み
- ✅ JWT認証（サインアップ/ログイン）
- ✅ ユーザー管理
- ✅ Prismaによるデータベース管理
- ✅ GraphQL API

### 実装予定
- 🚧 テストケース管理（作成、編集、削除、一覧）
- 🚧 タグ・カテゴリによる分類
- 🚧 コメント付き承認フロー
- 🚧 ファイル添付機能
- 🚧 フロントエンドアプリケーション

## ライセンス

UNLICENSED 
