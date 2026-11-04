import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TenantApplicationStatus } from '../../generated/prisma/enums';

//Gelen filtre bilgisini tanımlar
export class ListTenantApplicationsQueryDto {
    @ApiPropertyOptional({
        enum: TenantApplicationStatus,
        description: 'Başvuruları durumlarına göre filtreler.',
    })
    @IsOptional()
    @IsEnum(TenantApplicationStatus)  //sadece pending , approved , rejected durumlarının kabul edilmesini sağlar
    status?: TenantApplicationStatus;
}