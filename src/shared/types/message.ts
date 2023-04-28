import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export interface IMessage {
  statusCode: HttpStatus;
  message: string;
}

export interface IMessageWithData<T> extends IMessage {
  data: T;
}

export class Message implements IMessage {
  @ApiProperty()
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: HttpStatus;

  constructor(dto: IMessage) {
    this.message = dto.message;
    this.statusCode = dto.statusCode;
  }
}

export class MessageWithData<T> extends Message implements IMessageWithData<T> {
  @ApiProperty()
  data: T;

  constructor(dto: IMessageWithData<T>) {
    super(dto);
    this.data = dto.data;
  }
}
