import { Body , Controller , Post , } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags  } from '@nestjs/swagger';
import { TenantApplicationsService } from './tenant-applications.service';
import { CreateTenantApplicationDto } from './dto/create-tenant-application.dto';

@ApiTags('Tenant Applications')
@Controller('tenant-applications')
export class TenantApplicationsController {
    constructor(private readonly tenantApplicationsService: TenantApplicationsService, ) {}

    //Tüm şirket başvurularını listeleme
    /*@Get()
    @ApiOperation({ summary: ' Tüm şirket başvurularını listele'})
    @ApiResponse({ status: 200 , description: 'Tüm şirketlerin başvuruları başarıyla listelendi' })
    findAll(){
        return this.tenantApplicationsService.findAll();
    }*/


    //Yeni şirket başvurusu oluştur
    @Post()
    @ApiOperation({ summary : 'Yeni şirket başvurusunu oluştur'})
    @ApiResponse({ status:201 , description: 'Yeni şirket başvurusu başarıyla oluşturuldu'})
    @ApiResponse({ status: 400 , description : 'Geçersiz veriler.  Gönderilen verileri kontrol edin'})
    create(@Body() createTenantApplicationDto: CreateTenantApplicationDto){
        return this.tenantApplicationsService.create(createTenantApplicationDto);
    }

    
}