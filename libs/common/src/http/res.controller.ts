import { UseInterceptors, Controller } from '@nestjs/common';
import { HttpPromInterceptor } from './http-prom.interceptor';

export const RestController = (prefix: string, opts?: { metric: boolean }) => {
  return clazz => {
    const metric = opts?.metric ?? true;
    if (metric) clazz = UseInterceptors(HttpPromInterceptor)(clazz);
    Controller(prefix)(clazz);
  };
};
