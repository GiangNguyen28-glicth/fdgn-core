import { Inject, OnModuleInit, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sleep, toInt } from '@fdgn/common';
import { isNumber } from 'lodash';
import { cargoQueue as Queue, QueueObject } from 'async';

import { Consumeable, MessageConsume, IQueueConsumeConfig, RabbitMessage } from '../models';
import { RabbitMQService } from '../rabbitmq';

export abstract class RabbitConsumer<Input> implements Consumeable<Input>, OnModuleInit {
  private queue: QueueObject<MessageConsume<Input>>;
  private consumersTasks: QueueObject<unknown>;

  @Inject()
  protected configService: ConfigService;

  @Inject(forwardRef(() => RabbitMQService))
  protected rabbitService: RabbitMQService;

  protected constructor(protected context: string, protected config: IQueueConsumeConfig) {
    this.config.numOfConsumer = this.getNumOfConsumer();
  }

  getNumOfConsumer() {
    const numOfConsumer = toInt(this.config.numOfConsumer);
    if(isNumber(numOfConsumer)) {
      return numOfConsumer;
    }
    return 1;
  }

  async onModuleInit() {
    await this.init();
  }

  abstract process(sources: Input | Input[]): Promise<void>;

  async initQueue() {
    this.queue = Queue<MessageConsume<Input>>(async (tasks: MessageConsume<Input>[]) => {
      for (let i = 0; i < tasks.length; i++) {
        await this.taskHandler(tasks[i]);
      }
    }, this.config.numOfConsumer * this.config.prefetchCount);

    this.consumersTasks = Queue<MessageConsume<Input>>(async tasks => {
      for (let i = 0; i < tasks.length; i++) {
        await this.startConsuming();
      }
    }, this.config.numOfConsumer);
  }

  async initConsumers() {
    for (let i = 0; i < this.config.numOfConsumer; i++) {
      this.consumersTasks.push(i);
    }
  }

  transform(msg: RabbitMessage): MessageConsume<Input> {
    try {
      const response = JSON.parse(msg.content.toString());
      return { data: response, msg };
    } catch (error) {
      throw error;
    }
  }

  private consumer: (source: MessageConsume<Input>) => void = null;

  async start(): Promise<void> {
    await this.rabbitService.binding({
      exchange: this.config.exchange,
      exchangeType: this.config.exchangeType ?? 'direct',
      queue: this.config.queue,
      routingKey: this.config.routingKey,
      queueOptions: {
        arguments: {
          'x-queue-type': this.config.queueType ?? 'classic',
          'x-dead-letter-exchange': this.config.deadLetterExchange,
          'x-dead-letter-routing-key': this.config.deadLetterRoutingKey,
        },
      },
    });
    await this.initConsumers();
  }

  async consume(cb: (source: MessageConsume<Input>) => void): Promise<void> {
    this.consumer = cb;
  }

  private async startConsuming() {
    try {
      await this.rabbitService.consume({
        queue: this.config.queue,
        callback: async (msg: RabbitMessage) => {
          const source = this.transform(msg);
          if (source) await this.consumer(source);
          else await this.rabbitService.commit(msg);
        },
        rbOptions: {
          noAck: this.config.noAck ?? false,
          requeue: this.config.requeue ?? false,
          prefetchMessages: this.config.prefetchCount ?? 1,
        } as any,
      });
    } catch (error) {
      console.error(error, 'Could not consume queue: %s', this.config.queue);
    }
  }

  private async processWithRetryDelayTimeout(source: MessageConsume<Input>, delayTimeout = 5000): Promise<void> {
    const attemptToProcess = async (retryTime = 0) => {
      try {
        await this.process(source.data);
        await this.rabbitService.commit(source.msg);
      } catch (e) {
        retryTime++;
        if (retryTime >= this.config.maxRetries) throw e;
        console.error(
          `Processing data into client database has been occurred error: %s and retry after ${delayTimeout}ms`,
          e,
        );
        sleep(delayTimeout);
        return attemptToProcess(retryTime);
      }
    };

    return await attemptToProcess();
  }

  protected async taskHandler(source: MessageConsume<Input>) {
    try {
      await this.processWithRetryDelayTimeout(source, this.config.retryTime);
    } catch (error) {
      console.error(error, 'Pusher failed with request: %j', source);
      await this.rabbitService.reject(source);
      console.info('Pusher has been rejected and pushed to dead letter!');
    }
  }

  protected async add(source: MessageConsume<Input>) {
    this.queue.push(source);
  }

  protected async init() {
    await this.initQueue();
    await this.consume(this.add.bind(this));
    await this.start();
  }
}
