
import { Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  //Emaille super admini bulacak ve şifreyi doğrulayacak. Eğer doğruysa JWT token üretecek
  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();

    const admin = await this.prisma.platformAdmin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException(
        'E-posta veya şifre hatalı.',
      );
    }

    const isPasswordValid = await argon2.verify(
      admin.passwordHash,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'E-posta veya şifre hatalı.',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      role: 'PLATFORM_ADMIN',
    });

    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }
}
