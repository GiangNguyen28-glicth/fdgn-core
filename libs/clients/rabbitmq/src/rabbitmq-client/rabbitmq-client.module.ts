import { Global, Module, DynamicModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { CommonModule } from '@fdgn/common';

import { RabbitMQClientService, RabbitMQClientConfig } from '.';
const CONFIG_KEY = 'rabbit';

@Global()
@Module({
  imports: [CommonModule],
  providers: [RabbitMQClientService],
  exports: [RabbitMQClientService],
})
export class RabbitMQClientModule {
  static register(serviceName: string): DynamicModule {
    if (!serviceName) {
      throw new Error(`Missing service name from ${RabbitMQClientModule.name}`);
    }
    return {
      module: RabbitMQClientModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: serviceName,
            useFactory: (configService: ConfigService) => {
              const rmqConfig = new RabbitMQClientConfig(configService, CONFIG_KEY);
              const { hostname, username, password, port, queue } = rmqConfig.getInstance();
              const url = `amqp://${username}:${password}@${hostname}:${port}`;
              return {
                transport: Transport.RMQ,
                urls: [url],
                queue,
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
