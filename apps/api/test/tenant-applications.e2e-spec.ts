
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { configureApp } from '../src/config/app.config';

describe('Tenant Applications (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  const admin = {
    id: 'test-admin-id',
    email: 'admin@example.com',
    passwordHash: 'test-password-hash',
  };

  const prismaMock = {
    platformAdmin: {
      findUnique: jest.fn(),
    },
    tenantApplication: {
      findMany: jest.fn(),
    },
  };

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

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock.platformAdmin.findUnique.mockResolvedValue(admin);
    prismaMock.tenantApplication.findMany.mockResolvedValue([]);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/tenant-applications - missing token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/tenant-applications')
      .expect(401);
  });

  it('GET /api/tenant-applications - invalid token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/tenant-applications')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('GET /api/tenant-applications - valid admin token returns 200', async () => {
    const configService = app.get(ConfigService);
    const secret = configService.getOrThrow<string>('JWT_SECRET');

    const token = await jwtService.signAsync(
      {
        sub: admin.id,
        role: 'PLATFORM_ADMIN',
      },
      { secret },
    );

    await request(app.getHttpServer())
      .get('/api/tenant-applications')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect([]);

    expect(prismaMock.tenantApplication.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc',
      },
    });
  });
});
