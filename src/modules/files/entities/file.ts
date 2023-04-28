import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserDocument } from '../../users/entities/user';
import { ApiSchema } from '../../../shared/decorators/api-schema';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type FileDocument = HydratedDocument<FileEntity>;

@Schema({ timestamps: true })
export class FileEntity {
  @ApiProperty()
  @Prop({ type: String, unique: true, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: String, unique: true, required: true })
  storageKey: string;

  @ApiProperty()
  @Prop({ type: Number })
  size: number;

  @ApiProperty()
  @Prop({ type: String })
  mimetype: string;

  @ApiProperty()
  @Prop({ type: String })
  extension: string;

  @ApiHideProperty()
  @Prop({ type: Types.ObjectId, ref: 'UserEntity' })
  user: UserDocument;

  @ApiPropertyOptional()
  @Prop({ type: Date })
  deletedAt?: Date;
}

@ApiSchema({ name: 'File' })
export class SwaggerFileEntity extends FileEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;
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
