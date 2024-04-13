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
export type UNITS_OF_TIME = 'seconds' | 'minutes' | 'hours' | 'milliseconds';
export type SortOrder = -1 | 1 | 'asc' | 'desc';
export type SortQuery = { [key: string]: SortOrder };
