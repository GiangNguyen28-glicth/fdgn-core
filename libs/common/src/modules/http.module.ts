import { Global, Module } from '@nestjs/common';
import { HealthRest, HttpPromInterceptors } from '../http';

@Global()
@Module({
  controllers: [HealthRest],
  providers: [...HttpPromInterceptors],
  exports: [...HttpPromInterceptors],
})
export class HttpModule {}
