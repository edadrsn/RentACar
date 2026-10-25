
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';

@ApiTags('Tenants') //Swagger dokümantasyonunda bu controller için başlık
@Controller('tenants')  //temel url tenants
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  //Veritabanında kayıtlı şirketleri listeler
  @Get()
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Tüm şirketleri listele'})
  @ApiResponse({  status: 200, description: 'Tüm şirketler başarıyla listelendi' })
  findAll() {
    return this.tenantsService.findAll();
  }

  //Yeni şirket oluştur
  @Post()
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Yeni şirket oluştur'})
  @ApiResponse({ status: 201, description: 'Yeni şirket başarıyla oluşturuldu'})
  @ApiResponse({ status: 400, description: 'Geçersiz veriler. Gönderilen verleri kontrol edin' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }
}


