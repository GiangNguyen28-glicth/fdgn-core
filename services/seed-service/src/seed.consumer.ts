import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitConsumer } from '@fdgn/rabbitmq';

@Injectable()
export class SeedConsumer extends RabbitConsumer<any> {
  constructor(protected configService: ConfigService) {
    super(SeedConsumer.name, {
      queue: 'demo',
      prefetchCount: 1,
      queueType: 'classic',
      exchange: 'a',
      routingKey: 'b',
      retryTime: 3000,
      maxRetries: 1,
      numOfConsumer: 1,
    });
  }

  async process(sources: any[]): Promise<any> {
    console.log(JSON.stringify(sources));
    return [];
  }
}
