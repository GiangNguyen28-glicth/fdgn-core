import { isEmpty, isNil } from 'lodash';
import { SortOrder } from 'mongoose';

import { OperatorQuery, SortQuery } from '../consts';
import { toKeyword } from '../utils';

export class FilterMongoBuilder<T> {
  private queryFilter: Object = { $and: [] };
  private sortOption: SortQuery = {};

  setFilterItem(key: keyof T, query: OperatorQuery, value: any, isNull = false): this {
    if (!value && !isNull) return this;
    const subQuery = {
      [key]: { [query]: value },
    };
    this.queryFilter['$and'].push(subQuery);
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

  buildQuery() {
    // if (!this.queryFilter?.$and?.length) return {{}, this.sortOption};
    return { filters: this.queryFilter, sorts: this.sortOption };
  }
}
