import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserDocument } from '../../users/entities/user';

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

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const FileSchema = SchemaFactory.createForClass(FileEntity);

FileSchema.set('toJSON', {
  transform: (_, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    delete obj.user;
  },
});
