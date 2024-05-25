import { Body, Get, Param, Post, Inject, LoggerService, Req } from '@nestjs/common';
import { RestController } from '@fdgn/common';
import { FilterTypeOrmBuilder } from '@fdgn/typeorm';
import axios from 'axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { RedisClientService } from '@fdgn/redis';

import { Product } from './entities';

export interface INew {
  key: string;
  value: string;
}
@RestController('seed')
export class SeedController {
  constructor(
    // @InjectMetric('metric_name') public counter: Counter<string>,
    // @Inject('A') private clientService: ClientRMQ,
    // @Inject(ProductRepo.name)
    // protected productRepo: IProductRepo,
    // private typeOrmService: TypeOrmService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    private redisService: RedisClientService,
  ) {}

  @Get('test-2')
  async test2(@Req() req): Promise<any> {
    this.logger.log('log');
    this.logger.error('error');
    const value = await this.redisService.set({ key: `key${1}`, value: 's' });
    // for (let i = 0; i < 100; i++) {
    //   console.log(value);
    // }
    // this.counter.inc();
    return 'hello world';
  }

  @Get('test-3')
  async test3(): Promise<any> {
    return await this.redisService.get({ key: `key${10000}` });
  }

  @Get('test-4')
  async test4(): Promise<any> {
    return await this.redisService.get({ key: `key${1}` });
  }

  @Get(':id')
  async findProductId(@Param('id') id: string): Promise<any> {
    try {
      const { filters } = new FilterTypeOrmBuilder<Product>().setFilterItem('id', '$eq', id).buildQuery();
      const response = await axios.get(`http://localhost:4017/catalog/product/${id}`);
      const product = await response.data;
      // const product: Product = await this.productRepo.findOne({ filters });
      // if (!product) {
      //   throwIfNotExists(product, 'DD');
      // }33.......
      return product;
    } catch (error) {
      throw error;
    }
  }

  @Post('product')
  async createProduct(@Body() { name, price }) {
    // const product = await this.productRepo.insert({ entity: { name, price } });
    // await this.productRepo.save({ entity: product });
    // return product;
  }

  @Post('product/:id')
  async update(@Param('id') id: number, @Body() dto: any) {
    // const queryRunner = await this.typeOrmService.getConnection();
    // try {
    //   const { filters } = new FilterTypeOrmBuilder<Product>().setFilterItem('id', '$eq', id).buildQuery();
    //   console.log(JSON.stringify(filters));
    //   // return await this.productRepo.findOne({ filters });
    //   const product = await this.productRepo.findOneAndUpdate({ filters, entity: dto, session: queryRunner });
    //   // throw new Error('vkl');
    //   await queryRunner.commitTransaction();
    //   return product;
    // } catch (error) {
    //   queryRunner.rollbackTransaction();
    //   console.log('Error', error);
    // }
  }

  // @Get('test-3')
  // async test3(): Promise<any> {
  //   const data = await this.redisService.delNamespace('a*');
  //   console.log(await data);
  //   return await data;
  // }
}
