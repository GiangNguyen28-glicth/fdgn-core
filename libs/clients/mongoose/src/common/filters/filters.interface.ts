import { PopulateOptions } from 'mongoose';
import { IOptionsFindAll, IOptionsFindOne } from '@fdgn/common';

export interface IOptionsFindAllMongo<T> extends IOptionsFindAll<T> {
  populates?: PopulateOptions[];
}

export interface IOptionsFindOneMongo<T> extends IOptionsFindOne<T> {
  populates?: PopulateOptions[];
}
