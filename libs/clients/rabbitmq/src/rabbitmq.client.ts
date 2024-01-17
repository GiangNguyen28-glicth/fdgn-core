import { Connection } from 'amqplib';
import { Client } from '@fdgn/client-core';

import { RabbitMQConfig } from './rabbitmq.config';
import { RabbitConsumeOptions, RabbitMessage, RabbitPublishOptions } from './models';

export interface RabbitMQClient extends Client<RabbitMQConfig, Connection> {
  createChannelById(channelId: string, conId?: string): Promise<void>;

  sendToQueue(queue: string, msgs: string[], opts?: RabbitPublishOptions, conId?: string): Promise<void>;

  publish(
    exchange: string,
    msgs: { key: string; content: string }[],
    opts?: RabbitPublishOptions,
    conId?: string,
  ): Promise<void>;

  consume(
    queue: string,
    callback: (msg: RabbitMessage) => Promise<void>,
    options: RabbitConsumeOptions,
    conId: string,
  ): Promise<void>;
}
