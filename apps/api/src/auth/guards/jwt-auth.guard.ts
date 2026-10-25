
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

type AuthenticatedRequest = Request & {
  user?: {
    sub: string;
    role: string;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Token bulunamadı.');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Geçersiz token formatı.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: string;
      }>(token);

      if (
        typeof payload.sub !== 'string' ||
        !payload.sub ||
        typeof payload.role !== 'string'
      ) {
        throw new UnauthorizedException('Geçersiz token içeriği.');
      }

      request.user = {
        sub: payload.sub,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş token.');
    }
  }
}
