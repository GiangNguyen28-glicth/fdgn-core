import { Injectable } from '@nestjs/common';
import { Consumer, ConsumerConfig, Kafka, Producer } from 'kafkajs';
import { AbstractClientService, DEFAULT_CON_ID } from '@fdgn/client-core';
import { KafkaClientConfig } from './kafka.config';

@Injectable()
export class KafkaClientService extends AbstractClientService<KafkaClientConfig, Kafka> {
  private channels: { [con_id: string]: Kafka } = {};
  private producers: { [con_id: string]: Producer } = {};
  private consumers: { [con_id: string]: Consumer } = {};
  constructor() {
    super('kafka', KafkaClientConfig);
  }

  protected async init(config: KafkaClientConfig): Promise<Kafka> {
    console.log(config);
    this.channels[config.con_id] = new Kafka(config);
    return this.channels[config.con_id];
  }

  protected async stop(client: Kafka, con_id?: string): Promise<void> {
    console.log(`${KafkaClientService.name} stop`);
  }

  protected async start(client: Kafka, con_id?: string): Promise<void> {
    console.log(`${KafkaClientService.name} start`);
  }

  async initProducer(con_id = DEFAULT_CON_ID): Promise<Producer> {
    let producer = this.producers[con_id];
    if (producer) return producer;
    const kafka = this.channels[con_id];
    producer = await kafka.producer();
    await producer.connect();
    return producer;
  }

  async initConsumer(con_id = DEFAULT_CON_ID, consumerConfig: ConsumerConfig): Promise<Consumer> {
    let consumer = this.consumers[con_id];
    if (consumer) return consumer;
    const kafka = this.channels[con_id];
    consumer = await kafka.consumer(consumerConfig);
    await consumer.connect();
    return consumer;
  }
}
