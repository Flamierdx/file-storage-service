import { ApiBody, ApiOkResponse, ApiProduces } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export const ApiFile = (filename: string) =>
  applyDecorators(
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [filename]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );

export const ApiFileResponse = (...mimeTypes: string[]) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'string',
        format: 'binary',
      },
    }),
    ApiProduces(...mimeTypes),
  );
};
