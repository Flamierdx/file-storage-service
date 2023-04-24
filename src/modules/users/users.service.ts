import { ForbiddenException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { UserDocument, UserEntity } from './entities/user';
import { ICrudService } from '../../shared/types/crud-service.interface';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService implements ICrudService {
  constructor(@InjectModel(UserEntity.name) private readonly user: Model<UserEntity>) {}

  async create(dto: CreateUserDto) {
    const user = await this.user.create(dto);
    return user.save();
  }

  delete(...args: unknown[]): unknown {
    throw new NotImplementedException();
  }

  findAll(...args: unknown[]): unknown {
    throw new NotImplementedException();
  }

  async findOne(by: FilterQuery<UserEntity>): Promise<UserDocument> {
    const user = await this.user.findOne(by).exec();

    if (!user) {
      throw new NotFoundException('User has not found.');
    }

    return user;
  }

  update(...args: unknown[]): unknown {
    throw new NotImplementedException();
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.findOne({ email });

    if (!(await argon2.verify(user.hash, password))) {
      throw new ForbiddenException('Invalid password.');
    }

    return user;
  }
}
