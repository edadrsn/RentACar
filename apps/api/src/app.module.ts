import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantsModule } from './tenants/tenants.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantApplicationsModule } from './tenant-applications/tenant-applications.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TenantsModule,
    PrismaModule,
    TenantApplicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}