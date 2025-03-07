import { Transport } from '@nestjs/microservices';
import { isNullOrEmpty, toInt } from '../utils';
import { get } from 'lodash';

export class GatewayConfig {
  transport: Transport;
  options: {};

  constructor(props: GatewayConfig) {
    this.transport = toInt(props.transport);
    this.options = props.options;
    this.validateConfig();
  }

  validateConfig() {
    if (this.transport === Transport.GRPC) {
      const url = get(this.options, 'url', null);
      if (isNullOrEmpty(url)) {
        throw new Error('Url is not found');
      }
    }
  }
}
