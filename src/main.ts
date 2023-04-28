import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as session from 'express-session';
import { COOKIE_AGE } from './shared/constants';
import * as process from 'process';
import { ValidationPipe } from '@nestjs/common';
import { setSwaggerDocument } from './shared/config/swagger';

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

  setSwaggerDocument(app);

  await app.listen(process.env.PORT || 3000);
}

(async () => {
  await bootstrap();
})();
