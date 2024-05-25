export interface IEntity {
  id?: string | number;
  _id?: string;
}

export interface IDateTracking {
  created_at?: Date;
  updated_at?: Date;
}

export interface IUserTracking {
  created_by?: number;
  updated_by?: number;
}

export interface ISoftDelete {
  is_deleted?: boolean;
  deleted_at?: Date;
}

export interface IAuditable extends IDateTracking, IUserTracking, ISoftDelete, IEntity {
  _id: string;
}

export interface IBaseEntity extends ISoftDelete, IDateTracking, IEntity {}
