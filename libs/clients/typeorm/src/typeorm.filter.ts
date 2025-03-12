import { Any, Between, Equal, In, IsNull, LessThan, Like, MoreThan, Not } from 'typeorm';

import { FilterBuilder, isNullOrEmpty, OperatorQuery, SortOrder } from '@fdgn/common';

export class FilterTypeOrmBuilder<T> extends FilterBuilder<T> {
  setFilterItem(key: keyof T, query: OperatorQuery, value: any, isNull = false): this {
    if (isNullOrEmpty(value) && !isNull) return this;
    Object.assign(this.query_filters, this.typeOrmOperatorMapper(key, query, value));
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

  private typeOrmOperatorMapper(key: keyof T, operatorItem: OperatorQuery, value: any) {
    const operators = {
      $lte: LessThan(value),
      $gte: MoreThan(value),
      $eq: Equal(value),
      $ne: Not(Equal(value)),
      $like: Like(`%${value}%`),
      $nlike: Not(Like(`%${value}%`)),
      $between: Between(value.fromDate, value.toDate),
      $nbetween: Not(Between(value.fromDate, value.toDate)),
      $in: In(value),
      $any: Any(value),
      $nin: Not(In(value)),
      $isnil: IsNull(),
      $isnotnil: Not(IsNull()),
    };
    return { [key]: operators[operatorItem] };
  }

  buildQuery() {
    const query = { filters: this.query_filters, sorts: this.sort_options };
    return query;
  }
}
