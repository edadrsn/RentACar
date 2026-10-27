import { Module } from '@nestjs/common';
import { TenantApplicationsController } from './tenant-applications.controller';
import { TenantApplicationsService } from './tenant-applications.service';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';


@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TenantApplicationsController],
  providers: [TenantApplicationsService],
})
export class TenantApplicationsModule {}
