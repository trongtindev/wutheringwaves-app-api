import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const errors = (exception.getResponse() as any).message;
    const custom = {
      message: exception.message,
      errors: typeof errors === 'string' ? [errors] : errors
    };

    this.logger.debug(request.body);
    this.logger.debug(custom);

    response.status(exception.getStatus()).json(custom);
  }
}
