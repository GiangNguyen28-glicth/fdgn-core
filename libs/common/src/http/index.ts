import { HttpPromInterceptor, HttpDurationSeconds, HttpTotal } from './http-prom.interceptor';

export * from './http-interface';
export * from './http.service';
export * from './http-prom.interceptor';
export * from './health.controller';
export * from './res.controller';
export * from './http-client.service';

export const HttpPromInterceptors = [HttpPromInterceptor, HttpDurationSeconds, HttpTotal];
