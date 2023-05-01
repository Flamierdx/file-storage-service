import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

import { FileEntity } from '@modules/files/entities/file';

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
