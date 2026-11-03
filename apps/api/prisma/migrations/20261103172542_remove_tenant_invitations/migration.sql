/*
  Warnings:

  - You are about to drop the `TenantInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TenantInvitation" DROP CONSTRAINT "TenantInvitation_tenantId_fkey";

-- DropTable
DROP TABLE "TenantInvitation";
