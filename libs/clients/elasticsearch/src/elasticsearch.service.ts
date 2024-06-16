import { Injectable } from '@nestjs/common';
import { AbstractClientService } from '@fdgn/client-core';
import { ElasticSearchConfig } from './elasticsearch.config';

@Injectable()
export class ElasticSearchService extends AbstractClientService<ElasticSearchConfig, any> {
  protected init(config: ElasticSearchConfig): Promise<any> {
    throw new Error('Method not implemented.');
  }
  protected stop(client: any, conId?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  protected start(client: any, conId?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
