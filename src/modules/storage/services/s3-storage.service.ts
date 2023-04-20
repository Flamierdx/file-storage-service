import { IStorageService } from '.';
import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3,
  UploadPartCommand,
  UploadPartCommandOutput,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly s3: S3;
  private readonly BUCKET_NAME: string;
  private readonly CHUNK_SIZE = 5 * 1024 * 1024;

  constructor(config: ConfigService) {
    this.BUCKET_NAME = config.getOrThrow('AWS_S3_BUCKET_NAME');
    this.s3 = new S3({});
  }

  async upload(filename: string, file: Express.Multer.File): Promise<string> {
    const key = this.generateKey(path.extname(filename));

    if (file.size < this.CHUNK_SIZE) {
      await this.uploadSingle(key, file);
    } else {
      await this.uploadWithMultipart(key, file);
    }

    return key;
  }

  download(filename: string): Buffer {
    throw new NotImplementedException();
  }

  rename(oldFilename: string, newFilename: string): void {
    throw new NotImplementedException();
  }

  delete(filename: string): void {
    throw new NotImplementedException();
  }

  private generateKey(ext: string): string {
    return `${crypto.randomBytes(16).toString('hex')}${ext}`;
  }

  private async uploadSingle(key: string, file: Express.Multer.File) {
    return this.s3.send(new PutObjectCommand({ Bucket: this.BUCKET_NAME, Key: key, Body: file.buffer }));
  }

  private async uploadWithMultipart(key: string, file: Express.Multer.File) {
    let uploadId = '';

    try {
      uploadId = (await this.createMultipartUpload(key)) as string;

      const uploadedParts = await this.uploadChunks(key, uploadId, file);

      await this.completeMultipartUpload(key, uploadId, uploadedParts);
    } catch (err) {
      if (uploadId) {
        await this.s3.send(new AbortMultipartUploadCommand({ Bucket: this.BUCKET_NAME, Key: key, UploadId: uploadId }));
      }
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.BUCKET_NAME, Key: key }));

      throw new BadRequestException('Error with uploading file.');
    }
  }

  private async createMultipartUpload(key: string) {
    return (await this.s3.send(new CreateMultipartUploadCommand({ Bucket: this.BUCKET_NAME, Key: key }))).UploadId;
  }

  private async completeMultipartUpload(key: string, uploadId: string, parts: UploadPartCommandOutput[]) {
    return await this.s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts.map(({ ETag }, i) => ({ ETag, PartNumber: i + 1 })) },
      }),
    );
  }

  private async uploadChunks(key: string, uploadId: string, file: Express.Multer.File) {
    const chunks = [];
    const chunkCount = Math.ceil(file.size / this.CHUNK_SIZE);

    for (let chunkNumber = 0; chunkNumber < chunkCount; chunkNumber++) {
      const start = chunkNumber * this.CHUNK_SIZE;
      const end = start + this.CHUNK_SIZE;

      chunks.push(
        this.s3
          .send(
            new UploadPartCommand({
              Bucket: this.BUCKET_NAME,
              UploadId: uploadId,
              Key: key,
              Body: file.buffer.subarray(start, end),
              PartNumber: chunkNumber + 1,
            }),
          )
          .then(d => {
            console.log(`[UPLOAD]: file: ${key}, part ${chunkNumber + 1} uploaded successfully.`);
            return d;
          }),
      );
    }

    return Promise.all(chunks);
  }
}
