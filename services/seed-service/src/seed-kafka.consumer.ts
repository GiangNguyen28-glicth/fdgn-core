import { KafkaClientService, KafkaConsumer } from '@fdgn/kafka';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DEFAULT_CON_ID } from '@fdgn/client-core';
@Injectable()
export class SeedKafkaConsumer implements OnModuleInit{
    constructor(
        @Inject() private kafkaClientService: KafkaClientService
    ){}



    async onModuleInit() {
        await this.process2('a')
    }
    async process(sources: any): Promise<void> {
        const kafka = this.kafkaClientService.getClient();
        const producer = kafka.producer();
        await producer.connect()
        await producer.send({
            topic: 'test-topic',
            messages: [
                { value: 'Hello KafkaJS user!' },
                { value: 'Hello KafkaJS user! 1' },
                { value: 'Hello KafkaJS user! 2' },
                { value: 'Hello KafkaJS user! 3' },
                { value: 'Hello KafkaJS user! 4' },
                { value: 'Hello KafkaJS user! 5' },
                { value: 'Hello KafkaJS user! 6' },
                { value: 'Hello KafkaJS user! 7' },
            ],
        })
    }

    async process2(sources: any): Promise<void> {
        const consumer = await this.kafkaClientService.initConsumer('KAFKA01', {groupId: 'test-group'});
        await consumer.connect()
        await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log({
                    partition,
                    offset: message.offset,
                    value: message?.value?.toString(),
                })
            },
        })
    }

}