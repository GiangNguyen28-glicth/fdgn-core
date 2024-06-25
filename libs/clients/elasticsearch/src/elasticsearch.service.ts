import { Injectable } from '@nestjs/common';
import { Client as EsClient, TransportRequestOptions } from '@elastic/elasticsearch';
import { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';
import { AbstractClientService, DEFAULT_CON_ID } from '@fdgn/client-core';

import { ElasticSearchConfig } from './configs';

@Injectable()
export class ElasticSearchService extends AbstractClientService<ElasticSearchConfig, EsClient> {
  constructor() {
    super('es', ElasticSearchConfig);
  }
  protected async init(config: ElasticSearchConfig): Promise<EsClient> {
    return new EsClient(config.options);
  }
  protected async stop(client: any, conId?: string): Promise<void> {
    console.log('Stop ElasticSearch');
  }
  protected async start(client: any, conId?: string): Promise<void> {
    console.log('Start ElasticSearch');
  }

  async createMapping(params: IndicesCreateRequest, options: TransportRequestOptions, conId = DEFAULT_CON_ID) {
    try {
      return await this.getClient(conId).indices.create(params, options);
    } catch (error) {
      throw error;
    }
  }
}
