import { SortOrder } from 'mongoose';
import { Any, Between, Equal, In, IsNull, LessThan, Like, MoreThan, Not } from 'typeorm';

import { OperatorQuery, SortQuery } from '../consts';

export class FilterTypeOrmBuilder<T> {
  private queryFilter: Object = { where: {} };
  private sortOption: SortQuery = {};

  setFilterItem(key: keyof T, query: OperatorQuery, value: any, isNull = false): this {
    if (!value && !isNull) return this;
    Object.assign(this.queryFilter['where'], this.typeOrmOperatorMapper(key, query, value));
    return this;
  }

  setSortItem(key: keyof T, value: SortOrder) {
    if (!value) {
      return this;
    }
    this.sortOption[key as any] = value;
    return this;
  }

  setSortWithObject(key: string, value: SortOrder) {
    if (!value) {
      return this;
    }
    this.sortOption[key as any] = value;
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
    // if (!this.queryFilter?.$and?.length) return {{}, this.sortOption};
    return { filters: this.queryFilter, sorts: this.sortOption };
  }
}
