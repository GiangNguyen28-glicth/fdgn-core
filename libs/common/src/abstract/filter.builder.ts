import { OperatorQuery, SortOrder } from '../consts';

export abstract class FilterBuilder<T> {
  abstract setFilterItem(key: keyof T, query: OperatorQuery, value: unknown, ...args): this;
  abstract setSortItem(key: keyof T, value: SortOrder): this;
  abstract buildQuery(): unknown;
}
