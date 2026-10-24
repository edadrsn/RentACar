import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';


@Module({
  controllers: [TenantsController],
  providers: [TenantsService ],
})
export class TenantsModule {}

//provider:İş mantığı ve veritabanı erişimi için kullanılacak sınıfları NestJS'e tanıtır.
//Genelde @Injectable() ile işaretlenmiş service sınıfları provider olarak kullanılır