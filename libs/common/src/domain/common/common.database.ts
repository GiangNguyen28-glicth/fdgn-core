export interface IEntity<ID extends number | string> {
  id: ID;
}
export interface IDateTracking {
  created_at?: Date;
  updated_at?: Date;
}

export interface IUserTracking<ID extends number | string> {
  created_by?: ID;
  updated_by?: ID;
}

export interface ISoftDelete<ID extends number | string> {
  is_deleted?: boolean;
  deleted_at?: Date;
  deleted_by?: ID;
}

export interface IAuditableSoftDelete<ID extends string | number>
  extends IDateTracking,
    IUserTracking<ID>,
    ISoftDelete<ID>,
    IEntity<ID> {}

export type IAuditable<ID extends string | number> = Omit<
  IAuditableSoftDelete<ID>,
  'is_deleted' | 'deleted_at' | 'deleted_by'
>;

export interface IBaseEntity<ID extends string | number> extends ISoftDelete<ID>, IDateTracking, IEntity<ID> {}

export type IAuditableSoftDeleteMongo = Omit<IAuditableSoftDelete<string>, 'id'> & {
  _id: string;
};

export type IAuditableMongo = Omit<IAuditableSoftDelete<string>, 'is_deleted' | 'deleted_at' | 'deleted_by'>;

export type IBaseEntityMongo = Omit<IBaseEntity<string>, 'id'> & { _id: string };
