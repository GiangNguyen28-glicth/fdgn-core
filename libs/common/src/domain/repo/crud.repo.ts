import { PopulateOptions, Document } from 'mongoose';
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

export interface ICrudRepo<T> {
  findAll(options?: IFilterFindAll): Promise<T[]>;

  findOne(options?: IFilterFindOne): Promise<T>;

  findOneAndUpdate(options: IFilterFindAll, entity: Partial<T>): Promise<T>;

  findAndUpdate(options: IFilterFindAll, entity: Partial<T>): Promise<T[]>;

  findAndDelete(options?: IFilterFindAll): Promise<void>;

  insert(entity: Partial<T>): Promise<T>;

  update(entity: Partial<T>): Promise<T>;

  upsert(options: IFilterFindAll, entity: Partial<T>): Promise<T>;

  count(options?: IFilterFindAll): Promise<number>;

  save(entity: Partial<T>): Promise<T>;
}
