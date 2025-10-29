# ロギング使用ガイド

## 概要

このプロジェクトでは、Pinoを使用した高性能なロギングシステムを採用しています。

## ログレベル

利用可能なログレベル（重要度順）：

| レベル | 用途 | 例 |
|--------|------|-----|
| `fatal` | 回復不可能なエラー | アプリケーションがクラッシュする致命的なエラー |
| `error` | エラー | 処理が失敗したが、アプリは継続可能 |
| `warn` | 警告 | 潜在的な問題、非推奨機能の使用 |
| `info` | 情報 | 重要なビジネスロジックの実行 |
| `debug` | デバッグ | 開発時のデバッグ情報 |
| `trace` | トレース | 非常に詳細な実行トレース |

## 基本的な使い方

### 1. サービスでの使用

```typescript
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class YourService {
  constructor(private readonly logger: PinoLogger) {
    // コンテキストを設定（クラス名を指定）
    this.logger.setContext(YourService.name);
  }

  someMethod() {
    // 情報ログ
    this.logger.info('Processing started');

    try {
      // ビジネスロジック
      this.logger.debug({ userId: 123 }, 'User data loaded');
    } catch (error) {
      // エラーログ（スタックトレース付き）
      this.logger.error(error, 'Failed to process');
    }

    // 警告ログ
    this.logger.warn('Using deprecated API');
  }
}
```

### 2. コントローラーでの使用

```typescript
import { Controller } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Controller('items')
export class ItemsController {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ItemsController.name);
  }

  @Get()
  findAll() {
    this.logger.info('Fetching all items');
    // ...
  }
}
```

### 3. リゾルバーでの使用

```typescript
import { Resolver } from '@nestjs/graphql';
import { PinoLogger } from 'nestjs-pino';

@Resolver()
export class ItemsResolver {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(ItemsResolver.name);
  }

  @Query(() => [Item])
  items() {
    this.logger.info('GraphQL query: items');
    // ...
  }
}
```

## 構造化ログ

追加のコンテキスト情報をJSON形式で記録できます。

```typescript
// オブジェクトを第1引数に渡す
this.logger.info({ userId: 123, action: 'login' }, 'User logged in');

// 出力（JSON）:
// {"level":30,"time":"...","userId":123,"action":"login","msg":"User logged in"}
```

## エラーログのベストプラクティス

```typescript
try {
  await this.dangerousOperation();
} catch (error) {
  // エラーオブジェクトを第1引数に渡す（スタックトレース付き）
  this.logger.error(error, 'Operation failed');

  // 追加コンテキスト付き
  this.logger.error(
    { error, userId: user.id, operation: 'delete' },
    'Failed to delete user data'
  );

  throw error; // 必要に応じて再スロー
}
```

## 機密情報の除外

**絶対にログに含めてはいけない情報**：

- パスワード
- トークン（JWT、APIキーなど）
- クレジットカード情報
- 個人を特定できる機密情報

```typescript
// ❌ 悪い例
this.logger.info({ password: user.password }, 'User created');

// ✅ 良い例
this.logger.info({ userId: user.id, email: user.email }, 'User created');
```

## ログレベルの設定

環境変数 `LOG_LEVEL` で制御：

```bash
# 開発環境
LOG_LEVEL=debug

# 本番環境
LOG_LEVEL=info
```

## ログの確認方法

### コンソール出力（開発環境）
```bash
npm run start:dev
```

### ファイル出力
```bash
# JSON形式で表示
cat logs/app.1.log

# 整形して表示
cat logs/app.1.log | jq

# リアルタイム監視
tail -f logs/app.1.log

# エラーのみ表示
cat logs/app.1.log | jq 'select(.level == 50)'
```

## 使用例

### ユーザー登録の例

```typescript
@Injectable()
export class AuthService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AuthService.name);
  }

  async signUp(signUpInput: SignUpInput) {
    this.logger.info({ email: signUpInput.email }, 'User registration started');

    try {
      // ユーザーが既に存在するか確認
      const existingUser = await this.findByEmail(signUpInput.email);
      if (existingUser) {
        this.logger.warn(
          { email: signUpInput.email },
          'Registration attempt with existing email'
        );
        throw new ConflictException('Email already exists');
      }

      // ユーザー作成
      const user = await this.createUser(signUpInput);

      this.logger.info(
        { userId: user.id, email: user.email },
        'User registered successfully'
      );

      return user;
    } catch (error) {
      this.logger.error(
        { error, email: signUpInput.email },
        'User registration failed'
      );
      throw error;
    }
  }
}
```

## ログ出力の推奨タイミング

### 記録すべき処理

- ✅ ユーザー認証・認可
- ✅ データの作成・更新・削除
- ✅ 外部API呼び出し
- ✅ エラー・例外
- ✅ 重要なビジネスロジックの開始・完了
- ✅ パフォーマンスが重要な処理

### 記録不要な処理

- ❌ 単純なGETクエリ（HTTPリクエストログで自動記録済み）
- ❌ バリデーションエラー（例外フィルターで自動記録済み）
- ❌ 高頻度で実行される軽微な処理

## トラブルシューティング

### ログが出力されない

1. 環境変数 `LOG_LEVEL` を確認
2. `PinoLogger` がコンストラクタでインジェクトされているか確認
3. `setContext()` が呼ばれているか確認

### ログファイルが作成されない

1. `logs/` ディレクトリの権限を確認
2. `NODE_ENV` 環境変数を確認（本番環境のみファイル出力）
3. アプリケーションが正常に起動しているか確認
