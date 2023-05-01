import { Module } from '@nestjs/common';

import { S3_STORAGE_SERVICE } from './constants';
import { S3StorageService } from './services';

@Module({
  providers: [
    {
      provide: S3_STORAGE_SERVICE,
      useClass: S3StorageService,
    },
  ],
  exports: [S3_STORAGE_SERVICE],
})
export class StorageModule {}
