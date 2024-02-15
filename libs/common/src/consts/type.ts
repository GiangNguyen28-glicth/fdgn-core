import { SortOrder } from 'mongoose';
export type OperatorQuery =
  | '$eq'
  | '$gte'
  | '$lte'
  | '$in'
  | '$nin'
  | '$elemMatch'
  | '$exists'
  | '$ne'
  | '$all'
  | '$gt';
export type SortQuery = { [key: string]: SortOrder };
export type UNITS_OF_TIME = 'seconds' | 'minutes' | 'hours' | 'milliseconds';