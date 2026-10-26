
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { configureApp } from '../src/config/app.config';

describe('Health Check (e2e)', () => {
  let app: INestApplication<App>;

  const prismaMock = {
    $queryRaw: jest.fn(),
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

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/health - database connected returns 200', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'RentACar API',
      database: 'connected',
      timestamp: expect.any(String),
    });

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('GET /api/health - database disconnected returns 503', async () => {
    prismaMock.$queryRaw.mockRejectedValue(
      new Error('Database connection failed'),
    );

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(503);

    expect(response.body).toEqual({
      status: 'error',
      service: 'RentACar API',
      database: 'disconnected',
      timestamp: expect.any(String),
    });
  });
});
