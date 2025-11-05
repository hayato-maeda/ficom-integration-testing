/*
  Warnings:

  - This is a breaking change that will drop existing test cases data
  - The `test_cases` table primary key will be changed to composite key (testId, testCaseId)
  - A new `tests` table will be created
  - The `test_case_features` table will be dropped (replaced by tests -> features relationship)

*/

-- DropForeignKey
ALTER TABLE "test_case_features" DROP CONSTRAINT "test_case_features_testCaseId_fkey";
ALTER TABLE "test_case_features" DROP CONSTRAINT "test_case_features_featureId_fkey";
ALTER TABLE "test_case_tags" DROP CONSTRAINT "test_case_tags_testCaseId_fkey";
ALTER TABLE "files" DROP CONSTRAINT "files_testCaseId_fkey";
ALTER TABLE "approvals" DROP CONSTRAINT "approvals_testCaseId_fkey";
ALTER TABLE "comments" DROP CONSTRAINT "comments_testCaseId_fkey";

-- DropTable
DROP TABLE "test_case_features";

-- DropIndex (existing test_cases primary key and related indexes)
ALTER TABLE "test_cases" DROP CONSTRAINT "test_cases_pkey";

-- Drop existing test_cases data (breaking change for development)
TRUNCATE TABLE "test_case_tags" CASCADE;
TRUNCATE TABLE "files" CASCADE;
TRUNCATE TABLE "approvals" CASCADE;
TRUNCATE TABLE "comments" CASCADE;
TRUNCATE TABLE "test_cases" CASCADE;

-- CreateTable: tests
CREATE TABLE "tests" (
    "id" SERIAL NOT NULL,
    "featureId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- AlterTable: test_cases - Add new columns and change structure
ALTER TABLE "test_cases" DROP COLUMN "id";
ALTER TABLE "test_cases" ADD COLUMN "testId" INTEGER NOT NULL;
ALTER TABLE "test_cases" ADD COLUMN "testCaseId" INTEGER NOT NULL;

-- Add composite primary key to test_cases
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_pkey" PRIMARY KEY ("testId", "testCaseId");

-- AlterTable: test_case_tags - Add testId column
ALTER TABLE "test_case_tags" ADD COLUMN "testId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "test_case_tags" RENAME COLUMN "testCaseId" TO "testCaseId_old";
ALTER TABLE "test_case_tags" ADD COLUMN "testCaseId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "test_case_tags" DROP COLUMN "testCaseId_old";

-- Update test_case_tags primary key
ALTER TABLE "test_case_tags" DROP CONSTRAINT "test_case_tags_pkey";
ALTER TABLE "test_case_tags" ADD CONSTRAINT "test_case_tags_pkey" PRIMARY KEY ("testId", "testCaseId", "tagId");

-- AlterTable: files - Add testId column
ALTER TABLE "files" ADD COLUMN "testId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "files" RENAME COLUMN "testCaseId" TO "testCaseId_old";
ALTER TABLE "files" ADD COLUMN "testCaseId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "files" DROP COLUMN "testCaseId_old";

-- AlterTable: approvals - Add testId column and update unique constraint
ALTER TABLE "approvals" DROP CONSTRAINT "approvals_testCaseId_userId_key";
ALTER TABLE "approvals" ADD COLUMN "testId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "approvals" RENAME COLUMN "testCaseId" TO "testCaseId_old";
ALTER TABLE "approvals" ADD COLUMN "testCaseId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "approvals" DROP COLUMN "testCaseId_old";

-- Update approvals unique constraint
CREATE UNIQUE INDEX "approvals_testId_testCaseId_userId_key" ON "approvals"("testId", "testCaseId", "userId");

-- AlterTable: comments - Add testId column
ALTER TABLE "comments" ADD COLUMN "testId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "comments" RENAME COLUMN "testCaseId" TO "testCaseId_old";
ALTER TABLE "comments" ADD COLUMN "testCaseId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "comments" DROP COLUMN "testCaseId_old";

-- AddForeignKey: tests -> features
ALTER TABLE "tests" ADD CONSTRAINT "tests_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: test_cases -> tests
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: test_case_tags -> test_cases (composite key)
ALTER TABLE "test_case_tags" ADD CONSTRAINT "test_case_tags_testId_testCaseId_fkey" FOREIGN KEY ("testId", "testCaseId") REFERENCES "test_cases"("testId", "testCaseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: files -> test_cases (composite key)
ALTER TABLE "files" ADD CONSTRAINT "files_testId_testCaseId_fkey" FOREIGN KEY ("testId", "testCaseId") REFERENCES "test_cases"("testId", "testCaseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: approvals -> test_cases (composite key)
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_testId_testCaseId_fkey" FOREIGN KEY ("testId", "testCaseId") REFERENCES "test_cases"("testId", "testCaseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: comments -> test_cases (composite key)
ALTER TABLE "comments" ADD CONSTRAINT "comments_testId_testCaseId_fkey" FOREIGN KEY ("testId", "testCaseId") REFERENCES "test_cases"("testId", "testCaseId") ON DELETE CASCADE ON UPDATE CASCADE;
