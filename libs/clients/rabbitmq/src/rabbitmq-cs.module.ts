import { Global, Module, DynamicModule } from '@fdgn/common';
import { ClientCoreModule } from '@fdgn/client-core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQCsConfig } from './rabbitmq-cs.service.ts';
const CONFIG_KEY = 'rabbit';

@Global()
@Module({
  imports: [ClientCoreModule],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQCsModule {
  static register(serviceName: string): DynamicModule {
    return {
      module: RabbitMQCsModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: serviceName,
            useFactory: (configService: ConfigService) => {
              const rmqConfig = new RabbitMQCsConfig(configService, CONFIG_KEY);
              const { hostname, username, password, port, queue } = rmqConfig.getInstance();
              const url = `amqp://${username}:${password}@${hostname}:${port}`;
              return {
                transport: Transport.RMQ,
                urls: [url],
                queue: queue,
              };
            },
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
