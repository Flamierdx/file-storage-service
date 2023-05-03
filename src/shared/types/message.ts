import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export interface IMessage<T = unknown> {
  statusCode: HttpStatus;
  message: string;
  data?: T;
}

export class Message<T = unknown> implements IMessage<T> {
  @ApiProperty()
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: HttpStatus;

  @ApiProperty({ description: 'Any data from the server.', example: { SomeField: 'SomeData' }, required: false })
  data?: T;

  constructor(dto: IMessage<T>) {
    this.message = dto.message;
    this.statusCode = dto.statusCode;
    this.data = dto.data;
  }
}
