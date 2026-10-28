import { Injectable , ConflictException, NotFoundException,} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantApplicationDto } from './dto/create-tenant-application.dto';
import { TenantApplicationStatus, TenantStatus, } from '../generated/prisma/enums';




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

//Başvuru onaylama metodu, başvuruyu onaylar ve onaylanan şirketi platforma kaydeder   
async approve(id: string) {
  return this.prisma.$transaction(async (tx) => {
    const application = await tx.tenantApplication.findUnique({   //başvuruyu id üzerinden bulur
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Şirket başvurusu bulunamadı.');
    }

    if (application.status !== TenantApplicationStatus.PENDING) {
      throw new ConflictException('Bu başvuru zaten değerlendirilmiş.');
    }

    const existingTenant = await tx.tenant.findUnique({
      where: { slug: application.slug },
    });

    if (existingTenant) {
      throw new ConflictException('Bu şirket slug değeri zaten kullanılıyor.');
    }


    //Sadece hala PENDING olan başvuruyu güncelle 
    const result = await tx.tenantApplication.updateMany({  //belirtilen koşulları sağlayan kayıtları günceller
        where:{
            id,
            status: TenantApplicationStatus.PENDING,
        },
        data:{
            status: TenantApplicationStatus.APPROVED,
            approvedAt: new Date(),
            rejectionReason: null,
        },
    });

    if( result.count !== 1){
        throw new ConflictException('Başvuru zaten değerlendirilmiş veya şirket mevcut',);
    }

    //Onaylanan şirketş platforma kaydet
    const tenant = await tx.tenant.create({
        data:{
            name: application.companyName,
            slug: application.slug,
            status: TenantStatus.APPROVED,
        },
    });

    //Oluşturualn şirketi başvuruyla ilişkilendir
    return tx.tenantApplication.update({
        where:{ id },
        data: {
            tenantId: tenant.id,
        },
    });

  });
}

 
}
