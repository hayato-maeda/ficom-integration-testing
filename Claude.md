# フロントエンド技術選定

## バックエンドの現状

### 技術スタック
- **フレームワーク**: NestJS 11
- **API**: GraphQL
- **認証**: JWT（アクセストークン + リフレッシュトークン）
- **データベース**: PostgreSQL + Prisma
- **レスポンス形式**: 統一形式（`{isValid, message, data}`）

### 提供API
- **認証**: signUp, login, refreshToken
- **タグ管理**: CRUD + テストケースへの割り当て
- **テストケース管理**: CRUD

### 認証フロー
- アクセストークン: 有効期限1時間（JWT）
- リフレッシュトークン: 有効期限7日（UUID）
- トークンローテーション方式採用
- ログイン時に既存セッション無効化

## フロントエンド要件（検討中）

### 必須機能
1. GraphQLクライアント統合
2. 認証管理（トークン保存、自動リフレッシュ、ログアウト）
3. ルーティング
4. フォーム管理・バリデーション
5. TypeScript対応

### 検討事項

#### 1. フレームワーク選定
**候補**:
- [ ] Next.js (App Router / Pages Router)
- [ ] Vite + React
- [ ] その他

**質問**:
- SSR/SSGが必要か？
- SEOは重要か？
- 開発速度と学習コストのバランスは？

#### 2. GraphQLクライアント
**候補**:
- [ ] Apollo Client
- [ ] urql
- [ ] TanStack Query + graphql-request

**質問**:
- キャッシング戦略はどの程度重要か？
- リアルタイム機能（Subscription）は必要か？

#### 3. 状態管理
**候補**:
- [ ] Context API（React標準）
- [ ] Zustand
- [ ] Jotai / Recoil
- [ ] Redux Toolkit

**質問**:
- アプリケーションの複雑度は？
- グローバル状態はどの程度必要か？

#### 4. UIライブラリ
**候補**:
- [ ] Material-UI (MUI)
- [ ] Ant Design
- [ ] Chakra UI
- [ ] shadcn/ui + Tailwind CSS
- [ ] CSS-in-JS (Emotion, styled-components)

**質問**:
- デザインシステムの自由度は？
- カスタマイズ性 vs 開発速度？

#### 5. フォーム管理
**候補**:
- [ ] React Hook Form
- [ ] Formik
- [ ] 標準のReact（uncontrolled）

#### 6. 認証管理
**候補**:
- [ ] カスタム実装（Context + localStorage/sessionStorage）
- [ ] NextAuth.js（Next.js使用時）
- [ ] その他認証ライブラリ

---

## 技術選定の進め方

このドキュメントを基に、以下の流れで対話形式で決定していきます：

1. **プロジェクトの特性確認**（規模、納期、チーム構成など）
2. **各レイヤーの技術選定**
3. **最終的な技術スタック決定**
4. **プロジェクト構成設計**

---

## メモ・決定事項

### プロジェクト特性
- **用途**: 社内ツール
- **想定ユーザー数**: 10名程度
- **開発体制**: 現在1名（フロントエンド経験あり）、将来的に増員予定
- **SSR**: 必要
- **リアルタイム**: 現時点では不要
- **デザイン**: モダンな管理画面UI（未定）
- **モバイル対応**: 希望

### 優先順位
1. **柔軟性**（最優先）
2. **開発速度**
3. **パフォーマンス**
4. **保守性**
5. **学習コスト**

---

## 推奨技術スタック

### 1. フレームワーク: **Next.js 15 (App Router)** ⭐

**選定理由**:
- ✅ SSR/SSG標準対応（要件を完全に満たす）
- ✅ 柔軟性が非常に高い（Server ComponentsとClient Componentsの使い分け）
- ✅ ファイルベースルーティングで開発速度が速い
- ✅ 将来的なチーム拡大時も構造が明確で保守しやすい
- ✅ Reactのベストプラクティスが組み込まれている

**代替案**:
- Vite + React: SSRの実装が追加作業になる（柔軟性は高いが開発速度が落ちる）

### 2. GraphQLクライアント: **Apollo Client** ⭐

**選定理由**:
- ✅ 最も柔軟なキャッシング戦略（柔軟性◎）
- ✅ Next.js App Routerとの統合パターンが確立
- ✅ エラーハンドリングとローディング状態の管理が簡単
- ✅ 将来的なSubscription対応も可能
- ✅ DevToolsが優秀（開発速度向上）

