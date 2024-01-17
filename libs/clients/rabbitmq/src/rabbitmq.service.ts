import { Injectable } from '@nestjs/common';
import amqp, { ConfirmChannel, Connection, Options } from 'amqplib';

import { AbstractClientService } from '@fdgn/client-core';
import { RabbitMQConfig } from './rabbitmq.config';
import { RabbitMQClient } from './rabbitmq.client';
import { RabbitConsumeOptions } from './models';

@Injectable()
export class RabbitMQService extends AbstractClientService<RabbitMQConfig, Connection> implements RabbitMQClient {
  constructor() {
    super('rabbit', RabbitMQConfig);
  }
  private channels: { [conId: string]: ConfirmChannel } = {};
  private hooks: { [conId: string]: ((conId: string) => Promise<void>)[] } = {};

  createChannelById(channelId: string, conId?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  sendToQueue(queue: string, msgs: string[], opts?: Options.Publish, conId?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  publish(
    exchange: string,
    msgs: { key: string; content: string }[],
    opts?: Options.Publish,
    conId?: string,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  consume(
    queue: string,
    callback: (msg: RabbitConsumeOptions) => Promise<void>,
    options: RabbitConsumeOptions,
    conId: string,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
