import { PrismaClient, TestCase, User } from '@prisma/client';

export async function createFiles(prisma: PrismaClient, testCases: TestCase[], users: User[]) {
  console.log('Creating files...');

  await Promise.all([
    prisma.file.create({
      data: {
        filename: 'login-screenshot.png',
        path: '/uploads/test-cases/login-screenshot.png',
        mimeType: 'image/png',
        size: 245678,
        featureId: testCases[0].featureId,
        testId: testCases[0].testId,
        testCaseId: testCases[0].id,
        uploadedBy: users[0].id,
      },
    }),
    prisma.file.create({
      data: {
        filename: 'error-log.txt',
        path: '/uploads/test-cases/error-log.txt',
        mimeType: 'text/plain',
        size: 12345,
        featureId: testCases[3].featureId,
        testId: testCases[3].testId,
        testCaseId: testCases[3].id,
        uploadedBy: users[3].id,
      },
    }),
    prisma.file.create({
      data: {
        filename: 'test-data.xlsx',
        path: '/uploads/test-cases/test-data.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 56789,
        featureId: testCases[5].featureId,
        testId: testCases[5].testId,
        testCaseId: testCases[5].id,
        uploadedBy: users[5].id,
      },
    }),
    prisma.file.create({
      data: {
        filename: 'dashboard-screenshot.png',
        path: '/uploads/test-cases/dashboard-screenshot.png',
        mimeType: 'image/png',
        size: 345678,
        featureId: testCases[0].featureId,
        testId: testCases[0].testId,
        testCaseId: testCases[0].id,
        uploadedBy: users[1].id,
      },
    }),
    prisma.file.create({
      data: {
        filename: 'api-response.json',
        path: '/uploads/test-cases/api-response.json',
        mimeType: 'application/json',
        size: 8901,
        featureId: testCases[6].featureId,
        testId: testCases[6].testId,
        testCaseId: testCases[6].id,
        uploadedBy: users[7].id,
      },
    }),
    prisma.file.create({
      data: {
        filename: 'performance-report.pdf',
        path: '/uploads/test-cases/performance-report.pdf',
        mimeType: 'application/pdf',
        size: 678901,
        featureId: testCases[7].featureId,
        testId: testCases[7].testId,
        testCaseId: testCases[7].id,
        uploadedBy: users[4].id,
      },
    }),
  ]);

  console.log('✅ Created 6 files');
}
