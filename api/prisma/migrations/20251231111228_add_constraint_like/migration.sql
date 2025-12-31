/*
  Warnings:

  - A unique constraint covering the columns `[accountId,postId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_accountId_postId_key" ON "Like"("accountId", "postId");
