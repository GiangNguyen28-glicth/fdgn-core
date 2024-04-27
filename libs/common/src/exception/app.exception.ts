import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { isPlainObject } from 'lodash';
import { Response, Request } from 'express';

interface HttpExceptionResponse {
  status_code: number;
  error: string;
}

interface CustomHttpExceptionResponse extends HttpExceptionResponse {
  path: string;
  method: string;
  body: object;
  params: object;
  query: object;
  time_stamp: Date;
}
@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let error_message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const error_response = exception.getResponse();
      error_message = (error_response as HttpExceptionResponse).error || exception.message;
    } else if (exception instanceof Error && exception.message) {
      error_message = exception.message;
    } else if (isPlainObject(exception)) {
      error_message = JSON.stringify(exception);
    } else {
      error_message = 'Critical internal server error occurred!';
    }

    const error_response = this.getErrorResponse(status, error_message, request);
    response.status(status).json(error_response);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string,
    request: Request,
  ): CustomHttpExceptionResponse => ({
    status_code: status,
    error: errorMessage,
    path: request.url,
    method: request.method,
    body: request.body,
    query: request.query,
    params: request.params,
    time_stamp: new Date(),
  });
}
