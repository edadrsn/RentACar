
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantApplicationsService } from './tenant-applications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  TenantApplicationStatus,
  TenantStatus,
} from '../generated/prisma/enums';

describe('TenantApplicationsService', () => {
  let service: TenantApplicationsService;

  const txMock = {
    tenantApplication: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const prismaMock = {
    $transaction: jest.fn(
      async (callback: (tx: typeof txMock) => Promise<unknown>) =>
        callback(txMock),
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TenantApplicationsService(
      prismaMock as unknown as PrismaService,
    );
  });

  it('başvuru bulunamazsa 404 hatası verir', async () => {
    txMock.tenantApplication.findUnique.mockResolvedValue(null);

    await expect(service.approve('missing-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(txMock.tenant.create).not.toHaveBeenCalled();
  });

  it('başvuru zaten değerlendirilmişse 409 hatası verir', async () => {
    txMock.tenantApplication.findUnique.mockResolvedValue({
      id: 'application-1',
      status: TenantApplicationStatus.APPROVED,
    });

    await expect(service.approve('application-1')).rejects.toThrow(
      ConflictException,
    );

    expect(txMock.tenant.create).not.toHaveBeenCalled();
  });

  it('PENDING başvuruyu onaylar ve Tenant oluşturur', async () => {
    txMock.tenantApplication.findUnique.mockResolvedValue({
      id: 'application-1',
      companyName: 'Test Rent A Car',
      slug: 'test-rentacar',
      status: TenantApplicationStatus.PENDING,
    });

    txMock.tenant.findUnique.mockResolvedValue(null);
    txMock.tenantApplication.updateMany.mockResolvedValue({ count: 1 });

    txMock.tenant.create.mockResolvedValue({
      id: 'tenant-1',
      name: 'Test Rent A Car',
      slug: 'test-rentacar',
      status: TenantStatus.APPROVED,
    });

    txMock.tenantApplication.update.mockResolvedValue({
      id: 'application-1',
      status: TenantApplicationStatus.APPROVED,
      tenantId: 'tenant-1',
    });

    const result = await service.approve('application-1');

    expect(txMock.tenantApplication.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'application-1',
        status: TenantApplicationStatus.PENDING,
      },
      data: {
        status: TenantApplicationStatus.APPROVED,
        approvedAt: expect.any(Date),
        rejectionReason: null,
      },
    });

    expect(txMock.tenant.create).toHaveBeenCalledWith({
      data: {
        name: 'Test Rent A Car',
        slug: 'test-rentacar',
        status: TenantStatus.APPROVED,
      },
    });

    expect(result.tenantId).toBe('tenant-1');
  });

  it('koşullu güncelleme başarısızsa Tenant oluşturmaz', async () => {
    txMock.tenantApplication.findUnique.mockResolvedValue({
      id: 'application-1',
      companyName: 'Test Rent A Car',
      slug: 'test-rentacar',
      status: TenantApplicationStatus.PENDING,
    });

    txMock.tenant.findUnique.mockResolvedValue(null);
    txMock.tenantApplication.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.approve('application-1')).rejects.toThrow(
      ConflictException,
    );

    expect(txMock.tenant.create).not.toHaveBeenCalled();
  });
});
