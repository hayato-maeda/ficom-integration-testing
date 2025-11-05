/*
  Warnings:

  - You are about to drop the `test_case_features` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `testId` to the `test_cases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."test_case_features" DROP CONSTRAINT "test_case_features_featureId_fkey";

-- DropForeignKey
ALTER TABLE "public"."test_case_features" DROP CONSTRAINT "test_case_features_testCaseId_fkey";

-- AlterTable
ALTER TABLE "test_cases" ADD COLUMN     "testId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."test_case_features";

-- CreateTable
CREATE TABLE "tests" (
    "id" SERIAL NOT NULL,
    "featureId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
