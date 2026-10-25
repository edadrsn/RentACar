
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: {
        sub: string;
        role: string;
      };
    }>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Kimlik doğrulaması gerekli.');
    }

    if (user.role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Bu işlem için yetkiniz yok.');
    }

    const admin = await this.prisma.platformAdmin.findUnique({
      where: { id: user.sub },
      select: { id: true },
    });

    if (!admin) {
      throw new ForbiddenException('Platform yöneticisi bulunamadı.');
    }

    return true;
  }
}
