/* eslint-disable @typescript-eslint/no-empty-interface */
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, PrimaryGeneratedColumn, Repository } from 'typeorm';

import { IBaseCurdTypeOrm, TypeOrmRepo } from '@fdgn/typeorm';
// import {} from '@fdgn/mongoose';
@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  price: number;

  @Column()
  name: string;
}

export interface IProductRepo extends IBaseCurdTypeOrm<Product, Repository<Product>> {}

export class ProductRepo extends TypeOrmRepo<Product> {
  constructor(
    @InjectRepository(Product)
    productRepo: Repository<Product>,
  ) {
    super(productRepo);
  }
}
export const ProductRepoProvider = {
  provide: ProductRepo.name,
  useClass: ProductRepo,
};
