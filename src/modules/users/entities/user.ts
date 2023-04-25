import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileDocument } from '../../files/entities/file';
import { Exclude } from 'class-transformer';

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({ timestamps: true })
export class UserEntity {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Exclude()
  @Prop({ type: String })
  hash: string;

  @Prop({ type: String, ref: 'FileEntity' })
  files: FileDocument[];
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.set('toJSON', {
  transform: (_, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    delete obj.hash;
  },
});
