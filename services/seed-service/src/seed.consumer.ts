import { RabbitConsumer } from '@fdgn/rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedConsumer extends RabbitConsumer<any> {
  constructor() {
    super(SeedConsumer.name, {
      queue: 'demo',
      prefetchCount: 1,
      queueType: 'classic',
      exchange: 'a',
      routingKey: 'b',
      retryTime: 3000,
      maxRetries: 1,
    });
  }

  async process(sources: any[]): Promise<any> {
    console.log(JSON.stringify(sources));
    return [];
  }
}
