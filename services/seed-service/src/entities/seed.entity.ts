import { Column, Entity, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepo } from '@fdgn/typeorm';

@Entity({ name: Product.name })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  price: number;

  @Column()
  name: string;
}

export class ProductTypeOrmRepo extends TypeOrmRepo<Product> {
  constructor(
    @InjectRepository(Product)
    protected productRepo: Repository<Product>,
  ) {
    super(productRepo);
  }
}
export const ProductRepoProvider = {
  provide: 'PRODUCT_TYPE_ORM',
  useClass: ProductTypeOrmRepo,
};
