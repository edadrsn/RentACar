
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectTenantApplicationDto {
  @ApiProperty({
    example: 'Şirketin iletişim bilgileri doğrulanamadı.',
    description: 'Şirket başvurusunun reddedilme gerekçesi',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  rejectionReason: string;
  
}
