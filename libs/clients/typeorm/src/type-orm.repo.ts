import { QueryRunner, Repository, DataSource } from 'typeorm';
import { ICrudRepo, IFilterFindAll, IFilterFindOne, IUpdateOptions, throwIfNotExists } from '@fdgn/common';

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
      await this.save(e);
    }
    return e;
  }

  async findAndUpdate(options: IUpdateOptions<T>): Promise<T[]> {
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

  upsert(options: IUpdateOptions<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  count(options?: IFilterFindAll): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async getConnection(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }
}
