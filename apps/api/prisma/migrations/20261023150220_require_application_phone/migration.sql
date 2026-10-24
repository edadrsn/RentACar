/*
  Warnings:

  - Made the column `contactPhone` on table `TenantApplication` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TenantApplication" ALTER COLUMN "contactPhone" SET NOT NULL;
