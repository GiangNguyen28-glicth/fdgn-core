import { OperatorQuery, SortOrder, SortQuery } from '../constants';

export abstract class FilterBuilder<T = any> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  protected query_filters: Object = {};
  protected sort_options: SortQuery = {};
  abstract setFilterItem(key: keyof T, query: OperatorQuery, value: unknown, ...args:any[]): this;
  abstract setSortItem(key: keyof T, value: SortOrder): this;
  abstract buildQuery(): unknown;
}
