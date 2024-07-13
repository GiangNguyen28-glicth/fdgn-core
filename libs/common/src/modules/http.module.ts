import { Global, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { HealthRest, HttpClientService, HttpPromInterceptors } from '../http';
import { CommonModule } from "./common.module";

@Global()
@Module({
  imports: [CommonModule, HttpModule],
  controllers: [HealthRest],
  providers: [...HttpPromInterceptors, HttpClientService],
  exports: [...HttpPromInterceptors, HttpClientService],
})
export class HttpClientModule {}
