import { QueryRunner, Repository, DataSource } from 'typeorm';
import { ICrudRepo, IFilterFindAll, IFilterFindOne, IInsert, IUpdateOptions, throwIfNotExists } from '@fdgn/common';

export abstract class TypeOrmRepo<T> implements ICrudRepo<T> {
  constructor(public readonly repository: Repository<T>, public dataSource: DataSource) {}

  async findAll(options?: IFilterFindAll): Promise<T[]> {
    return await this.repository.find(options?.filters);
  }

  async findOne(options?: IFilterFindOne): Promise<T> {
    return await this.repository.findOne(options?.filters);
  }

  async findOneAndUpdate(options: IUpdateOptions<T>): Promise<T> {
    const { filters, entity, session } = options;
    const e = await this.repository.findOne(filters);
    throwIfNotExists(e, 'Update failed, not fount item');
    Object.assign(e, entity);
    if (session) {
      await (session as QueryRunner).manager.save(e);
    } else {
      await this.save({ entity: e });
    }
    return e;
  }

  async findAndUpdate(options: IUpdateOptions<T>): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  findAndDelete(options?: IFilterFindAll): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async insert(options: IInsert<T>): Promise<T> {
    const { entity, session } = options;
    // if (session) {
    //   await (session as QueryRunner).manager.create(entity as T);
    // }
    return this.repository.create(entity as T);
  }

  async update(options: IInsert<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  upsert(options: IUpdateOptions<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  count(options?: IFilterFindAll): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async save(options: IInsert<T>): Promise<T> {
    const { entity, session } = options;
    if (session) {
      await (session as QueryRunner).manager.save(entity);
    }
    return this.repository.save(entity as T);
  }
}
