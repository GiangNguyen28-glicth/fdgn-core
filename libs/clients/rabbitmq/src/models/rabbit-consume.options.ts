import { Options } from 'amqplib';

export interface RabbitConsumeOptions extends Options.Consume {
  consumerTag?: string;
  autoCommit?: boolean;
  prefetchMessages?: number;
  requeue?: boolean;
}

export interface ICheckQueue {
  consumerCount: number;
  messageCount: number;
  queue: string;
}
