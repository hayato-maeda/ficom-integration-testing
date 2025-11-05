/*
  Warnings:

  - The primary key for the `test_case_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `test_cases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[featureId,testId,testCaseId,userId]` on the table `approvals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `featureId` to the `approvals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `approvals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `featureId` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `featureId` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `featureId` to the `test_case_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testId` to the `test_case_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `featureId` to the `test_cases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."approvals" DROP CONSTRAINT "approvals_testCaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_testCaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."files" DROP CONSTRAINT "files_testCaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."test_case_tags" DROP CONSTRAINT "test_case_tags_testCaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."test_cases" DROP CONSTRAINT "test_cases_testId_fkey";

-- DropIndex
DROP INDEX "public"."approvals_testCaseId_userId_key";

-- AlterTable
ALTER TABLE "approvals" ADD COLUMN     "featureId" INTEGER NOT NULL,
ADD COLUMN     "testId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "featureId" INTEGER NOT NULL,
ADD COLUMN     "testId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "featureId" INTEGER NOT NULL,
ADD COLUMN     "testId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "test_case_tags" DROP CONSTRAINT "test_case_tags_pkey",
ADD COLUMN     "featureId" INTEGER NOT NULL,
ADD COLUMN     "testId" INTEGER NOT NULL,
ADD CONSTRAINT "test_case_tags_pkey" PRIMARY KEY ("featureId", "testId", "testCaseId", "tagId");

-- AlterTable
ALTER TABLE "test_cases" DROP CONSTRAINT "test_cases_pkey",
ADD COLUMN     "featureId" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "test_cases_pkey" PRIMARY KEY ("featureId", "testId", "id");
DROP SEQUENCE "test_cases_id_seq";

-- AlterTable
ALTER TABLE "tests" DROP CONSTRAINT "tests_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "tests_pkey" PRIMARY KEY ("featureId", "id");
DROP SEQUENCE "tests_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "approvals_featureId_testId_testCaseId_userId_key" ON "approvals"("featureId", "testId", "testCaseId", "userId");

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_featureId_testId_fkey" FOREIGN KEY ("featureId", "testId") REFERENCES "tests"("featureId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_case_tags" ADD CONSTRAINT "test_case_tags_featureId_testId_testCaseId_fkey" FOREIGN KEY ("featureId", "testId", "testCaseId") REFERENCES "test_cases"("featureId", "testId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_featureId_testId_testCaseId_fkey" FOREIGN KEY ("featureId", "testId", "testCaseId") REFERENCES "test_cases"("featureId", "testId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_featureId_testId_testCaseId_fkey" FOREIGN KEY ("featureId", "testId", "testCaseId") REFERENCES "test_cases"("featureId", "testId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_featureId_testId_testCaseId_fkey" FOREIGN KEY ("featureId", "testId", "testCaseId") REFERENCES "test_cases"("featureId", "testId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
