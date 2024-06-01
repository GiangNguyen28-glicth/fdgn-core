import { RestController } from '@fdgn/common';
import { FilterTypeOrmBuilder } from '@fdgn/typeorm';
import { Body, Get, Inject, LoggerService, Param, Post, Req, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { Product } from './entities';
import { ISeedRepo, SeedRepo } from './entities/seed.schema';

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
    @Inject(SeedRepo.name) private readonly seedRepo: ISeedRepo,
  ) {}

  @Get('test-2')
  async test2(@Req() req): Promise<any> {
    this.logger.log('log');
    const q = await this.seedRepo.insert({ entity: { name: 'Hehe', price: 10 } });
    await this.seedRepo.save({ entity: q });
    return q;
  }

  @Get('test-3')
  async test3(): Promise<any> {
    return null;
  }

  @Get('test-4')
  async test4(): Promise<any> {
    return null;
  }

  @Get(':id')
  async findProductId(@Param('id') id: string): Promise<any> {
    try {
      throw new NotFoundException('Not found');
      const { filters } = new FilterTypeOrmBuilder<Product>().setFilterItem('id', '$eq', id).buildQuery();
      const response = await axios.get(`http://localhost:4017/catalog/product/${id}`);
      const product = await response.data;
      // const product: Product = await this.productRepo.findOne({ filters });
      // if (!product) {
      //   throwIfNotExists(product, 'DD');
      // }33.......
      return product;
    } catch (error) {
      console.log(error);
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
