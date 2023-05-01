import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const user = this.config.get<string>('MONGO_USER');
    const password = this.config.get<string>('MONGO_PASSWORD');
    const host = this.config.get<string>('MONGO_HOST');
    const port = this.config.get<number>('MONGO_PORT');
    const databaseName = this.config.get<string>('MONGO_DB');

    return {
      uri: `mongodb://${user}:${password}@${host}:${port}/${databaseName}`,
      autoIndex: true,
      auth: { password, username: user },
    };
  }
}
