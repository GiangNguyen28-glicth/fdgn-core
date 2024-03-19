import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { IQueueProducerConfig, Produceable, ProducerMode } from '../models';
import { RabbitMQService } from '../rabbitmq';
import { RabbitMQMetrics } from './rabbitmq-metrics';

@Injectable()
export class RabbitMQProducer<Output> implements Produceable<Output> {
  private config: IQueueProducerConfig;

  constructor(
    @Inject(forwardRef(() => RabbitMQService))
    private rabbitService: RabbitMQService,

    private rabbitMetric: RabbitMQMetrics,
  ) {}

  setConfig(config: IQueueProducerConfig) {
    this.config = config;
    this.validateConfig();
  }

  validateConfig() {
    switch (this.config.mode) {
      case ProducerMode.Exchange:
        if (!this.config.exchange || !this.config.routingKey) {
          throw new Error(`Missing routing key, exchange RabbitMQ config`);
        }
        break;
      case ProducerMode.Queue:
        if (!this.config.queue) {
          throw new Error(`Missing queue RabbitMQ config`);
        }
        break;
    }
  }

  async start(): Promise<void> {
    if (!this.config) {
      throw new Error('Missing config RabbitMQ');
    }
  }

  transform(source: Output): string {
    return JSON.stringify(source);
  }

  async publish(sources: Output[]): Promise<void> {
    if (this.config.mode === ProducerMode.Exchange) {
      await this.rabbitService.publish({
        exchange: this.config.exchange,
        msgs: sources.map(source => {
          return {
            key: this.config.routingKey,
            content: this.transform(source),
          };
        }),
      });
    } else {
      await this.rabbitService.sendToQueue({
        queue: this.config.queue,
        msgs: sources.map(source => this.transform(source)),
      });
    }
    this.rabbitMetric.success('Hehe', 1);
  }
}
