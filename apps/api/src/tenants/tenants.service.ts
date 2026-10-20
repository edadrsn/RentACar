
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
        companyName: createTenantDto.companyName,
        slug: createTenantDto.slug,
        contactName: createTenantDto.contactName,
        email: createTenantDto.email,
        phone: createTenantDto.phone,
      },
      select: {
        id: true,
        companyName: true,
        slug: true,
        contactName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });
  }


//Veritabanında kayıtlı tenantları(şirketleri) listeler  
async findAll() {
  return this.prisma.tenant.findMany({
    select: {
      id: true,
      companyName: true,
      slug: true,
      contactName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

}
