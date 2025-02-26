import { HttpClientService, RestController } from '@fdgn/common';
import { FilterTypeOrmBuilder } from '@fdgn/typeorm';
import { Body, Get, Inject, LoggerService, Param, Post, Req, NotFoundException, Logger, Controller } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { lastValueFrom } from 'rxjs';
import { Product } from './entities';
import { ISeedRepo, SeedRepo } from './entities/seed.schema';
export interface INew {
  key: string;
  value: string;
}
@Controller('seed')
export class SeedController {
  constructor(
    // @InjectMetric('metric_name') public counter: Counter<string>,
    // @Inject('A') private clientService: ClientRMQ,
    // @Inject(ProductRepo.name)
    // protected productRepo: IProductRepo,
    // private typeOrmService: TypeOrmService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    // @Inject(SeedRepo.name) private readonly seedRepo: ISeedRepo,
    // private httpService: HttpClientService,
    // private redisService: RedisClientService
  ) {}

  @Get('test-2')
  async test2(@Req() req): Promise<any> {
    this.logger.log('log');
    // const q = await this.seedRepo.insert({ entity: { name: 'Hehe', price: 10 } });
    // await this.seedRepo.save({ entity: q });
    // return q;
  }

  @Get('test-3')
  async test3(): Promise<any> {
    return 'test-3';
  }

  @Get('test-4')
  async test4(): Promise<any> {
    return null;
  }

  @Get(':id')
  async findProductId(@Param('id') id: string): Promise<any> {
    try {
      console.log('Zo day');
      // const response = await this.httpService.request({
      //   url: `http://localhost:4017/catalog/product/${id}`,
      //   method: 'GET',
      // });
      // const product = await response.data;
      // return product;
    } catch (error) {
      // console.log(error);
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
