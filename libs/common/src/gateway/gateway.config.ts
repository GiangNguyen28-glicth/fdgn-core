import { InternalServerErrorException } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { IsNotEmpty } from 'class-validator';
import { get } from 'lodash';

import { isNullOrEmpty, toInt, validateConfigSync } from '../utils';
export class GatewayConfig {
  @IsNotEmpty()
  transport: Transport;

  options: {};

  constructor(props: GatewayConfig) {
    this.transport = toInt(props?.transport);
    this.options = props?.options;
    validateConfigSync(this);
  }

  validateConfig() {
    if (!Object.values(Transport).some(e => e === this.transport)) {
      throw new InternalServerErrorException(`This transport ${this.transport} is not allowed`);
    }
    const url = get(this.options, 'url', null);
    if (this.transport === Transport.GRPC && isNullOrEmpty(url)) {
      throw new InternalServerErrorException('Url is not found');
    }
  }
}
