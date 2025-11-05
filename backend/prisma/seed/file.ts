import { PrismaClient, TestCase, User } from '@prisma/client';

export async function createFiles(prisma: PrismaClient, testCases: TestCase[], users: User[]) {
  console.log('Creating files...');

  await Promise.all([
    // Files for test case 1 (Login test)
    prisma.file.create({
      data: {
        filename: 'login-screen.png',
        path: '/uploads/login-screen.png',
        mimeType: 'image/png',
        size: 245678,
        testCaseFeatureId: testCases[0].testFeatureId,
        testCaseTestId: testCases[0].testId,
        testCaseId: testCases[0].id,
        uploadedBy: users[0].id,
      },
    }),
    prisma.file.create({
      data: {
        filename: 'dashboard-after-login.png',
        path: '/uploads/dashboard-after-login.png',
        mimeType: 'image/png',
        size: 389012,
        testCaseFeatureId: testCases[0].testFeatureId,
        testCaseTestId: testCases[0].testId,
        testCaseId: testCases[0].id,
        uploadedBy: users[1].id,
      },
    }),

    // File for test case 2 (Password reset)
    prisma.file.create({
      data: {
        filename: 'password-reset-email.png',
        path: '/uploads/password-reset-email.png',
        mimeType: 'image/png',
        size: 156789,
        testCaseFeatureId: testCases[1].testFeatureId,
        testCaseTestId: testCases[1].testId,
        testCaseId: testCases[1].id,
        uploadedBy: users[1].id,
      },
    }),

    // Files for test case 4 (File upload error)
    prisma.file.create({
      data: {
        filename: 'upload-error-screenshot.png',
        path: '/uploads/upload-error-screenshot.png',
        mimeType: 'image/png',
        size: 198765,
        testCaseFeatureId: testCases[3].testFeatureId,
        testCaseTestId: testCases[3].testId,
        testCaseId: testCases[3].id,
        uploadedBy: users[3].id,
      },
    }),
    prisma.file.create({
      data: {
        filename: 'error-log.txt',
        path: '/uploads/error-log.txt',
        mimeType: 'text/plain',
        size: 4567,
        testCaseFeatureId: testCases[3].testFeatureId,
        testCaseTestId: testCases[3].testId,
        testCaseId: testCases[3].id,
        uploadedBy: users[3].id,
      },
    }),

    // File for test case 9 (Export function)
    prisma.file.create({
      data: {
        filename: 'exported-test-cases.csv',
        path: '/uploads/exported-test-cases.csv',
        mimeType: 'text/csv',
        size: 12345,
        testCaseFeatureId: testCases[8].testFeatureId,
        testCaseTestId: testCases[8].testId,
        testCaseId: testCases[8].id,
        uploadedBy: users[0].id,
      },
    }),
  ]);

  console.log('✅ Created 6 files');
}
