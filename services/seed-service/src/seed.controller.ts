import { Controller, Get, Inject, Post, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { TypeOrmService } from '@fdgn/typeorm';

import { ClientRMQ, ClientProxy, Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { DBS_TYPE, FilterBuilder } from '@fdgn/common';
import { RedisClientService } from '@fdgn/redis';

import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { RabbitMQProducer, ProducerMode } from '@fdgn/rabbitmq';
import { PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { lastValueFrom } from 'rxjs';
import { IProductRepo, Product, ProductTypeOrmRepo } from './entities';

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
    @Inject('PRODUCT_TYPE_ORM')
    protected productRepo: IProductRepo,
    private typeOrmService: TypeOrmService,

    private log: PinoLogger,
    private producer: RabbitMQProducer<INew>, // private redisService: RedisClientService,
  ) {}

  @Post('product')
  async createProduct(@Body() { name, price }) {
    const product = await this.productRepo.insert({ entity: { name, price } });
    await this.productRepo.save({ entity: product });
    return product;
  }

  @Post('product/:id')
  async update(@Param('id') id: number, @Body() dto: any) {
    const queryRunner = await this.typeOrmService.getConnection();

    try {
      const { filters } = new FilterBuilder<Product>().getInstance(dbsType).setFilterItem('id', '$eq', id).buildQuery();
      console.log(JSON.stringify(filters));
      // return await this.productRepo.findOne({ filters });
      const product = await this.productRepo.findOneAndUpdate({ filters, entity: dto, session: queryRunner });
      // throw new Error('vkl');
      await queryRunner.commitTransaction();
      return product;
    } catch (error) {
      queryRunner.rollbackTransaction();
      console.log('Error', error);
    }
  }

  @Get('test-2')
  async test2(): Promise<any> {
    this.producer.setConfig({
      mode: ProducerMode.Queue,
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
