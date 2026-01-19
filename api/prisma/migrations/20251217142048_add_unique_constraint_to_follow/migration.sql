/*
  Warnings:

  - A unique constraint covering the columns `[accountId,followedAccountId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Follow_accountId_followedAccountId_key" ON "Follow"("accountId", "followedAccountId");
