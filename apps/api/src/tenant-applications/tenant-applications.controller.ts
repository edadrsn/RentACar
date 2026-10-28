import { Body , Controller , Post , Get , UseGuards , Param , Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags , ApiBearerAuth  } from '@nestjs/swagger';
import { TenantApplicationsService } from './tenant-applications.service';
import { CreateTenantApplicationDto } from './dto/create-tenant-application.dto';
import { RejectTenantApplicationDto } from './dto/reject-tenant-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';

@ApiTags('Tenant Applications')
@Controller('tenant-applications')
export class TenantApplicationsController {
    constructor(private readonly tenantApplicationsService: TenantApplicationsService, ) {}

    @Get()
    @UseGuards(JwtAuthGuard , PlatformAdminGuard)  //önce jwtyi ardından paltform admin yetkisini kontrol eder
    @ApiBearerAuth()  //swaggerda bearer tokenle kimlik doğrulaması gerektiğini belirtir
    @ApiOperation({ summary: 'Tüm şirket başvurularını listele'})
    @ApiResponse({ status: 200, description: 'Tüm şirket başvuruları başarıyla listelendi'})
    @ApiResponse({ status: 402, description: 'Kimlik doğrulaması başarısız. Hatalı veya geçersiz token gönderildi.'})
    @ApiResponse({ status: 403 , description: 'Bu işlem için yetkiniz bulunmamaktadır'})    
    findAll(){
        return this.tenantApplicationsService.findAll();
    }
    
  

    //Yeni şirket başvurusu oluştur
    @Post()
    @ApiOperation({ summary : 'Yeni şirket başvurusunu oluştur'})
    @ApiResponse({ status:201 , description: 'Yeni şirket başvurusu başarıyla oluşturuldu'})
    @ApiResponse({ status: 400 , description : 'Geçersiz veriler.  Gönderilen verileri kontrol edin'})
    create(@Body() createTenantApplicationDto: CreateTenantApplicationDto){
        return this.tenantApplicationsService.create(createTenantApplicationDto);
    }
    

    //Şirket başvurusunu onaylama ve şirketi platforma kaydetme
    @Patch(':id/approve')
    @UseGuards(JwtAuthGuard , PlatformAdminGuard)  //sadece yetkili platform adminin onaylanamasını sağlıyor
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Şirket başvurusunun onaylanması',})
    @ApiResponse({ status: 200 , description: 'Şirket başvurusu başarıyla onaylandı',})
    @ApiResponse({ status: 401 , description: 'JWT eksik veya geçersiz',})
    @ApiResponse({ status: 403 , description: 'Bu işlem için yetkiniz yok',})
    @ApiResponse({ status: 404 , description : 'Şirket başvurusu bulunamadı',})
    @ApiResponse({ status : 409 , description: 'Başvuru zaten değerlendirilmiş veya şirket mevcut',})
    approve(@Param('id') id:string){
        return this.tenantApplicationsService.approve(id);
    }

    @Patch(':id/reject')
    @UseGuards(JwtAuthGuard , PlatformAdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Şirket başvurusunun reddedilmesi',})
    @ApiResponse({ status: 200 , description: 'Şirket başvurusu reddedildi',})
    @ApiResponse({ status: 400 , description: 'Ret gerekçesi geçersiz veya boş bırakılamaz',})
    @ApiResponse({ status: 401 , description: 'JWT bulunamadı veya geçersiz',})
    @ApiResponse({ status:403 , description: 'Platform admin yetkisi gerekli',})
    @ApiResponse({ status: 404  ,description: 'Şirket başvurusu bulunamadı',})
    @ApiResponse({ status: 409 , description: 'Başvuru zaten değerlendirilmiş',})
    async rejec(
        @Param('id') id : string,
        @Body() dto: RejectTenantApplicationDto,
    ){
        return this.tenantApplicationsService.reject(id , dto);
    }

}