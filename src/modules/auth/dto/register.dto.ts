import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: 'pass' })
  @Length(3, 64)
  @IsString()
  password: string;
}
