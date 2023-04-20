import { MaxFileSizeValidator, ParseFilePipe, UploadedFile } from '@nestjs/common';

export const File = () =>
  UploadedFile(
    'file',
    new ParseFilePipe({
      fileIsRequired: true,
      validators: [new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 })],
    }),
  );
