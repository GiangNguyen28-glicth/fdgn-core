import { ICrudRepo, IFilterFindAll, IFilterFindOne } from '@fdgn/common';
import { Repository } from 'typeorm';

export abstract class TypeOrmRepo<T> implements ICrudRepo<T> {
  constructor(private readonly repository: Repository<T>) {}
  async findAll(options?: IFilterFindAll): Promise<T[]> {
    return await this.repository.find(options.filters);
  }
  async findOne(options?: IFilterFindOne): Promise<T> {
    return await this.repository.findOne(options.filters);
  }
  async findOneAndUpdate(options: IFilterFindAll, entity: Partial<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }
  async findAndUpdate(options: IFilterFindAll, entity: Partial<T>): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
  findAndDelete(options?: IFilterFindAll): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async insert(entity: T): Promise<T> {
    return await this.repository.create(entity);
  }
  update(entity: Partial<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }
  upsert(options: IFilterFindAll, entity: Partial<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }
  count(options?: IFilterFindAll): Promise<number> {
    throw new Error('Method not implemented.');
  }
  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }
}
