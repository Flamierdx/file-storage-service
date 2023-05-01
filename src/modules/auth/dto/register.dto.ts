import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: 'test' })
  @Length(3, 64)
  @IsString()
  password: string;
}
