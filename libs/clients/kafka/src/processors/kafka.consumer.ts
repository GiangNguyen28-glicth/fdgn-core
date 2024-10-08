import { sleep } from '@fdgn/common';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaMessage } from 'kafkajs';
import { KafkaClientService } from '../kafka.service';
import { IConsumeable, IKafkaConsumeConfig, IMessageConsume } from '../models';

export abstract class KafkaConsumer<Input> implements IConsumeable<Input>, OnModuleInit {
    constructor(
        @Inject()
        protected configService: ConfigService,
        @Inject()
        private kafkaClientService: KafkaClientService,
        private kafkaConfig: IKafkaConsumeConfig
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
    }

    async start():Promise<void> {
        const kafkaClient = this.kafkaClientService.getClient(this.kafkaConfig.conId);
        if(!kafkaClient) {
            throw new Error(`KafkaClient does not exists with id ${this.kafkaConfig.conId}`);
        }
        const consumer = await this.kafkaService.initConsumer(this.kafkaConfig.conId, this.kafkaConfig.consumerCfg);
        consumer.subscribe(this.kafkaConfig.consumerSubscribeTopic);
        await consumer.run({
            eachMessage: async({ topic, partition, message })=>{
                const sources = this.transform(message);
                await this.processWithRetryDelayTimeout(sources);
            },
        }) 
    }

    private async processWithRetryDelayTimeout(source: IMessageConsume<Input>, delayTimeout = 5): Promise<void> {
        const attemptToProcess = async (retryTime = 0) => {
          try {
            await this.beforeProcess(source);
            const data = source.data;
            await this.process(data);
          } catch (e) {
            retryTime++;
            if (retryTime >= 2) throw e;
            console.error(
              `Processing data into client database has been occurred error: %s and retry after ${delayTimeout}s`,
              e,
            );
            await sleep(delayTimeout, 'seconds');
            return attemptToProcess(retryTime);
          }
        };
    
        return await attemptToProcess();
    }

    transform(msg: KafkaMessage): IMessageConsume<Input> {
        try {
          const response = JSON.parse(msg.value.toString());
          return { data: response, msg };
        } catch (error) {
          throw error;
        }
    }
}