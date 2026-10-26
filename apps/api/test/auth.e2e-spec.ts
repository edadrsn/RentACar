
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { configureApp } from '../src/config/app.config';
import * as argon2 from 'argon2';

describe('Auth (e2e)', () => {
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
    tenant: {
      findMany: jest.fn(),
    },
  };
  
  beforeAll(async () => {
    admin.passwordHash = await argon2.hash('TestPassword123!');
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
    prismaMock.tenant.findMany.mockResolvedValue([]);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('POST /api/auth/login - invalid email returns 400', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: 'test-password',
      })
      .expect(400);
  });

  it('POST /api/auth/login - missing password returns 400', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: admin.email,
      })
      .expect(400);
  });

  it('GET /api/tenants - missing token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/tenants')
      .expect(401);
  });

  it('GET /api/tenants - invalid token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/api/tenants')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('GET /api/tenants - valid admin token returns 200', async () => {
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
      .get('/api/tenants')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect([]);
  });
   
  //doğru şifreyle giriş yapıldığında 200 ve geçerli bir jwt döndüğünü kontrol eder
  it('POST /api/auth/login - valid credentials return 200', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      email: admin.email,
      password: 'TestPassword123!',
    })
    .expect(200);

  expect(response.body).toEqual({
    accessToken: expect.any(String),
    tokenType: 'Bearer',
  });

  const payload = await jwtService.verifyAsync(
    response.body.accessToken,
  );

  expect(payload).toMatchObject({
    sub: admin.id,
    role: 'PLATFORM_ADMIN',
  });
});

//yanlış şifreyle giriş yapıldığında 401 döndüğünü kontrol eder
it('POST /api/auth/login - wrong password returns 401', async () => {
  await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      email: admin.email,
      password: 'WrongPassword123!',
    })
    .expect(401);
}); 

});
