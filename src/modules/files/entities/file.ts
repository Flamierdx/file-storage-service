import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserDocument, UserEntity } from '../../users/entities/user';

export type FileDocument = HydratedDocument<FileEntity>;

@Schema({ timestamps: true })
export class FileEntity {
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

  @Prop({ type: Types.ObjectId, ref: 'UserEntity' })
  user: UserDocument;
}

export const FileSchema = SchemaFactory.createForClass(FileEntity);
