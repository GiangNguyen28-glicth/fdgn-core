import { Options } from 'amqp-connection-manager';
import { RabbitConsumeOptions } from './rabbit-consume.options';
import { RabbitMessage } from './rabbit-message';
import { RabbitPublishOptions } from './rabbit-publish.options';
import { ExchangeType } from './rabbitmq.assert';

export type QueueType = 'classic' | 'quorum';

export interface IQueueBinding {
  queue: string;
  exchange: string;
  exchangeType?: ExchangeType;
  routingKey: string;
  exchangeOptions?: Options.AssertExchange;
  queueOptions?: Options.AssertQueue;
}

export interface IExchange {
  exchange: string;
  type: ExchangeType;
  options?: Options.AssertExchange;
}

export interface IQueue {
  queue: string;
  exchange?: string;
  exchangeType?: ExchangeType;
  routingKey?: string;
  prefetchCount?: number;
  queueType?: QueueType;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  options?: Options.AssertQueue;
}

export interface IConsume {
  queue: string;
  callback: (msg: RabbitMessage) => Promise<void>;
  rbOptions?: RabbitConsumeOptions;
  conId?: string;
}

export interface IConnectOption {
  queue: string;
  prefetchCount?: number;
  persistent?: boolean;
  noAck?: boolean;
}

export interface IQueueConsumeConfig extends IQueue {
  prefix?: string;
  ignorePrefix?: boolean;
  unbindingQueueOptions?: boolean;
  noAck?: boolean;
  requeue?: boolean;
  maxRetries: number;
  retryTime: number;
  numOfConsumer?: number;
}

export interface IQueueProducerConfig {
  mode: ProducerMode;
  queue?: string;
  exchange?: string;
  routingKey?: string;
}

export interface MessageConsume<Input> {
  data: Input | Input[];
  msg: RabbitMessage;
}

export interface Consumeable<Input> {
  start(): Promise<void>;

  consume(cb: (source: MessageConsume<Input>) => void): Promise<void>;
}

export interface Produceable<Output> {
  start(): Promise<void>;

  publish(sources: Output[]): Promise<void>;
}

export interface IPublish {
  exchange: string;
  msgs: { key: string; content: string }[];
  opts?: Options.Publish;
  conId?: string;
}

export interface ISendToQueue {
  queue: string;
  msgs: string[];
  opts?: RabbitPublishOptions;
  conId?: string;
}

export enum ProducerMode {
  Queue = 'queue',
  Exchange = 'exchange',
}
