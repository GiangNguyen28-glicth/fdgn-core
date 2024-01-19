export interface CrudRepo<T, ID> {
  findAll(limit?: number): Promise<T[]>;

  findOne(id: ID): Promise<T>;

  count(): Promise<number>;

  insert(entity: T): Promise<void>;

  update(entity: T): Promise<void>;

  save(entities: T[]): Promise<void>;

  delete(entity: T): Promise<void>;

  inserts(entities: T[]): Promise<void>;

  upsert(entities: T[]): Promise<void>;
}
