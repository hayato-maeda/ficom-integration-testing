import { PrismaClient } from '@prisma/client';
import { createUsers } from './seed/user';
import { createTags } from './seed/tag';
import { createTestCases } from './seed/testCase';
import { createTestCaseTags } from './seed/testCaseTag';
import { createFiles } from './seed/file';
import { createApprovals } from './seed/approval';
import { createComments } from './seed/comment';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.file.deleteMany();
  await prisma.testCaseTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Cleared existing data\n');

  // Create data in order
  const users = await createUsers(prisma);
  const tags = await createTags(prisma);
  const testCases = await createTestCases(prisma, users);
  await createTestCaseTags(prisma, testCases, tags);
  await createFiles(prisma, testCases, users);
  await createApprovals(prisma, testCases, users);
  await createComments(prisma, testCases, users);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Tags: ${tags.length}`);
  console.log(`  - Test Cases: ${testCases.length}`);
  console.log('  - Test Case Tags: 18');
  console.log('  - Files: 6');
  console.log('  - Approvals: 8');
  console.log('  - Comments: 10');
  console.log('\n🔑 Test login credentials:');
  console.log('  Email: admin@example.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
