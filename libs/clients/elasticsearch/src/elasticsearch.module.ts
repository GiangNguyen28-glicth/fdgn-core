import { CommonModule } from '@fdgn/common';
import { Global, Module } from '@nestjs/common';
import { ElasticSearchService } from './elasticsearch.service';

@Global()
@Module({
  imports: [CommonModule],
  providers: [ElasticSearchService],
  exports: [],
})
export class ElasticSearchModule {
  // static forRoot(): DynamicModule {}
}
