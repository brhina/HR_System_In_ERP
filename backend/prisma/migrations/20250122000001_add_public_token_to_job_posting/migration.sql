-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN IF NOT EXISTS "publicToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "JobPosting_publicToken_key" ON "JobPosting"("publicToken");

