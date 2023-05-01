import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserEntity, UserSchema } from '@modules/users/entities/user';
import { UsersController } from '@modules/users/users.controller';
import { UsersService } from '@modules/users/users.service';

@Module({
  imports: [MongooseModule.forFeature([{ schema: UserSchema, name: UserEntity.name }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
