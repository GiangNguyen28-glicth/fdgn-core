import { DBS_TYPE, FilterBuilder, FilterMongoBuilder, FilterTypeOrmBuilder } from '@fdgn/common';
import { Controller, Get, Inject } from '@nestjs/common';
import { Product, ProductTypeOrmRepo } from './entities';

const dbsType = DBS_TYPE.TYPE_ORM;
@Controller('seed')
export class SeedController {
  constructor(@Inject('PRODUCT' + dbsType) private repo: ProductTypeOrmRepo) {}
  @Get('test-1')
  async test1(): Promise<any> {
    const { filters } = new FilterBuilder<Product>().getInstance(dbsType).setFilterItem('id', '$gte', 1).buildQuery();
    return await this.repo.findAll({ filters });
  }

  @Get('test-2')
  async test2(): Promise<any> {
    const product: Product = {
      id: 1,
      price: 10,
      name: 'Product -1',
    };
    const p = await this.repo.insert(product);
    return await this.repo.save(p);
  }
}
