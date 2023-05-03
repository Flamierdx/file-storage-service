import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setSwaggerDocument = (app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('File Storage Service')
    .setDescription('Service for uploading and downloading files.')
    .setVersion('1.0.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, { useGlobalPrefix: true });
};
