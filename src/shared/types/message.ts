import { HttpStatus } from '@nestjs/common';

export interface Message {
  statusCode: HttpStatus;
  message: string;
}

export interface MessageWithData<T> extends Message {
  data: T;
}
