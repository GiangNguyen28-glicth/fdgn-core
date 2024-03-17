import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProducerMode, RabbitMQProducer } from '@fdgn/rabbitmq';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private producer: RabbitMQProducer<any>) {}
  async onModuleInit() {
    this.producer.setConfig({
      queue: 'giang_demo',
      mode: ProducerMode.Queue,
      type: 'quorum',
      exchange: 'c',
      routingKey: 'd',
    });
    await this.producer.start();

    await this.producer.publish([{ key: 'giang', value: 'giang1' }]);
  }
}
