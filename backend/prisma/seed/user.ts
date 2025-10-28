import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function createUsers(prisma: PrismaClient) {
  console.log('Creating users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: '管理者太郎',
      },
    }),
    prisma.user.create({
      data: {
        email: 'tester1@example.com',
        password: hashedPassword,
        name: 'テスター花子',
      },
    }),
    prisma.user.create({
      data: {
        email: 'developer@example.com',
        password: hashedPassword,
        name: '開発次郎',
      },
    }),
    prisma.user.create({
      data: {
        email: 'reviewer@example.com',
        password: hashedPassword,
        name: 'レビュー三郎',
      },
    }),
    prisma.user.create({
      data: {
        email: 'qa@example.com',
        password: hashedPassword,
        name: 'QA四郎',
      },
    }),
    prisma.user.create({
      data: {
        email: 'manager@example.com',
        password: hashedPassword,
        name: 'マネージャー五郎',
      },
    }),
    prisma.user.create({
      data: {
        email: 'engineer@example.com',
        password: hashedPassword,
        name: 'エンジニア六郎',
      },
    }),
    prisma.user.create({
      data: {
        email: 'analyst@example.com',
        password: hashedPassword,
        name: 'アナリスト七子',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);
  return users;
}
