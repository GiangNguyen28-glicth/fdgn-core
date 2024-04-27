import { IInsert, IUpdateOptions, throwIfNotExists } from '@fdgn/common';
import { QueryRunner, Repository } from 'typeorm';
import { IBaseCurdTypeOrm, IOptionsFindAllTypeOrm, IOptionsFindOneTypeOrm } from './common';

export abstract class TypeOrmRepo<T> implements IBaseCurdTypeOrm<T, Repository<T>> {
  constructor(public readonly repository: Repository<T>) {}

  getRepo(): Repository<T> {
    return this.repository;
  }

  async findAll(options?: IOptionsFindAllTypeOrm<T>): Promise<T[]> {
    if (!options) {
      return await this.repository.find();
    }
    const { filters, sort_options, fields, pagination, relations } = options;

    return await this.repository.find({
      where: filters,
      select: fields,
      skip: (pagination?.page - 1) * pagination?.size,
      take: pagination?.size,
      relations,
      order: sort_options,
    });
  }

  async findOne(options?: IOptionsFindOneTypeOrm<T>): Promise<T> {
    const { filters, fields, relations } = options;
    return await this.repository.findOne({ where: filters, select: fields, relations });
  }

  async findOneAndUpdate(options: IUpdateOptions<T>): Promise<T> {
    const { filters, entity, session } = options;
    const e = await this.repository.findOne(filters);
    throwIfNotExists(e, 'Update failed, not fount item');
    Object.assign(e, entity);
    if (session) {
      return await (session as QueryRunner).manager.save(e);
    } else {
      return await this.save({ entity: e });
    }
  }

  async findAndUpdate(options: IUpdateOptions<T>): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  findAndDelete(options?: IOptionsFindAllTypeOrm<T>): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async insert(options: IInsert<T>): Promise<T> {
    const { entity, session } = options;
    return this.repository.create(entity as T);
  }

  async update(options: IInsert<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  upsert(options: IUpdateOptions<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }

  count(options?: IOptionsFindAllTypeOrm<T>): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async save(options: IInsert<T>): Promise<T> {
    const { entity, session } = options;
    if (session) {
      return (await (session as QueryRunner).manager.save(entity)) as T;
    }
    return await this.repository.save(entity as T);
  }
}
