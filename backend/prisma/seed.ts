import { PrismaClient } from '@prisma/client';
import { createApprovals } from './seed/approval';
import { createComments } from './seed/comment';
import { createFeatures } from './seed/feature';
import { createFiles } from './seed/file';
import { createTags } from './seed/tag';
import { createTestCases } from './seed/testCase';
import { createTestCaseTags } from './seed/testCaseTag';
import { createUsers } from './seed/user';

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
  await prisma.test.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Cleared existing data\n');

  // Create data in order
  const users = await createUsers(prisma);
  const features = await createFeatures(prisma);
  const tags = await createTags(prisma);
  await createTestCases(prisma, users, features);

  // Get all test cases after creation
  const testCases = await prisma.testCase.findMany();

  await createTestCaseTags(prisma, testCases, tags);
  await createFiles(prisma, testCases, users);
  await createApprovals(prisma, testCases, users);
  await createComments(prisma, testCases, users);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Features: ${features.length}`);
  console.log(`  - Tests: 3`);
  console.log(`  - Test Cases: ${testCases.length}`);
  console.log('  - Test Case Tags: 16');
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
