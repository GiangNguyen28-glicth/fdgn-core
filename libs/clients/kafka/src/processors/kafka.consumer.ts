import { sleep } from '@fdgn/common';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EachMessagePayload, KafkaMessage } from 'kafkajs';
import { KafkaClientService } from '../kafka.service';
import { IConsumeable, IKafkaConsumeConfig, IMessageConsume } from '../models';

export abstract class KafkaConsumer<Input> implements IConsumeable<Input>, OnModuleInit {
  constructor(
    @Inject()
    protected configService: ConfigService,
    @Inject()
    private kafkaClientService: KafkaClientService,
    private kafkaConfig: IKafkaConsumeConfig,
  ) {}
  consume(cb: (source: IMessageConsume<Input>) => void): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public get _kafkaConfig() {
    return this.kafkaConfig;
  }

  protected get kafkaService(): KafkaClientService {
    return this.kafkaClientService;
  }

  abstract process(sources: Input | Input[]): Promise<void>;
  protected async beforeProcess(source: IMessageConsume<Input>) {
    return;
  }

  onModuleInit() {
    this.initConfig();
  }

  initConfig() {
    console.log('Init config');
    this.kafkaConfig.numOfConsumer ??= 1;
  }

  async start(): Promise<void> {
    const kafka_client = this.kafkaClientService.getClient(this.kafkaConfig.con_id);
    if (!kafka_client) {
      throw new Error(`KafkaClient does not exists with id ${this.kafkaConfig.con_id}`);
    }
    const consumer = await this.kafkaService.initConsumer(this.kafkaConfig.con_id, this.kafkaConfig.consumerCfg);
    consumer.subscribe(this.kafkaConfig.consumerSubscribeTopic);
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // const sources = this.transform(message);
        // await this.processWithRetryDelayTimeout(sources);
      },
    });
  }

  private async processWithRetryDelayTimeout(source: IMessageConsume<Input>, delayTimeout = 5): Promise<void> {
    const attemptToProcess = async (retry_time = 0) => {
      try {
        await this.beforeProcess(source);
        const data = source.data;
        await this.process(data);
      } catch (e) {
        retry_time++;
        if (retry_time >= 2) throw e;
        console.error(
          `Processing data into client database has been occurred error: %s and retry after ${delayTimeout}s`,
          e,
        );
        await sleep(delayTimeout, 'seconds');
        return attemptToProcess(retry_time);
      }
    };

    return await attemptToProcess();
  }

  transform(payload: EachMessagePayload): IMessageConsume<Input> {
    try {
      const response = JSON.parse(payload.message.toString());
      return { data: response, msg: payload };
    } catch (error) {
      throw error;
    }
  }
}
