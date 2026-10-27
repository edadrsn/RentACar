import { Body , Controller , Post , Get , UseGuards , } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags , ApiBearerAuth  } from '@nestjs/swagger';
import { TenantApplicationsService } from './tenant-applications.service';
import { CreateTenantApplicationDto } from './dto/create-tenant-application.dto';
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

    
}