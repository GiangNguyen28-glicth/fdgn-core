import { DBS_TYPE } from '../consts';
import { FilterMongoBuilder } from './mongoose';
import { FilterTypeOrmBuilder } from './type-orm';

type FilterInstance<T> = FilterMongoBuilder<T> | FilterTypeOrmBuilder<T>;
export class FilterBuilder<T> {
  private filterInstance: FilterInstance<T> = null;
  getInstance(dbs: DBS_TYPE): FilterInstance<T> {
    if (this.filterInstance) {
      return this.filterInstance;
    }
    switch (dbs) {
      case DBS_TYPE.TYPE_ORM:
        this.filterInstance = new FilterTypeOrmBuilder<T>();
        break;
      case DBS_TYPE.MONGO:
        this.filterInstance = new FilterMongoBuilder<T>();
        break;
      default:
        throw new Error(`This dbs type ${dbs} undefined`);
    }
    return this.filterInstance;
  }
}
