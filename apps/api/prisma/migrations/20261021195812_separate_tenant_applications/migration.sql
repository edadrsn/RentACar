/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `Tenant` table. All the data in the column will be lost.
  - Added the required column `name` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TenantApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "Tenant_status_createdAt_idx";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "approvedAt",
DROP COLUMN "companyName",
DROP COLUMN "contactName",
DROP COLUMN "email",
DROP COLUMN "phone",
DROP COLUMN "rejectionReason",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TenantApplication" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "status" "TenantApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "TenantApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantApplication_tenantId_key" ON "TenantApplication"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantApplication" ADD CONSTRAINT "TenantApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
