
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}


  //Yeni bir tenantı(şirketi) veritabanına kaydeder
  async create(createTenantDto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        slug: createTenantDto.slug,
        name: createTenantDto.name,
  },
    });
  }

//select: veritabanındna dönen sonuçta hangi alanların gösterileceğini belirler

//Veritabanında kayıtlı tenantları(şirketleri) listeler  
async findAll() {
  return this.prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

}
