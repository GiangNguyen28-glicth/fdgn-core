import { Controller, Get, Inject } from '@nestjs/common';
import { Product, ProductTypeOrmRepo } from './entities/seed.entity';
import { DBS_TYPE, FilterBuilder } from '@fdgn/common';

@Controller('seed')
export class SeedController {
  private dbsType: DBS_TYPE = 'DBS_TYPE_ORM';
  constructor(@Inject('PRODUCT_TYPE_ORM') private repo: ProductTypeOrmRepo) {}
  @Get('test-1')
  async test1(): Promise<any> {
    const { filters } = new FilterBuilder<Product>(this.dbsType).setFilterItem('id', '$gte', 2).buildQuery();
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
