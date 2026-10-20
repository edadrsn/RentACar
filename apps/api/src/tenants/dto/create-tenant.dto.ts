import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty , ApiPropertyOptional } from '@nestjs/swagger'; 

//ApiProperty: Zorunlu alanları Swagger'da belgeler.
//ApiPropertyOptional: İsteğe bağlı alanı Swagger'da belgeler.

export class CreateTenantDto {
    @ApiProperty({
      description: 'Şirketin ticari adı',
      example: 'ABC Rent A Car',
      maxLength: 150,
    })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  companyName: string;


@ApiProperty({
  description: 'Şirketi url içinde tanımlamak için kullanılan kısa ad',
  example : 'abc-rent-a-car',
  maxLength:100,
})
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;


  @ApiProperty({
    description: 'Şirketin iletişim kurulacak yetkilisinin adı',
    example : 'Ahmet Yılmaz',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contactName: string;

  @ApiProperty({
    description: 'Şirketin iletişim kurulacak yetkilisinin e-mail adresi',
    example: 'ahmet@example.com',
    maxLength:254,
    })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiPropertyOptional({
    description: 'Şirketin telefon numarası',
    example: '05551234567',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}