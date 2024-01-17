import { Options } from 'amqp-connection-manager';
import { ExchangeRb } from './rabbitmq.assert';

export interface IQueueBinding {
  queue: string;
  exchange: string;
  routingKey: string;
  exchangeOptions?: Options.AssertExchange;
  queueOptions?: Options.AssertQueue;
}

export interface IExchangeRb {
  exchange: string;
  type: ExchangeRb;
  options?: Options.AssertExchange;
}

export interface IQueue {
  queue: string;
  options?: Options.AssertQueue;
}

export interface IRabbitConsumer {
  startConsuming();
}
