
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const request = {
    headers: {} as { authorization?: string },
    user: undefined as { sub: string; role: string } | undefined,
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;

  beforeEach(() => {
    jest.resetAllMocks();
    request.headers = {};
    request.user = undefined;
    guard = new JwtAuthGuard(mockJwtService as unknown as JwtService);
  });

  it('geçerli token ile erişime izin vermeli', async () => {
    request.headers.authorization = 'Bearer valid-token';

    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'admin-123',
      role: 'PLATFORM_ADMIN',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual({
      sub: 'admin-123',
      role: 'PLATFORM_ADMIN',
    });
  });

  it('token yoksa 401 döndürmeli', async () => {
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('Bearer formatı yanlışsa 401 döndürmeli', async () => {
    request.headers.authorization = 'Basic invalid-token';

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('token geçersizse 401 döndürmeli', async () => {
    request.headers.authorization = 'Bearer invalid-token';
    mockJwtService.verifyAsync.mockRejectedValue(
      new Error('Invalid signature'),
    );

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('token süresi dolmuşsa 401 döndürmeli', async () => {
    request.headers.authorization = 'Bearer expired-token';
    mockJwtService.verifyAsync.mockRejectedValue(
      new Error('Token expired'),
    );

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('token içeriği eksikse 401 döndürmeli', async () => {
    request.headers.authorization = 'Bearer incomplete-token';

    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'admin-123',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
