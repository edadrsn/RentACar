
import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

export class CreateTenantApplicationDto {


    @ApiProperty({ example: 'ABC Rent A Car' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    companyName: string;


    @ApiProperty({ example: 'abc-rentacar' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
  message: 'slug yalnızca küçük harf, rakam ve aralarda tire içerebilir.',
})
    slug: string;

    
  
    @ApiProperty({  example: 'Ahmet Yılmaz' })
    @IsString()
    @IsNotEmpty()
    contactName: string;

    
    @ApiProperty({ example: 'ahmet@example.com'  })
    @IsEmail()
    @MaxLength(254)
    contactEmail: string;


    @ApiProperty({ example: '+905551234567' })
    @IsString()
    @Matches(/^\+[1-9]\d{7,14}$/)
    contactPhone: string;
    
}