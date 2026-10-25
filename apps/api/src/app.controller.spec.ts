
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('veritabani baglantisi basariliysa ok donmeli', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await appController.getHealth();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('RentACar API');
      expect(result.database).toBe('connected');
      expect(result.timestamp).toBeDefined();
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('veritabani baglantisi basarisizsa 503 donmeli', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(appController.getHealth()).rejects.toThrow(
        HttpException,
      );

      try {
        await appController.getHealth();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    });
  });
});
