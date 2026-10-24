import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantApplicationDto } from './dto/create-tenant-application.dto';


@Injectable()
export class TenantApplicationsService {
    constructor(private readonly prisma: PrismaService) {}

    //Constructor metot bir sınıftan bir nesne oluşturulduğu an çalışan metottur
    //Burdaki amacı TenantApplicationService sınıfının ihtiyaç duyduğu PrismaService bağımlılığını almasını sağlamaktır
    
    //Yeni şirket başvurusunu kaydeden metot
    async create(createTenantApplicationDto : CreateTenantApplicationDto){
        return this.prisma.tenantApplication.create({
            data: {
                companyName: createTenantApplicationDto.companyName,
                slug: createTenantApplicationDto.slug,
                contactName: createTenantApplicationDto.contactName,
                contactEmail : createTenantApplicationDto.contactEmail,
                contactPhone: createTenantApplicationDto.contactPhone,
            },
        });
    }

    //Tüm şirket başvurularını listeleyen metot
    async findAll(){
        return this.prisma.tenantApplication.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    
 
}
