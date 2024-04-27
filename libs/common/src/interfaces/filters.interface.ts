import { PaginationDTO } from '../dto';

export interface IOptionsFindAll<T> {
  pagination?: PaginationDTO;
  filters: any;
  sort_options?: any;
  fields?: Array<keyof T>;
}

export interface IOptionsFindOne<T> {
  filters?: any;
  fields?: Array<keyof T>;
}
