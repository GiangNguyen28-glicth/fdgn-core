import { IOptionsFindAll, IOptionsFindOne } from '@fdgn/common';

export interface IOptionsFindAllTypeOrm<T> extends IOptionsFindAll<T> {
  relations?: string[];
}

export interface IOptionsFindOneTypeOrm<T> extends IOptionsFindOne<T> {
  relations?: string[];
}
