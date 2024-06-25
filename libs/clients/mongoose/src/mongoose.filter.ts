import { SortQuery, OperatorQuery, toKeyword, SortOrder, FilterBuilder, isNullOrEmpty } from '@fdgn/common';

export class FilterMongoBuilder<T> extends FilterBuilder<T> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  private query_filters: Object = { $and: [] };
  private sort_options: SortQuery = {};

  setFilterItem(key: keyof T, query: OperatorQuery, value: any, isNull = false): this {
    if (!value && !isNull) return this;
    const subQuery = {
      [key]: { [query]: value },
    };
    this.query_filters['$and'].push(subQuery);
    return this;
  }

  setFilterItemWithObject(key: string, query: any) {
    const subQuery = {
      [key]: query,
    };
    this.query_filters['$and'].push(subQuery);
    return this;
  }

  addName(name: string) {
    if (isNullOrEmpty(name)) {
      return this;
    }
    this.setFilterItemWithObject('keyword', {
      $regex: `${toKeyword(name.toLowerCase().trim())}`,
      $options: 'i',
    });
    return this;
  }

  setSortItem(key: keyof T, value: SortOrder) {
    if (!value) {
      return this;
    }
    this.sort_options[key as any] = value;
    return this;
  }

  setSortWithObject(key: string, value: SortOrder) {
    if (!value) {
      return this;
    }
    this.sort_options[key as any] = value;
    return this;
  }

  buildQuery() {
    if (!this.query_filters?.['$and'].length) return { filters: {}, sorts: this.sort_options };
    return { filters: this.query_filters, sorts: this.sort_options };
  }
}
