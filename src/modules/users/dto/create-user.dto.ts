import { FileEntity } from '../../files/entities/file';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  hash: string;

  @IsArray()
  @IsOptional()
  files?: FileEntity[];
}
