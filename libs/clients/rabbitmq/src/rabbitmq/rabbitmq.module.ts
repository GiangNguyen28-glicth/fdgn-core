import { CommonModule } from '@fdgn/common';
import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ProcessorMetricProviders, RabbitMQMetrics, RabbitMQProducer } from '../processors';

@Global()
@Module({
  imports: [CommonModule],
  providers: [RabbitMQService, ...ProcessorMetricProviders, RabbitMQMetrics, RabbitMQProducer],
  exports: [RabbitMQService, ...ProcessorMetricProviders, RabbitMQMetrics, RabbitMQProducer],
})
export class RabbitMQModule {}
