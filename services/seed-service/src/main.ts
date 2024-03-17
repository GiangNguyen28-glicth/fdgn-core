import { NestFactory } from '@nestjs/core';
import { ClientOptions } from '@nestjs/microservices';
import { RabbitMQClientService } from '@fdgn/rabbitmq';
import { SeedModule } from './seed.module';

async function bootstrap() {
  const app = await NestFactory.create(SeedModule);
  // const rmqService = app.get<RabbitMQClientService>(RabbitMQClientService);
  // const options: ClientOptions = rmqService.getOptions({ queue: 'demo' });
  // console.log(options);
  // app.connectMicroservice(options);
  // await app.startAllMicroservices();
  app.listen(3003);
}
bootstrap();
