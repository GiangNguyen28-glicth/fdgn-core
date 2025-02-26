import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectMetric, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isAxiosError } from '../utils';
import { FAILED, SUCCESS, UN_KNOW } from '../constants';

const HTTP_DURATION_SECONDS_METRIC = 'http_duration_seconds';
const HTTP_TOTAL_METRIC = 'http_total';

export const HttpDurationSeconds = makeHistogramProvider({
  name: HTTP_DURATION_SECONDS_METRIC,
  help: 'HTTP duration by path',
  labelNames: ['path'],
});

export const HttpTotal = makeCounterProvider({
  name: HTTP_TOTAL_METRIC,
  help: 'http call total',
  labelNames: ['path', 'status', 'status_code'],
});

@Injectable()
export class HttpPromInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric(HTTP_DURATION_SECONDS_METRIC)
    private httpDurationSecondsMetric: Histogram<string>,
    @InjectMetric(HTTP_TOTAL_METRIC) private httpTotalMetric: Counter<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const path = `${request.method} ${request.route?.path ?? request.path}`;
    const duration = this.httpDurationSecondsMetric.startTimer({ path });
    return next.handle().pipe(
      tap(() => {
        duration();
        this.httpTotalMetric.inc({
          path,
          status: SUCCESS,
          status_code: context.switchToHttp().getResponse().statusCode || UN_KNOW,
        });
      }),
      catchError(err => {
        duration();

        const status = isAxiosError(err) ? err?.response?.status : HttpStatus.INTERNAL_SERVER_ERROR;

        this.httpTotalMetric.inc({
          path,
          status: FAILED,
          status_code: status || UN_KNOW,
        });

        return throwError(err);
      }),
    );
  }
}
