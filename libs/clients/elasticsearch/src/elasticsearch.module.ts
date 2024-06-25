import { ClientCoreModule } from '@fdgn/client-core';
import { Global, Module, DynamicModule } from '@nestjs/common';
import { ElasticSearchService } from './elasticsearch.service';

@Global()
@Module({
  imports: [ClientCoreModule],
  providers: [ElasticSearchService],
  exports: [],
})
export class ElasticSearchModule {
  // static forRoot(): DynamicModule {}
}
