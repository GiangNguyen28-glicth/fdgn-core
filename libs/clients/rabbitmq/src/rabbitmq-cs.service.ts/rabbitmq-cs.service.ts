import { Injectable } from '@fdgn/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

import { RabbitMQCsConfig } from './rabbitmq-cs.config';
const CONFIG_KEY = 'rabbit';

@Injectable()
export class RabbitService {
  constructor(private readonly configService: ConfigService) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    const rmqConfig = new RabbitMQCsConfig(this.configService, CONFIG_KEY);
    return null;
    // const url = `amqp://${username}:${password}@${host}:${port}`;
    // return {
    //   transport: Transport.RMQ,
    //   options: {
    //     urls: [url],
    //     queue: this.configService.get<string>(`RABBIT_MQ_${queue}_QUEUE`),
    //     noAck,
    //     persistent: true,
    //     // prefetchCount: 5,
    //   },
    // };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
