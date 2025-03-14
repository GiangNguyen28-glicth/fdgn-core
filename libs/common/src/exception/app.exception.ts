import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { get, isNumber, isPlainObject, isString } from 'lodash';

import { HTTP_CODE_FROM_GRPC, UN_KNOW } from '../constants';
import { isExceptionInstanceOf, isGrpcException } from '../utils';

interface HttpExceptionResponse {
  status_code: number;
  message: string;
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
    if (isExceptionInstanceOf<HttpException>(exception, HttpException)) {
      status = exception.getStatus();
      const error_response = exception.getResponse();
      error_message = get(error_response, 'message', null) || get(error_response, 'error', null);
    } else if (isExceptionInstanceOf<AxiosError>(exception, AxiosError)) {
      status = get(exception, 'response.status', status);
      error_message = get(exception, 'response.data.error', UN_KNOW);
    } else if (isGrpcException(exception)) {
      status = HTTP_CODE_FROM_GRPC[exception.code];
      error_message = exception.details;
    } else if (exception instanceof Error && exception.message) {
      error_message = exception.message;
    } else if (isPlainObject(exception)) {
      status = isNumber(exception['status']) ? exception['status'] : status;
      error_message = get(exception, 'message', JSON.stringify(exception));
    } else {
      error_message = isString(exception) ? exception : 'Critical internal server error occurred!';
    }

    const error_response = this.getErrorResponse(status, error_message, request);
    response.status(status).json(error_response);
  }

  private getErrorResponse(status_code: HttpStatus, message: string, request: Request): CustomHttpExceptionResponse {
    return {
      status_code,
      message,
      path: request.url,
      method: request.method,
      body: request.body,
      query: request.query,
      params: request.params,
      time_stamp: new Date(),
    };
  }
}
