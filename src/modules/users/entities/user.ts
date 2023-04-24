import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileDocument, FileEntity } from '../../files/entities/file';

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({ timestamps: true })
export class UserEntity {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String })
  hash: string;

  @Prop({ type: String, ref: 'FileEntity' })
  files: FileDocument[];
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
