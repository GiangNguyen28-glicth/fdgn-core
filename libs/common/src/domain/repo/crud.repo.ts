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

  findOne(options?: Options): Promise<T>;

  findOneAndUpdate(options: IUpdateOptions<T>): Promise<T>;

  findAndUpdate(options: IUpdateOptions<T>): Promise<T[]>;

  findAndDelete(options?: any): Promise<void>;

  insert(insert: IInsert<T>): Promise<T>;

  update(options: IUpdateOptions<T>): Promise<T>;

  upsert(options: IUpdateOptions<T>): Promise<T>;

  count(options?: any): Promise<number>;

  save(insert: IInsert<T>): Promise<T>;
}
