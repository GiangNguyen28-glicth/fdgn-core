import { Column, Entity, PrimaryGeneratedColumn, Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmRepo } from '@fdgn/typeorm';
import { ICrudRepo } from '@fdgn/common';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  price: number;

  @Column()
  name: string;
}

export type IProductRepo = ICrudRepo<Product>;

export class ProductTypeOrmRepo extends TypeOrmRepo<Product> {
  constructor(
    @InjectRepository(Product)
    productRepo: Repository<Product>,
    dataSource: DataSource,
  ) {
    super(productRepo, dataSource);
  }
}
export const ProductRepoProvider = {
  provide: 'PRODUCT_TYPE_ORM',
  useClass: ProductTypeOrmRepo,
};
