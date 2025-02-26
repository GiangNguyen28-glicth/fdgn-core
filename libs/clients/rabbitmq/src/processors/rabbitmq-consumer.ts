import { Inject, OnModuleInit, forwardRef, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNumber } from 'lodash';
import { cargoQueue as Queue, QueueObject } from 'async';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';


import { sleep, toInt, DEFAULT_CONSUMER, DEFAULT_CONCURRENT, DEFAULT_BATCH_SIZE, DEFAULT_CON_ID } from '@fdgn/common';

import { Consumeable, MessageConsume, IQueueConsumeConfig, RabbitMessage } from '../models';
import { RabbitMQService } from '../rabbitmq';

export abstract class RabbitConsumer<Input> implements Consumeable<Input>, OnModuleInit {
  private queue: QueueObject<MessageConsume<Input>>;
  private consumersTasks: QueueObject<unknown>;
  private timeoutId: NodeJS.Timeout;

  @Inject()
  protected configService: ConfigService;

  @Inject(WINSTON_MODULE_NEST_PROVIDER) protected readonly logger: Logger;

  @Inject(forwardRef(() => RabbitMQService))
  private rabbitService: RabbitMQService;

  protected constructor(protected context: string, protected config: IQueueConsumeConfig) {
    this.config.numOfConsumer = this.getNumOfConsumer();
  }

  protected get rmqService(): RabbitMQService {
    return this.rabbitService;
  }

  initConfig() {
    this.config.concurrent = this.config.useConcurrent ? this.config.concurrent : DEFAULT_CONCURRENT;
    this.config.batchSize = this.config.useBatchSize ? this.config.batchSize : DEFAULT_BATCH_SIZE;
  }

  getNumOfConsumer() {
    const numOfConsumer = toInt(this.config.numOfConsumer);
    if (isNumber(numOfConsumer)) {
      return numOfConsumer;
    }
    return DEFAULT_CONSUMER;
  }

  async onModuleInit() {
    this.initConfig();
    await this.init();
  }

  abstract process(sources: Input | Input[]): Promise<void>;
  protected async beforeProcess(source: MessageConsume<Input>[]) {
    return;
  }

  private async initQueue() {
    this.queue = Queue<MessageConsume<Input>>(
      async (tasks: MessageConsume<Input>[]) => {
        await this.taskHandler(tasks);
      },
      this.config.concurrent,
      this.config.batchSize,
    );

    this.consumersTasks = Queue<MessageConsume<Input>>(async tasks => {
      for (let i = 0; i < tasks.length; i++) {
        await this.startConsuming();
      }
    }, this.getNumOfConsumer());
  }

  private async initConsumers() {
    for (let i = 0; i < this.getNumOfConsumer(); i++) {
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
    if (!this.rabbitService.getClient(this.config.cond_id)) {
      return;
    }
    await this.rabbitService.binding(
      {
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
      },
      this.config.cond_id,
    );
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
          else await this.rabbitService.commit(msg, this.config.cond_id);
        },
        rbOptions: {
          noAck: this.config.noAck || false,
          requeue: this.config.requeue || false,
          prefetchMessages: this.config.prefetchCount || 1,
        } as any,
        con_id: this.config.cond_id || DEFAULT_CON_ID,
      });
    } catch (error) {
      this.logger.error(`Could not consume queue: ${this.config.queue}`, error);
    }
  }

  private async processWithRetryDelayTimeout(sources: MessageConsume<Input>[], delayTimeout = 5): Promise<void> {
    const attemptToProcess = async (retryTime = 0) => {
      try {
        await this.beforeProcess(sources);
        const data = sources.map(source => source.data);
        await this.process(this.getBatchSize(data));
        await this.release(sources);
      } catch (e) {
        retryTime++;
        if (retryTime >= this.config.maxRetries) throw e;
        this.logger.error(
          `Processing data has been occurred error: %s and retry after ${delayTimeout}s`,
          e,
        );
        await sleep(delayTimeout, 'seconds');
        return attemptToProcess(retryTime);
      }
    };

    return await attemptToProcess();
  }

  protected async taskHandler(sources: MessageConsume<Input>[]) {
    try {
      await this.processWithRetryDelayTimeout(sources, this.config.retryTime);
    } catch (error) {
      this.logger.error(`Message failed with request: ${sources}`, error);
      await this.reject(sources);
      this.logger.log('Message has been rejected and pushed to dead letter!');
    }
  }

  protected async add(source: MessageConsume<Input>) {
    this.queue.push(source);
    await this.batchChecking();
  }

  protected async init() {
    await this.initQueue();
    await this.consume(this.add.bind(this));
    await this.start();
  }

  getAckMessage(sources: MessageConsume<Input>[]) {
    return sources.map(item => item.msg);
  }

  async release(sources: MessageConsume<Input>[]) {
    for (const msg of this.getAckMessage(sources)) {
      await this.rabbitService.commit(msg, this.config.cond_id);
    }
  }

  async reject(sources: MessageConsume<Input>[]) {
    for (const msg of this.getAckMessage(sources)) {
      await this.rabbitService.reject(msg, false, this.config.cond_id);
    }
  }

  private getBatchSize(sources: Input[]): Input | Input[] {
    return sources.length === DEFAULT_BATCH_SIZE ? sources[0] : sources;
  }

  async batchChecking() {
    if (!this.config.useBatchChecking) return;
    if (this.queue.length() >= this.config.batchSize) {
      this.logger.log('Resume message !');
      this.resume();
    } else {
      this.pause();
    }
  }

  pause() {
    if (this.queue.paused) {
      this.logger.debug(`Total message in queue ${this.queue.length()} .Process has been paused!`);
      return;
    }
    this.queue.pause();
    this.logger.debug('Waiting for enough data to batching process during %s seconds', this.config.batchTimeout / 1000);
    this.timeoutId = setTimeout(() => {
      this.resume();
    }, this.config.batchTimeout);
    this.logger.debug('%s Processor has been paused', this.context);
  }

  resume() {
    this.queue.resume();
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.logger.debug('%s Processor has been resumed', this.context);
  }
}
