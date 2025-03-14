export interface IUpdateOptions<T> {
  filters: any;
  entity: Partial<T>;
  session?: unknown;
}

export interface IInsert<T> {
  entity: Partial<T>;
  session?: unknown;
}

export interface ICrudRepo<T, Options> {
  findAll(options?: Options): Promise<T[]>;

  findAllAndCount(options?: Options): Promise<[data: T[], count: number]>;

  findOne(options?: Options): Promise<T>;

  findOneAndUpdate(options: IUpdateOptions<T>): Promise<T>;

  insert(insert: IInsert<T>): Promise<T>;

  count(options?: any): Promise<number>;

  save(insert: IInsert<T>): Promise<T>;
}
