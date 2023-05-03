import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { FilterQuery, Model } from 'mongoose';

import { ERROR_MESSAGES } from '@modules/users/constants';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { UserDocument, UserEntity } from '@modules/users/entities/user';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserEntity.name) private readonly user: Model<UserEntity>) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const user = await this.user.create(dto);
    return user.save();
  }

  async findOne(by: FilterQuery<UserEntity>): Promise<UserDocument | null> {
    return this.user.findOne(by).exec();
  }

  async findOneOrThrow(by: FilterQuery<UserEntity>): Promise<UserDocument> {
    const user = await this.findOne(by);

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
    }

    return user;
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.findOneOrThrow({ email });

    if (!(await argon2.verify(user.hash, password))) {
      throw new ForbiddenException(ERROR_MESSAGES.INVALID_PASSWORD);
    }

    return user;
  }
}
