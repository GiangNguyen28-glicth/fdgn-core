import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProducerMode, RabbitMQProducer } from '@fdgn/rabbitmq';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private producer: RabbitMQProducer<any>) {}
  async onModuleInit() {
    this.producer.setConfig({
      exchange: 'c',
      routingKey: 'd',
      mode: ProducerMode.Exchange,
    });
    await this.producer.start();

    await this.producer.publish([{ key: 'giang', value: 'giang1' }]);
  }
}
