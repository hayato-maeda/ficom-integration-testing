import { PrismaClient, TestCase, User } from '@prisma/client';

export async function createApprovals(prisma: PrismaClient, testCases: TestCase[], users: User[]) {
  console.log('Creating approvals...');

  await Promise.all([
    // Approvals for test case 1 (approved by 2 users) - Feature1 Test1 TestCase1
    prisma.approval.create({
      data: {
        featureId: testCases[0].featureId,
        testId: testCases[0].testId,
        testCaseId: testCases[0].id,
        userId: users[3].id,
        status: 'APPROVED',
        comment: '問題なくログインできることを確認しました。承認します。',
      },
    }),
    prisma.approval.create({
      data: {
        featureId: testCases[0].featureId,
        testId: testCases[0].testId,
        testCaseId: testCases[0].id,
        userId: users[5].id,
        status: 'APPROVED',
        comment: 'テスト内容が適切です。',
      },
    }),

    // Approvals for test case 2 (pending review) - Feature1 Test1 TestCase2
    prisma.approval.create({
      data: {
        featureId: testCases[1].featureId,
        testId: testCases[1].testId,
        testCaseId: testCases[1].id,
        userId: users[3].id,
        status: 'PENDING',
      },
    }),
    prisma.approval.create({
      data: {
        featureId: testCases[1].featureId,
        testId: testCases[1].testId,
        testCaseId: testCases[1].id,
        userId: users[5].id,
        status: 'PENDING',
      },
    }),

    // Approval for test case 4 (rejected) - Feature1 Test2 TestCase1
    prisma.approval.create({
      data: {
        featureId: testCases[3].featureId,
        testId: testCases[3].testId,
        testCaseId: testCases[3].id,
        userId: users[3].id,
        status: 'REJECTED',
        comment: 'エラーの詳細が不足しています。エラーログとスクリーンショットを追加してください。',
      },
    }),

    // Approval for test case 5 (pending) - Feature1 Test2 TestCase2
    prisma.approval.create({
      data: {
        featureId: testCases[4].featureId,
        testId: testCases[4].testId,
        testCaseId: testCases[4].id,
        userId: users[5].id,
        status: 'PENDING',
      },
    }),

    // Approvals for test case 6 (approved) - Feature2 Test1 TestCase1
    prisma.approval.create({
      data: {
        featureId: testCases[5].featureId,
        testId: testCases[5].testId,
        testCaseId: testCases[5].id,
        userId: users[0].id,
        status: 'APPROVED',
        comment: '承認フローの確認ができました。',
      },
    }),

    // Approval for test case 8 (pending) - Feature2 Test1 TestCase3
    prisma.approval.create({
      data: {
        featureId: testCases[7].featureId,
        testId: testCases[7].testId,
        testCaseId: testCases[7].id,
        userId: users[3].id,
        status: 'PENDING',
      },
    }),
  ]);

  console.log('✅ Created 8 approvals');
}
