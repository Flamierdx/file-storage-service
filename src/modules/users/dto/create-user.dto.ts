import { FileEntity } from '../../files/entities/file';

export class CreateUserDto {
  email: string;

  hash: string;

  files?: FileEntity[];
}
