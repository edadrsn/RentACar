
import { ApiProperty } from '@nestjs/swagger'; 
import { IsNotEmpty, IsString, Matches ,MaxLength } from 'class-validator';


//ApiProperty: Zorunlu alanları Swagger'da belgeler.
//ApiPropertyOptional: İsteğe bağlı alanı Swagger'da belgeler.

export class CreateTenantDto {
    @ApiProperty({
      description: 'Şirketin adı',
      example: 'ABC Rent A Car',
    })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;


@ApiProperty({
  description: 'Şirketin benzersiz URL adı',
  example : 'abc-rentacar',
})
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
  message: 'slug yalnızca küçük harf, rakam ve aralarda tire içerebilir.',
})
  slug: string;


}