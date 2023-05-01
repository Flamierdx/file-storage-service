import { IsInt, IsMimeType, IsString } from 'class-validator';

export class CreateFileDto {
  @IsString()
  filename: string;

  @IsString()
  extension: string;

  @IsString()
  storageKey: string;

  @IsMimeType()
  @IsString()
  mimetype: string;

  @IsInt()
  size: number;
}
