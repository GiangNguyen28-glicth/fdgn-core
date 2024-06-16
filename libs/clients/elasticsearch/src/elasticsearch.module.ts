import { ClientCoreModule } from '@fdgn/client-core';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [ClientCoreModule],
  providers: [],
  exports: [],
})
export class ElasticSearchModule {}
