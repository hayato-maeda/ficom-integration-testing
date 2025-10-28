import { PrismaClient } from '@prisma/client';

export async function createTags(prisma: PrismaClient) {
  console.log('Creating tags...');

  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: '機能テスト',
        color: '#3B82F6',
      },
    }),
    prisma.tag.create({
      data: {
        name: '回帰テスト',
        color: '#10B981',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'UI/UX',
        color: '#8B5CF6',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'セキュリティ',
        color: '#EF4444',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'パフォーマンス',
        color: '#F59E0B',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'API',
        color: '#06B6D4',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'データベース',
        color: '#EC4899',
      },
    }),
    prisma.tag.create({
      data: {
        name: '緊急',
        color: '#DC2626',
      },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);
  return tags;
}
