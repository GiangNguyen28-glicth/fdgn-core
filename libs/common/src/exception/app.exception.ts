import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { get, isPlainObject } from 'lodash';
import { UN_KNOW } from '../consts';
import { isAxiosError, isHttpException } from '../utils';
import { throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
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
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let error_message: string;

    if (isHttpException(exception)) {
      status = exception.getStatus();
      const error_response = exception.getResponse();
      error_message = get(error_response, 'error', null) || exception.message;
    } else if (isAxiosError(exception)) {
      status = exception.response.status;
      error_message = get(exception, 'response.data.error', UN_KNOW);
    } else if (exception instanceof Error && exception.message) {
      error_message = exception.message;
    } else if (isPlainObject(exception)) {
      error_message = JSON.stringify(exception);
    } else {
      error_message = 'Critical internal server error occurred!';
    }

    const error_response = this.getErrorResponse(status, error_message, request);
    this.httpAdapterHost.httpAdapter.reply(ctx.getResponse(), error_response, 400);

    // response.status(status).json(error_response);
  }

  private getErrorResponse(status: HttpStatus, error_message: string, request: Request): CustomHttpExceptionResponse {
    return {
      status_code: status,
      error: error_message,
      path: request.url,
      method: request.method,
      body: request.body,
      query: request.query,
      params: request.params,
      time_stamp: new Date(),
    };
  }
}
