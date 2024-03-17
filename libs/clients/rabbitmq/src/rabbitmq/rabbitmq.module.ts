import { ClientCoreModule } from '@fdgn/client-core';
import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ProcessorMetricProviders, RabbitMQMetrics, RabbitMQProducer } from '../processors';

@Global()
@Module({
  imports: [ClientCoreModule],
  providers: [RabbitMQService, ...ProcessorMetricProviders, RabbitMQMetrics, RabbitMQProducer],
  exports: [RabbitMQService, ...ProcessorMetricProviders, RabbitMQMetrics, RabbitMQProducer],
})
export class RabbitMQModule {}
