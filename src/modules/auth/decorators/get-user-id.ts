import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetUserId = createParamDecorator((data: never, input: ExecutionContext) => {
  return (input.switchToHttp().getRequest<Request>().user as any).id;
});
