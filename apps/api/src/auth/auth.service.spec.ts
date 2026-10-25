
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('argon2', () => ({
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    platformAdmin: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const admin = {
    id: 'admin-123',
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('doğru bilgilerle JWT döndürmeli', async () => {
    mockPrisma.platformAdmin.findUnique.mockResolvedValue(admin);
    jest.mocked(argon2.verify).mockResolvedValue(true);
    mockJwtService.signAsync.mockResolvedValue('test-token');

    const result = await service.login({
      email: 'ADMIN@example.com',
      password: 'correct-password',
    });

    expect(mockPrisma.platformAdmin.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    });

    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: admin.id,
      role: 'PLATFORM_ADMIN',
    });

    expect(result).toEqual({
      accessToken: 'test-token',
      tokenType: 'Bearer',
    });
  });

  it('yönetici bulunamazsa 401 hatası vermeli', async () => {
    mockPrisma.platformAdmin.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'unknown@example.com',
        password: 'some-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(argon2.verify).not.toHaveBeenCalled();
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });

  it('şifre yanlışsa 401 hatası vermeli', async () => {
    mockPrisma.platformAdmin.findUnique.mockResolvedValue(admin);
    jest.mocked(argon2.verify).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'admin@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });
});
