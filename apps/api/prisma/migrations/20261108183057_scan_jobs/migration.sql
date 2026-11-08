-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'FAILED', 'DENIED');

-- CreateTable
CREATE TABLE "ScanJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "ports" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'tcp-connect',
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "result" JSONB NOT NULL DEFAULT '{}',
    "resultHash" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ScanJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScanJob_userId_createdAt_idx" ON "ScanJob"("userId", "createdAt");
