import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

import { HttpClientService, HttpPromInterceptors } from '../http';
import { CommonModule } from './common.module';

@Global()
@Module({
  imports: [CommonModule, HttpModule],
  providers: [HttpClientService, ...HttpPromInterceptors],
  exports: [HttpClientService, ...HttpPromInterceptors],
})
export class HttpClientModule {}
