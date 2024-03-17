import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

import { RabbitMQClientConfig } from './rabbitmq-client.config';
import { IConnectOption } from '../models';
const CONFIG_KEY = 'rabbit';

@Injectable()
export class RabbitMQClientService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(options: IConnectOption): RmqOptions {
    const rmqConfig = new RabbitMQClientConfig(this.configService, CONFIG_KEY);
    const url = rmqConfig.getUrl();
    return {
      transport: Transport.RMQ,
      options: {
        urls: [url],
        ...options,
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
