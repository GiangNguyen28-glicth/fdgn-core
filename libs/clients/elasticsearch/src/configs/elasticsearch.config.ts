import { ClientOptions } from '@elastic/elasticsearch';
import { ClientConfig } from '@fdgn/client-core';

export class ElasticSearchConfig extends ClientConfig {
  options: ClientOptions;

  constructor(props: ElasticSearchConfig) {
    super(props);
    this.options = props?.options;
  }
}
