import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FileDocument = HydratedDocument<FileModel>;

@Schema({ timestamps: true })
export class FileModel {
  @Prop({ type: String, unique: true, required: true })
  name: string;

  @Prop({ type: String, unique: true, required: true })
  storageKey: string;

  @Prop({ type: Number })
  size: number;

  @Prop({ type: String })
  mimetype: string;

  @Prop({ type: String })
  extension: string;
}

export const FileSchema = SchemaFactory.createForClass(FileModel);
