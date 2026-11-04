
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../src/prisma/prisma.service';
import { TenantApplicationsService } from '../src/tenant-applications/tenant-applications.service';
import { assertTestDatabase } from './db-test-guard';
import {
  TenantApplicationStatus,
  TenantStatus,
} from '../src/generated/prisma/enums';

describe('Tenant Applications - Real Database', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();

    await prisma.$connect();

    // Test dışındaki veritabanlarında işlem yapılmasını engeller.
    await assertTestDatabase(prisma);
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  it('transaction hata verdiğinde değişiklikleri geri alır', async () => {
    const slug = `rollback-test-${randomUUID()}`;

    const application = await prisma.tenantApplication.create({
      data: {
        companyName: 'Rollback Test Rent A Car',
        slug,
        contactName: 'Test Yetkilisi',
        contactEmail: 'rollback@example.com',
        contactPhone: '05550000000',
      },
    });

    try {
      await expect(
        prisma.$transaction(async (tx) => {
          await tx.tenantApplication.update({
            where: { id: application.id },
            data: {
              status: TenantApplicationStatus.APPROVED,
              approvedAt: new Date(),
            },
          });

          await tx.tenant.create({
            data: {
              name: application.companyName,
              slug,
              status: TenantStatus.APPROVED,
            },
          });

          // Transaction sırasında bilerek hata oluşturuyoruz.
          throw new Error('Simüle edilen transaction hatası');
        }),
      ).rejects.toThrow('Simüle edilen transaction hatası');

      const updatedApplication =
        await prisma.tenantApplication.findUniqueOrThrow({
          where: { id: application.id },
        });

      const tenant = await prisma.tenant.findUnique({
        where: { slug },
      });

      expect(updatedApplication.status).toBe(
        TenantApplicationStatus.PENDING,
      );

      expect(updatedApplication.approvedAt).toBeNull();
      expect(updatedApplication.tenantId).toBeNull();
      expect(tenant).toBeNull();
    } finally {
      // Test verilerini temizle.
      await prisma.tenantApplication.deleteMany({
        where: { id: application.id },
      });

      await prisma.tenant.deleteMany({
        where: { slug },
      });
    }
  });


  
it('aynı slug ile iki Tenant oluşturulmasını engeller', async () => {
  const slug = `unique-test-${randomUUID()}`;

  try {
    // İlk şirketi oluştur.
    await prisma.tenant.create({
      data: {
        name: 'Birinci Test Şirketi',
        slug,
        status: TenantStatus.APPROVED,
      },
    });

    // Aynı slug ile ikinci şirket oluşturulamaz.
    await expect(
      prisma.tenant.create({
        data: {
          name: 'İkinci Test Şirketi',
          slug,
          status: TenantStatus.APPROVED,
        },
      }),
    ).rejects.toMatchObject({
      code: 'P2002',
    });

    // Veritabanında yalnızca bir şirket bulunmalı.
    const tenants = await prisma.tenant.findMany({
      where: { slug },
    });

    expect(tenants).toHaveLength(1);
  } finally {
    // Test kayıtlarını temizle.
    await prisma.tenant.deleteMany({
      where: { slug },
    });
  }
});


it('iki admin aynı başvuruyu eş zamanlı onayladığında tek Tenant oluşur', async () => {
  const slug = `concurrent-test-${randomUUID()}`;

  const application = await prisma.tenantApplication.create({
    data: {
      companyName: 'Concurrent Test Rent A Car',
      slug,
      contactName: 'Test Yetkilisi',
      contactEmail: 'concurrent@example.com',
      contactPhone: '05550000000',
    },
  });

  const service = new TenantApplicationsService(prisma);

  try {
    const results = await Promise.allSettled([
      service.approve(application.id),
      service.approve(application.id),
    ]);

    const successful = results.filter(
      (result) => result.status === 'fulfilled',
    );

    const failed = results.filter(
      (result) => result.status === 'rejected',
    );

    expect(successful).toHaveLength(1);
    expect(failed).toHaveLength(1);

    const tenants = await prisma.tenant.findMany({
      where: { slug },
    });

    expect(tenants).toHaveLength(1);

    const updatedApplication =
      await prisma.tenantApplication.findUniqueOrThrow({
        where: { id: application.id },
      });

    expect(updatedApplication.status).toBe(
      TenantApplicationStatus.APPROVED,
    );

    expect(updatedApplication.tenantId).toBe(
      tenants[0].id,
    );
  } finally {
    // Önce başvurunun Tenant bağlantısını kaldır.
    await prisma.tenantApplication.deleteMany({
      where: { id: application.id },
    });

    // Ardından test şirketini sil.
    await prisma.tenant.deleteMany({
      where: { slug },
    });
  }
});


});
