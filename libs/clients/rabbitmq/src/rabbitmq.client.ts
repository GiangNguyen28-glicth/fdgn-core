import { Client } from '@fdgn/client-core';
import { Connection } from 'amqplib';

import { IConsume, IPublish, ISendToQueue, RabbitMessage } from './models';
import { RabbitMQConfig } from './rabbitmq.config';

export interface RabbitMQClient extends Client<RabbitMQConfig, Connection> {
  createChannelById(channelId: string, conId?: string): Promise<void>;

  sendToQueue(options: ISendToQueue): Promise<void>;

  publish(options: IPublish): Promise<void>;

  consume(options: IConsume): Promise<void>;

  commit(msg: RabbitMessage, conId?: string): Promise<void>;
  reject(msg: RabbitMessage, requeue?: boolean, conId?: string): Promise<void>;
}
