import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TenantsController],
  providers: [TenantsService ],
})
export class TenantsModule {}

//provider:İş mantığı ve veritabanı erişimi için kullanılacak sınıfları NestJS'e tanıtır.
//Genelde @Injectable() ile işaretlenmiş service sınıfları provider olarak kullanılır