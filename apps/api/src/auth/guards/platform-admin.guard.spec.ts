
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

import { PlatformAdminGuard } from './platform-admin.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('PlatformAdminGuard', () => {
  let guard: PlatformAdminGuard;

  const mockPrisma = {
    platformAdmin: {
      findUnique: jest.fn(),
    },
  };

  const request: {
    user?: {
      sub: string;
      role: string;
    };
  } = {};

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;

  beforeEach(() => {
    jest.resetAllMocks();
    delete request.user;

    guard = new PlatformAdminGuard(
      mockPrisma as unknown as PrismaService,
    );
  });

  it('geçerli platform yöneticisine izin vermeli', async () => {
    request.user = {
      sub: 'admin-123',
      role: 'PLATFORM_ADMIN',
    };

    mockPrisma.platformAdmin.findUnique.mockResolvedValue({
      id: 'admin-123',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(mockPrisma.platformAdmin.findUnique).toHaveBeenCalledWith({
      where: { id: 'admin-123' },
      select: { id: true },
    });
  });

  it('kimliği doğrulanmamış kullanıcıya 401 vermeli', async () => {
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockPrisma.platformAdmin.findUnique).not.toHaveBeenCalled();
  });

  it('platform yöneticisi olmayan kullanıcıya 403 vermeli', async () => {
    request.user = {
      sub: 'user-123',
      role: 'CUSTOMER',
    };

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );

    expect(mockPrisma.platformAdmin.findUnique).not.toHaveBeenCalled();
  });

  it('veritabanında bulunmayan yöneticiye 403 vermeli', async () => {
    request.user = {
      sub: 'deleted-admin',
      role: 'PLATFORM_ADMIN',
    };

    mockPrisma.platformAdmin.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
