import { Feature, PrismaClient } from '@prisma/client';

export async function createFeatures(prisma: PrismaClient): Promise<Feature[]> {
  console.log('Creating features...');

  const features = await Promise.all([
    prisma.feature.create({
      data: {
        name: '認証機能',
        description: 'ユーザー認証に関する機能（ログイン、パスワードリセットなど）',
      },
    }),
    prisma.feature.create({
      data: {
        name: 'テストケース管理',
        description: 'テストケースの作成、編集、削除機能',
      },
    }),
    prisma.feature.create({
      data: {
        name: 'ファイル管理',
        description: 'ファイルのアップロード、ダウンロード機能',
      },
    }),
    prisma.feature.create({
      data: {
        name: 'フィルタリング・検索',
        description: 'タグフィルター、キーワード検索機能',
      },
    }),
    prisma.feature.create({
      data: {
        name: 'ワークフロー',
        description: '承認・却下ワークフロー、コメント機能',
      },
    }),
    prisma.feature.create({
      data: {
        name: 'データ表示',
        description: 'エクスポート、ページネーション機能',
      },
    }),
  ]);

  console.log(`✅ Created ${features.length} features`);
  return features;
}
