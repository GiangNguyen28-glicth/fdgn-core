import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { sleep } from '@fdgn/common';
import { RabbitConsumer, ICheckQueue } from '@fdgn/rabbitmq';

@Injectable()
export class SeedConsumer extends RabbitConsumer<any> {
  constructor(protected configService: ConfigService) {
    super(SeedConsumer.name, {
      queue: 'demo',
      prefetchCount: 10,
      queueType: 'quorum',
      exchange: 'a',
      routingKey: 'b',
      retryTime: 3000,
      maxRetries: 1,
      numOfConsumer: 1,
      useBatchSize: true,
      useConcurrent: false,
      useBatchChecking: true,
      batchTimeout: 10000,
      concurrent: 1,
      batchSize: 10,
    });
  }

  async process(sources): Promise<any> {
    // const totalMessage = await this.rmqService.getTotalMessageInQueue('demo');
    console.log(JSON.stringify(sources));
    return [];
  }
}
