import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FileDocument } from '../../files/entities/file';
import { Exclude } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ApiSchema } from '../../../shared/utils/api-schema';

export type UserDocument = HydratedDocument<UserEntity>;

@Schema({ timestamps: true })
export class UserEntity {
  @ApiProperty({ example: 'test@test.com' })
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @ApiHideProperty()
  @Exclude()
  @Prop({ type: String })
  hash: string;

  @ApiHideProperty()
  @Prop({ type: String, ref: 'FileEntity' })
  files: FileDocument[];
}

@ApiSchema({ name: 'User' })
export class SwaggerUserEntity extends UserEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;
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
