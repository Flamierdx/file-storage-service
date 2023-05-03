import * as crypto from 'crypto';
import * as path from 'path';

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3,
  UploadPartCommand,
  UploadPartCommandOutput,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { FileEntity } from '@modules/files/entities/file';
import { ERROR_MESSAGES } from '@modules/storage/constants';

import { IStorageService } from '.';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly s3: S3;
  private readonly BUCKET_NAME: string;
  private readonly UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024;
  private readonly DOWNLOAD_CHUNK_SIZE = 1024 * 1024;

  constructor(config: ConfigService) {
    this.BUCKET_NAME = config.getOrThrow('AWS_S3_BUCKET_NAME');
    this.s3 = new S3({});
  }

  async upload(userId: string, filename: string, file: Express.Multer.File): Promise<string> {
    const key = this.generateKey(userId, path.extname(filename));

    if (file.size < this.UPLOAD_CHUNK_SIZE) {
      await this.uploadSingle(key, file);
    } else {
      await this.uploadWithMultipart(key, file);
    }

    return key;
  }

  async download(file: FileEntity, res: Response): Promise<void> {
    try {
      if (file.size <= this.DOWNLOAD_CHUNK_SIZE) {
        await this.downloadSingle(file, res);
      } else {
        await this.downloadByChunks(file, res);
      }
    } catch (e) {
      res
        .status(400)
        .send({ statusCode: 400, message: ERROR_MESSAGES.DOWNLOAD_INTERRUPTED, error: BadRequestException.name });
    }
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.BUCKET_NAME, Key: key }));
  }

  private generateKey(userId: string, ext: string): string {
    return `${userId}/${crypto.randomBytes(16).toString('hex')}${ext}`;
  }

  private async downloadSingle(file: FileEntity, res: Response) {
    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: file.storageKey,
    });
    const output = await this.s3.send(command);

    this.setDownloadFileHeaders(file, res);

    res.write(await output.Body?.transformToByteArray());
    res.end();
  }

  private async downloadByChunks(file: FileEntity, res: Response) {
    this.setDownloadFileHeaders(file, res);
    let rangeAndLength = { start: -1, end: -1, length: -1 };

    while (!this.isDownloadComplete(rangeAndLength)) {
      const { end } = rangeAndLength;
      const nextRange = { start: end + 1, end: end + this.DOWNLOAD_CHUNK_SIZE };

      const { ContentRange, Body } = await this.getObjectRange(file.storageKey, nextRange.start, nextRange.end);

      res.write(await Body?.transformToByteArray());
      rangeAndLength = this.parseRangeAngLength(ContentRange as string);
    }

    res.end();
  }

  private isDownloadComplete({ end, length }: { end: number; length: number }) {
    return end === length - 1;
  }

  private getObjectRange(key: string, start: number, end: number) {
    return this.s3.send(new GetObjectCommand({ Bucket: this.BUCKET_NAME, Key: key, Range: `bytes=${start}-${end}` }));
  }

  private parseRangeAngLength(contentRange: string) {
    const [range, length] = contentRange.split('/');
    const [start, end] = range.split('-');
    return {
      start: parseInt(start),
      end: parseInt(end),
      length: parseInt(length),
    };
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

      throw new BadRequestException(ERROR_MESSAGES.UPLOADING);
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
    const chunkCount = Math.ceil(file.size / this.UPLOAD_CHUNK_SIZE);

    for (let chunkNumber = 0; chunkNumber < chunkCount; chunkNumber++) {
      const start = chunkNumber * this.UPLOAD_CHUNK_SIZE;
      const end = start + this.UPLOAD_CHUNK_SIZE;
      const command = new UploadPartCommand({
        Bucket: this.BUCKET_NAME,
        UploadId: uploadId,
        Key: key,
        Body: file.buffer.subarray(start, end),
        PartNumber: chunkNumber + 1,
      });

      chunks.push(this.s3.send(command));
    }

    return Promise.all(chunks);
  }

  private setDownloadFileHeaders(file: FileEntity, res: Response) {
    const encodedFilename = encodeURI(`${file.name}.${file.extension}`);

    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);
  }
}
