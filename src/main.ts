import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import * as passport from 'passport';

import { setSwaggerDocument } from '@shared/config';
import { COOKIE_AGE } from '@shared/constants';
import { MongooseExceptionFilter } from '@shared/filters/mongoose-exception.filter';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, sameSite: 'lax', maxAge: COOKIE_AGE },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new MongooseExceptionFilter());

  setSwaggerDocument(app);

  await app.listen(process.env.PORT || 3000);
}

(async () => {
  await bootstrap();
})();
