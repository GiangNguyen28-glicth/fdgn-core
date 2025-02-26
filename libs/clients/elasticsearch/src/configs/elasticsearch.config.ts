import { ClientOptions } from '@elastic/elasticsearch';
import { ClientConfig } from '@fdgn/common';

export class ElasticSearchConfig extends ClientConfig {
  options: ClientOptions;

  constructor(props: ElasticSearchConfig) {
    super(props);
    this.options = props?.options;
  }
}