**代替案**:
- urql: 軽量だが柔軟性はApolloに劣る
- TanStack Query + graphql-request: REST的な使い方には向くがGraphQLの恩恵が薄い

### 3. 状態管理: **React標準（useState + Context API）** ⭐

**選定理由**:
- ✅ **外部ライブラリへの依存なし**（柔軟性◎）
- ✅ React標準なので学習コストゼロ
- ✅ 10名規模ならパフォーマンス問題なし
- ✅ Apollo Clientがサーバー状態を管理するため、ローカル状態は最小限
- ✅ 必要に応じて後からZustand等に移行可能

**使用方針**:
```typescript
// ローカル状態: useState, useReducer
// グローバル状態: Context API
// サーバー状態: Apollo Client（キャッシュ）
```

**管理する状態**:
- **認証状態**: Context API（ログイン状態、ユーザー情報）
- **UI状態**: useState（モーダル開閉、フォーム入力など）
- **サーバーデータ**: Apollo Client（テストケース、タグなど）

**代替案**:
- Zustand: より大規模になった場合の選択肢
- Redux Toolkit: 過剰スペック

### 4. UIライブラリ: **shadcn/ui + Tailwind CSS** ⭐

**選定理由**:
- ✅ **柔軟性が最高レベル**（コンポーネントを直接編集可能）
- ✅ モダンで美しい管理画面UIがすぐに作れる（開発速度◎）
- ✅ Tailwind CSSでレスポンシブ対応が容易（モバイル対応）
- ✅ アクセシビリティ標準対応（Radix UIベース）
- ✅ ダークモード標準サポート
- ✅ npmパッケージではなくコードコピー方式（依存関係の問題なし）

**特徴**:
```bash
# コンポーネントをプロジェクトに追加
npx shadcn@latest add button
npx shadcn@latest add form
npx shadcn@latest add table
```
→ コンポーネントが `components/ui/` にコピーされ、自由にカスタマイズ可能

**代替案**:
- MUI: 包括的だが柔軟性に欠ける、カスタマイズに手間
- Ant Design: 中国製で管理画面には最適だが、カスタマイズがやや困難

### 5. フォーム管理: **React Hook Form + Zod** ⭐

**選定理由**:
- ✅ パフォーマンスが非常に高い（再レンダリング最小化）
- ✅ 柔軟なバリデーション（Zodでスキーマ定義）
- ✅ TypeScript型推論が強力
- ✅ shadcn/uiと相性抜群（公式例あり）

**使用例**:
```typescript
const formSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});
```

### 6. 認証管理: **カスタム実装（Apollo + Context API）** ⭐

**選定理由**:
- ✅ バックエンドのJWT仕様に完全対応（柔軟性◎）
- ✅ Apollo Linkでトークンリフレッシュを自動化
- ✅ Context APIでトークン状態管理（React標準）
- ✅ シンプルで理解しやすい

**実装方針**:
```typescript
// 1. AuthContext でログイン状態・トークン管理
// 2. Apollo Linkでトークンを自動付与
// 3. 401エラー時に自動リフレッシュ
// 4. トークンはhttpOnlyでない場合はlocalStorageに保存
```

**AuthContextの構造例**:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
```

---

## 追加推奨ライブラリ

### 開発体験向上
- **TypeScript**: 標準
- **ESLint + Prettier**: コード品質維持
- **Biome**: 高速なLinter/Formatter（Prettier代替候補）

### ユーティリティ
- **clsx / cn**: クラス名の条件付き結合
- **date-fns** または **Day.js**: 日付操作（軽量）
- **zod**: バリデーションスキーマ

### テスト（将来的に）
- **Vitest**: Jest互換の高速テストランナー
- **Testing Library**: コンポーネントテスト
- **Playwright**: E2Eテスト

---

## プロジェクト構成案

```
frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 認証グループ
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # ダッシュボードグループ
│   │   ├── layout.tsx       # 共通レイアウト
│   │   ├── test-cases/
│   │   └── tags/
│   ├── layout.tsx           # ルートレイアウト
│   └── providers.tsx        # プロバイダー設定
├── components/
│   ├── ui/                  # shadcn/ui コンポーネント
│   ├── forms/               # フォームコンポーネント
│   └── layouts/             # レイアウトコンポーネント
├── lib/
│   ├── apollo/              # Apollo Client設定
│   ├── graphql/             # GraphQLクエリ/ミューテーション
│   └── utils/               # ユーティリティ
├── contexts/                # React Context（認証等）
└── types/                   # TypeScript型定義
```

---

---

## 状態管理の詳細設計

### 状態の分類と管理方法

| 状態の種類 | 管理方法 | 例 |
|-----------|---------|-----|
| **サーバー状態** | Apollo Client | テストケース一覧、タグ一覧、ユーザー情報 |
| **グローバルUI状態** | Context API | 認証状態、テーマ設定 |
| **ローカルUI状態** | useState | モーダル開閉、フォーム入力、ページング |
| **フォーム状態** | React Hook Form | 入力値、バリデーション |

### Context構成案

```typescript
// contexts/auth-context.tsx
export const AuthProvider: React.FC<PropsWithChildren>

