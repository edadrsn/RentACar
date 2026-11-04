
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { configureApp } from '../src/config/app.config';
import { TenantApplicationStatus } from '../src/generated/prisma/enums';

describe('Tenant Applications (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let adminToken: string;

  const admin = {
    id: 'test-admin-id',
    email: 'admin@example.com',
    passwordHash: 'test-password-hash',
  };

  // Gerçek PostgreSQL yerine Prisma Mock kullanıyoruz.
  const prismaMock = {
    platformAdmin: {
      findUnique: jest.fn(),
    },
    tenantApplication: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  // Test uygulamasını başlat
  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(PrismaService)
        .useValue(prismaMock)
        .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);

    jwtService = app.get(JwtService);

    const configService = app.get(ConfigService);
    const secret = configService.getOrThrow<string>('JWT_SECRET');

    adminToken = await jwtService.signAsync(
      {
        sub: admin.id,
        role: 'PLATFORM_ADMIN',
      },
      { secret },
    );

    await app.init();
  });

  // Her testten önce Mock verilerini hazırla
  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock.platformAdmin.findUnique.mockResolvedValue(admin);
    prismaMock.tenantApplication.findMany.mockResolvedValue([]);

    prismaMock.$transaction.mockImplementation(
      async (
        callback: (tx: typeof prismaMock) => Promise<unknown>,
      ) => callback(prismaMock),
    );
  });

  // Testler tamamlandığında uygulamayı kapat
  afterAll(async () => {
    await app?.close();
  });

  // =====================================================
  // GET - ŞİRKET BAŞVURULARINI LİSTELEME
  // =====================================================

  it('GET - JWT olmadan 401 döner', async () => {
    await request(app.getHttpServer())
      .get('/api/tenant-applications')
      .expect(401);
  });

  it('GET - geçersiz JWT ile 401 döner', async () => {
    await request(app.getHttpServer())
      .get('/api/tenant-applications')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('GET - geçerli admin token ile 200 döner', async () => {
    await request(app.getHttpServer())
      .get('/api/tenant-applications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect([]);

    expect(
      prismaMock.tenantApplication.findMany,
    ).toHaveBeenCalledWith({
      where: {},
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  // YENİ TEST - APPROVED filtreleme
  it('GET - APPROVED başvuruları filtreler', async () => {
    prismaMock.tenantApplication.findMany.mockResolvedValue([]);

    await request(app.getHttpServer())
      .get('/api/tenant-applications?status=APPROVED')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(
      prismaMock.tenantApplication.findMany,
    ).toHaveBeenCalledWith({
      where: {
        status: TenantApplicationStatus.APPROVED,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });


  
it('GET - geçersiz status değerinde 400 döner', async () => {
  await request(app.getHttpServer())
    .get('/api/tenant-applications?status=INVALID')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(400);

  expect(
    prismaMock.tenantApplication.findMany,
  ).not.toHaveBeenCalled();
});


  // =====================================================
  // PATCH APPROVE - ŞİRKET BAŞVURUSUNU ONAYLAMA
  // =====================================================

  it('PATCH approve - JWT olmadan 401 döner', async () => {
    await request(app.getHttpServer())
      .patch('/api/tenant-applications/application-1/approve')
      .expect(401);
  });

  it('PATCH approve - geçersiz JWT ile 401 döner', async () => {
    await request(app.getHttpServer())
      .patch('/api/tenant-applications/application-1/approve')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('PATCH approve - admin başvuruyu onaylar', async () => {
    prismaMock.tenantApplication.findUnique.mockResolvedValue({
      id: 'application-1',
      companyName: 'Test Rent A Car',
      slug: 'test-rentacar',
      status: TenantApplicationStatus.PENDING,
    });

    prismaMock.tenant.findUnique.mockResolvedValue(null);

    prismaMock.tenantApplication.updateMany.mockResolvedValue({
      count: 1,
    });

    prismaMock.tenant.create.mockResolvedValue({
      id: 'tenant-1',
      name: 'Test Rent A Car',
      slug: 'test-rentacar',
      status: 'APPROVED',
    });

    prismaMock.tenantApplication.update.mockResolvedValue({
      id: 'application-1',
      status: TenantApplicationStatus.APPROVED,
      tenantId: 'tenant-1',
    });

    await request(app.getHttpServer())
      .patch('/api/tenant-applications/application-1/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          id: 'application-1',
          status: TenantApplicationStatus.APPROVED,
          tenantId: 'tenant-1',
        });
      });

    expect(prismaMock.tenant.create).toHaveBeenCalledTimes(1);
  });

  it('PATCH approve - olmayan başvuruda 404 döner', async () => {
    prismaMock.tenantApplication.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .patch('/api/tenant-applications/missing-id/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    expect(prismaMock.tenant.create).not.toHaveBeenCalled();
  });

  it('PATCH approve - önceden onaylanan başvuruda 409 döner', async () => {
    prismaMock.tenantApplication.findUnique.mockResolvedValue({
      id: 'application-1',
      status: TenantApplicationStatus.APPROVED,
    });

    await request(app.getHttpServer())
      .patch('/api/tenant-applications/application-1/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(409);

    expect(prismaMock.tenant.create).not.toHaveBeenCalled();
  });

  // =====================================================
  // PATCH REJECT - ŞİRKET BAŞVURUSUNU REDDETME
  // =====================================================

  describe('PATCH /api/tenant-applications/:id/reject', () => {
    it('JWT olmadan 401 döner', async () => {
      await request(app.getHttpServer())
        .patch('/api/tenant-applications/application-1/reject')
        .send({ rejectionReason: 'Eksik belgeler' })
        .expect(401);
    });

    it('geçersiz ret gerekçesinde 400 döner', async () => {
      await request(app.getHttpServer())
        .patch('/api/tenant-applications/application-1/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: '' })
        .expect(400);
    });

    it('olmayan başvuruda 404 döner', async () => {
      prismaMock.tenantApplication.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/api/tenant-applications/missing-id/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Eksik belgeler' })
        .expect(404);
    });

    it('değerlendirilmiş başvuruda 409 döner', async () => {
      prismaMock.tenantApplication.findUnique.mockResolvedValue({
        id: 'application-1',
        status: TenantApplicationStatus.APPROVED,
      });

      await request(app.getHttpServer())
        .patch('/api/tenant-applications/application-1/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Eksik belgeler' })
        .expect(409);
    });

    it('PENDING başvuruyu reddeder ve 200 döner', async () => {
      prismaMock.tenantApplication.findUnique.mockResolvedValue({
        id: 'application-1',
        status: TenantApplicationStatus.PENDING,
      });

      prismaMock.tenantApplication.updateMany.mockResolvedValue({
        count: 1,
      });

      prismaMock.tenantApplication.findUniqueOrThrow.mockResolvedValue({
        id: 'application-1',
        status: TenantApplicationStatus.REJECTED,
        rejectionReason: 'Eksik belgeler',
        tenantId: null,
      });

      const response = await request(app.getHttpServer())
        .patch('/api/tenant-applications/application-1/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ rejectionReason: 'Eksik belgeler' })
        .expect(200);

      expect(response.body.status).toBe(
        TenantApplicationStatus.REJECTED,
      );

      expect(response.body.rejectionReason).toBe('Eksik belgeler');
      expect(response.body.tenantId).toBeNull();
    });
  });
});
