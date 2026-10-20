
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@ApiTags('Tenants') //Swagger dokümantasyonunda bu controller için başlık
@Controller('tenants')  //temel url tenants
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}
  // export: Başka dosyaların bu sınıfı içe aktarabilmesini sağlar.

  //Veritabanında kayıtlı şirketleri listeler
  @Get()
  @ApiOperation({ summary: 'Tüm şirketleri listele'})
  @ApiResponse({
    status: 200,
    description: 'Tüm şirketler başarıyla listelendi'
  })
  findAll() {
    return this.tenantsService.findAll();
  }

  //Yeni şirket oluştur
  @Post()
  @ApiOperation({ summary: 'Yeni şirket oluştur'})
  @ApiResponse({
    status: 201,
    description: 'Yeni şirket başarıyla oluşturuldu'
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veriler. Gönderilen verleri kontrol edin'
  })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }
}


