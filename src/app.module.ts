import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from '@modules/auth';
import { FilesModule } from '@modules/files';
import { UsersModule } from '@modules/users';
import { MongooseConfigService } from '@shared/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useClass: MongooseConfigService,
    }),
    ThrottlerModule.forRoot({ limit: 5, ttl: 60 }),
    ScheduleModule.forRoot(),
    FilesModule,
    AuthModule,
    UsersModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
