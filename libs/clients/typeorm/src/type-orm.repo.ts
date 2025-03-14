import { IInsert, IUpdateOptions } from '@fdgn/common';
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
      skip: (pagination?.page - 1) * pagination?.size || 0,
      take: pagination?.size,
      relations,
      order: sort_options,
    });
  }

  async findAllAndCount(options?: IOptionsFindAllTypeOrm<T>): Promise<[data: T[], total_count: number]> {
    if (!options) {
      return await this.repository.findAndCount();
    }
    const { filters, sort_options, fields, pagination, relations } = options;

    return await this.repository.findAndCount({
      where: filters,
      select: fields,
      skip: (pagination?.page - 1) * pagination?.size || 0,
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
    const e = await this.repository.findOne({ where: filters });
    if (!e) {
      return null;
    }
    Object.assign(e, entity);
    if (session) {
      return await (session as QueryRunner).manager.save(e);
    } else {
      return await this.save({ entity: e });
    }
  }

  async insert(options: IInsert<T>): Promise<T> {
    const { entity } = options;
    return this.repository.create(entity as T);
  }

  async count(options?: IOptionsFindAllTypeOrm<T>): Promise<number> {
    const { filters } = options;
    return this.repository.count({ where: filters });
  }

  async save(options: IInsert<T>): Promise<T> {
    const { entity, session } = options;
    if (session) {
      return (await (session as QueryRunner).manager.save(entity)) as T;
    }
    return await this.repository.save(entity as T);
  }
}
