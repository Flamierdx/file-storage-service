import { ArgumentsHost, ExceptionFilter, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error, MongooseError } from 'mongoose';

@Injectable()
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: MongooseError, host: ArgumentsHost): any {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof Error.DocumentNotFoundError) {
      this.sendError(res, 404, exception);
    } else if (exception instanceof Error.ValidationError) {
      this.sendError(res, 400, exception, { errors: exception.errors });
    } else if (exception instanceof MongoServerError) {
      this.sendError(res, 409, exception);
    } else {
      this.sendError(res, 500, exception);
    }
  }

  private sendError(res: Response, status: number, err: MongooseError, data?: { [key: string]: unknown }) {
    res.status(status).json({
      statusCode: status,
      message: err.message,
      error: err.name,
      ...data,
    });
  }
}
