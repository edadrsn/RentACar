-- AlterTable
ALTER TABLE "TenantApplication" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;
