import { DBS_TYPE } from '@fdgn/common';
import { RedisClientService } from '@fdgn/redis';
import { Controller, Get, Inject } from '@nestjs/common';
import { ClientRMQ, ClientProxy, Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { RabbitMQProducer } from '@fdgn/rabbitmq';
import { PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { lastValueFrom } from 'rxjs';
import { ProducerMode } from 'libs/clients/rabbitmq/dist';

const dbsType = DBS_TYPE.TYPE_ORM;
export interface INew {
  key: string;
  value: string;
}
@Controller('seed')
export class SeedController {
  constructor(
    // @InjectMetric('metric_name') public counter: Counter<string>,
    // @Inject('A') private clientService: ClientRMQ,
    private log: PinoLogger,
    private producer: RabbitMQProducer<INew>, // private redisService: RedisClientService,
  ) {}

  @Get('test-2')
  async test2(): Promise<any> {
    this.producer.setConfig({
      queue: 'giang_demo',
      mode: ProducerMode.Queue,
      type: 'quorum',
      exchange: 'c',
      routingKey: 'd',
    });

    await this.producer.publish([{ key: 'giang', value: 'giang1' }]);

    // console.log('Hello');
    // const results = this.clientService.send({ cmd: 'sign_up' }, { a: 'vkl' });
    // await results.subscribe();
    // await lastValueFrom(this.clientService.send('login', { l: 1 }));
    this.log.info('abc');
    // this.counter.inc();
    return 'hello world';
  }

  // @Get('test-3')
  // async test3(): Promise<any> {
  //   const data = await this.redisService.delNamespace('a*');
  //   console.log(await data);
  //   return await data;
  // }

  // @MessagePattern({ cmd: 'sign_up' })
  // async validateUser(@Payload() signUp: any, @Ctx() ctx: RmqContext) {
  //   console.log(signUp);
  //   return signUp;
  // }
}
