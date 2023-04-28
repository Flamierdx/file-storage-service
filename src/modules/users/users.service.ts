import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { UserDocument, UserEntity } from './entities/user';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';

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
      throw new NotFoundException('User has not found.');
    }

    return user;
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.findOneOrThrow({ email });

    if (!(await argon2.verify(user.hash, password))) {
      throw new ForbiddenException('Invalid password.');
    }

    return user;
  }
}
