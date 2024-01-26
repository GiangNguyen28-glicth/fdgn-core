import { SortOrder } from 'mongoose';
import { LessThan, MoreThan, Equal, Not, Like, Between, In, Any, IsNull } from 'typeorm';
import { isEmpty, isNil } from 'lodash';
import { toKeyword } from './utils';
import { DBS_TYPE, OperatorQuery, SortQuery } from '../consts';
const typeOrmOperatorMapper = (operatorItem: OperatorQuery, key: string, value: any) => {
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
};
export class FilterBuilder<T> {
  private dbsType: DBS_TYPE;
  private queryFilter: Object;
  private sortOption: SortQuery = {};

  constructor(dbsType: DBS_TYPE) {
    this.dbsType = dbsType;
    this.queryFilter = this.initQueryFilter();
  }

  initQueryFilter(): Object {
    switch (this.dbsType) {
      case 'DBS_MONGO':
        return { $and: [] };
      case 'DBS_TYPE_ORM':
        return { where: {} };
      default:
        throw new Error(`This ${this.dbsType} not supported !!!`);
    }
  }

  setFilterItem(key: keyof T, query: OperatorQuery, value: any, isNull = false): this {
    if (!value && !isNull) return this;
    switch (this.dbsType) {
      case 'DBS_MONGO':
        return this.setFilterItemMongo(key, query, value);
      case 'DBS_TYPE_ORM':
        return this.setFilterItemTypeOrm(key, query, value);
    }
  }

  setFilterItemMongo(key: keyof T, query: OperatorQuery, value: any): this {
    const subQuery = {
      [key]: { [query]: value },
    };
    this.queryFilter['$and'].push(subQuery);
    return this;
  }

  setFilterItemTypeOrm(key: keyof T, query: OperatorQuery, value: any): this {
    Object.assign(this.queryFilter['where'], this.typeOrmOperatorMapper(key, query, value));
    return this;
  }

  setFilterItemWithObject(key: string, query: any) {
    const subQuery = {
      [key]: query,
    };
    this.queryFilter['$and'].push(subQuery);
    return this;
  }

  addName(name: string) {
    if (isNil(name) || isEmpty(name)) {
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
