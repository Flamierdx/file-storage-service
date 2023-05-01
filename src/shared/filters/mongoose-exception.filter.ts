import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    switch (exception.code) {
      case 10015:
      case 10012:
        this.sendError(res, 404, exception);
        break;
      case 11000:
        this.sendError(res, 409, exception);
        break;
      default:
        this.sendError(res, 500, exception);
    }
  }

  private sendError(res: Response, status: number, err: MongoError, data?: { [key: string]: unknown }) {
    res.status(status).json({
      statusCode: status,
      message: err.message,
      error: err.name,
      ...data,
    });
  }
}
