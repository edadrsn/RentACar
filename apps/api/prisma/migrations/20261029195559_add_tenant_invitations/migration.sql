-- CreateTable
CREATE TABLE "TenantInvitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantInvitation_tokenHash_key" ON "TenantInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "TenantInvitation_tenantId_idx" ON "TenantInvitation"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantInvitation" ADD CONSTRAINT "TenantInvitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
