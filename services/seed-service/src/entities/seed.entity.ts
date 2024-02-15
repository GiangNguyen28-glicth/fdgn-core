import { Column, Entity, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepo } from '@fdgn/typeorm';
import { DBS_TYPE } from 'libs/common/dist';

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
  provide: 'PRODUCT' + DBS_TYPE.TYPE_ORM,
  useClass: ProductTypeOrmRepo,
};
