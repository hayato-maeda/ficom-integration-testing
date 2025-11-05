import { PrismaClient, Feature } from '@prisma/client';

export async function createFeatures(prisma: PrismaClient): Promise<Feature[]> {
  console.log('Creating features...');

  const features: Feature[] = [];

  // Feature 1: ユーザー認証機能
  const authFeature = await prisma.feature.create({
    data: {
      name: 'ユーザー認証機能',
      description: 'ユーザーのログイン、サインアップ、パスワードリセットなどの認証機能',
      color: '#3B82F6',
      status: 'TESTING',
    },
  });
  features.push(authFeature);

  // Feature 2: ファイルアップロード
  const uploadFeature = await prisma.feature.create({
    data: {
      name: 'ファイルアップロード',
      description: '各種ファイル形式のアップロード機能',
      color: '#10B981',
      status: 'DEVELOPING',
    },
  });
  features.push(uploadFeature);

  console.log(`✅ Created ${features.length} features`);
  return features;
}