// contexts/theme-context.tsx (オプション)
export const ThemeProvider: React.FC<PropsWithChildren>

// app/providers.tsx（まとめる）
export function Providers({ children }) {
  return (
    <ApolloProvider>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
```

### メリット
- ✅ シンプルで理解しやすい
- ✅ 外部ライブラリ依存が少ない
- ✅ Apollo Clientが主な状態管理を担うため、追加の状態管理は最小限
- ✅ 将来的にZustandやJotaiへの移行も容易

---

---

## プロジェクトセットアップ手順

### ステップ1: Next.jsプロジェクトの作成

```bash
# frontendディレクトリを作成
npx create-next-app@latest frontend --typescript --tailwind --app --use-npm

# オプション選択（推奨）
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Turbopack for `next dev`? … Yes
✔ Would you like to customize the import alias? … No
```

### ステップ2: 必要なパッケージのインストール

```bash
cd frontend

# Apollo Client
npm install @apollo/client graphql

# shadcn/ui依存パッケージ
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react @radix-ui/react-icons

# フォーム管理
npm install react-hook-form @hookform/resolvers zod

# 日付処理
npm install date-fns

# 開発用
npm install -D @types/node
```

### ステップ3: shadcn/ui のセットアップ

```bash
# shadcn/ui初期化
npx shadcn@latest init

# 初期設定（推奨）
✔ Which style would you like to use? › New York
✔ Which color would you like to use as base color? › Neutral
✔ Would you like to use CSS variables for colors? › yes

# 基本コンポーネントの追加
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add toast
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar
```

### ステップ4: フォルダ構造の作成

```bash
# 必要なディレクトリを作成
mkdir -p app/(auth)/login
mkdir -p app/(auth)/signup
mkdir -p app/(dashboard)/test-cases
mkdir -p app/(dashboard)/tags
mkdir -p components/forms
mkdir -p components/layouts
mkdir -p lib/apollo
mkdir -p lib/graphql
mkdir -p lib/utils
mkdir -p contexts
mkdir -p types
```

### ステップ5: 環境変数の設定

```bash
# .env.local を作成
cat > .env.local << 'EOF'
# GraphQL API endpoint
NEXT_PUBLIC_GRAPHQL_URI=http://localhost:4000/graphql

# アプリケーション設定
NEXT_PUBLIC_APP_NAME="Test Case Management"
EOF
```

### ステップ6: TypeScript設定の最適化

`tsconfig.json` に以下を追加：
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/contexts/*": ["./contexts/*"],
      "@/types/*": ["./types/*"]
    }
  }
}
```

### ステップ7: Tailwind CSS設定の調整

`tailwind.config.ts` を確認・調整：
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // shadcn/uiが自動で設定
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

---

## 次の作業

セットアップが完了したら、以下を実装していきます：

1. ✅ **Apollo Clientの設定** (`lib/apollo/apollo-client.ts`)
2. ✅ **認証Contextの作成** (`contexts/auth-context.tsx`)
3. ✅ **GraphQLクエリ/ミューテーションの定義** (`lib/graphql/`)
4. ✅ **Providerのセットアップ** (`app/providers.tsx`)
5. ✅ **ログイン画面の実装**

---

## 実装開始の確認

これらのセットアップ手順で問題なければ、実際にコマンドを実行してプロジェクトを作成しましょうか？
