
import { ApiProperty } from '@nestjs/swagger'; 
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LoginDto{

    @ApiProperty({
        example: 'admin@example.com',
        description:'Platform yöneticisin email adresi',
    })
    @IsEmail()
    email:string;

    @ApiProperty({
        example: '************',
        description: 'Platform yöneticisinin şifresi',
    })
    @IsString()
    @IsNotEmpty()
    password:string;
}