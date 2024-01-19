import { Global, Module } from '@fdgn/common';
import { ClientCoreModule } from '@fdgn/client-core';
import { RabbitMQService } from './rabbitmq.service';

@Global()
@Module({
  imports: [ClientCoreModule],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
