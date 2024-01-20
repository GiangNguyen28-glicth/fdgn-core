import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { isArray } from 'lodash';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const res: any = exception.getResponse() as object;
    const objRes = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: isArray(res.message) ? res.message[0] : res.message,
      path: request.url,
    };
    if (res.data) {
      objRes['data'] = res.data;
    }
    response.status(status).json(objRes);
  }
}
