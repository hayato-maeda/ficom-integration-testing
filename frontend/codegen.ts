import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // バックエンドのスキーマファイルを参照
  schema: '../backend/schema.gql',
  // フロントエンドのGraphQLクエリ/ミューテーションファイル
  documents: ['lib/graphql/**/*.ts', 'lib/graphql/**/*.tsx'],
  // 出力設定
  generates: {
    // 型定義の出力先
    './types/generated.ts': {
      plugins: [
        'typescript',                      // 基本的な型
        'typescript-operations',            // クエリ/ミューテーションの型
        'typescript-react-apollo',          // Apollo Client用のhooks
      ],
      config: {
        // 型の設定
        skipTypename: false,               // __typenameを含める
        withHooks: true,                   // Apollo hooksを生成
        withHOC: false,                    // HOCは生成しない
        withComponent: false,              // Componentは生成しない
        scalars: {
          DateTime: 'string',              // DateTimeスカラーをstringにマッピング
        },
        // 命名規則
        namingConvention: {
          typeNames: 'pascal-case#pascalCase',
          enumValues: 'upper-case#upperCase',
        },
        // オプショナルな改善
        avoidOptionals: {
          field: false,                    // フィールドのオプショナルを避けない
          inputValue: false,               // input値のオプショナルを避けない
          object: false,                   // オブジェクトのオプショナルを避けない
        },
        // 型の正確性を高める
        strictScalars: true,
        // 入力型にPick/Omitを使用
        preResolveTypes: false,
      },
    },
  },
  // watchモード設定
  watch: false,
  // エラー時の挙動
  errorsOnly: false,
  // 詳細なログ
  verbose: true,
};

export default config;
