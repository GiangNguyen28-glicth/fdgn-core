import { PopulateOptions } from 'mongoose';
import { PaginationDTO } from '../../dto';

export interface IFilterFindAll {
  pagination?: PaginationDTO;
  filters?: any;
  sortOption?: any;
  fields?: string[];
  populates?: PopulateOptions[];
}

export interface IFilterFindOne {
  filters?: any;
  fields?: string[];
  populates?: PopulateOptions[];
}

export interface IUpdateOptions<T> {
  filters: IFilterFindAll['filters'];
  entity: Partial<T>;
  session?: unknown;
}

export interface IInsert<T> {
  entity: Partial<T>;
  session?: unknown;
}

export interface ICrudRepo<T> {
  findAll(options?: IFilterFindAll): Promise<T[]>;

  findOne(options?: IFilterFindOne): Promise<T>;

  findOneAndUpdate(options: IUpdateOptions<T>): Promise<T>;

  findAndUpdate(options: IUpdateOptions<T>): Promise<T[]>;

  findAndDelete(options?: IFilterFindAll['filters']): Promise<void>;

  insert(insert: IInsert<T>): Promise<T>;

  update(options: IUpdateOptions<T>): Promise<T>;

  upsert(options: IUpdateOptions<T>): Promise<T>;

  count(options?: IFilterFindAll['filters']): Promise<number>;

  save(insert: IInsert<T>): Promise<T>;
}
