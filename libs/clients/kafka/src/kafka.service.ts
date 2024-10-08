import { Injectable } from '@nestjs/common'
import { Consumer, ConsumerConfig, Kafka, Producer } from 'kafkajs';
import { AbstractClientService, DEFAULT_CON_ID } from '@fdgn/client-core';
import { KafkaClientConfig } from './kafka.config';

@Injectable()
export class KafkaClientService extends AbstractClientService<KafkaClientConfig, Kafka> {
    private channels: { [conId: string]: Kafka } = {};
    private producers: {[conId: string]: Producer} = {};
    private consumers: { [conId: string]: Consumer } = {};
    constructor(){
        super('kafka', KafkaClientConfig)
    }

    protected async init(config: KafkaClientConfig): Promise<Kafka> {
        this.channels[config.clientId] = new Kafka(config);
        return this.channels[config.clientId];        
    }

    protected async stop(client: Kafka, conId?: string): Promise<void> {
        console.log(`${KafkaClientService.name} stop`);
    }

    protected async start(client: Kafka, conId?: string): Promise<void> {
        console.log(`${KafkaClientService.name} start`);
    }

    async initProducer(conId = DEFAULT_CON_ID): Promise<Producer> {
        let producer = this.producers[conId];
        if(producer) return producer;
        const kafka = this.channels[conId];
        producer = await kafka.producer();
        await producer.connect();
        return producer;
    }

    async initConsumer(conId = DEFAULT_CON_ID, consumerConfig: ConsumerConfig): Promise<Consumer> {
        let consumer = this.consumers[conId];
        if(consumer) return consumer;
        const kafka = this.channels[conId];
        consumer = await kafka.consumer(consumerConfig);
        await consumer.connect();
        return consumer;
    }
}  