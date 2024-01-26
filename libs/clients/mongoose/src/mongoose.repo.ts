import { Document, FilterQuery, Model, PopulateOptions, Types } from 'mongoose';
import { IFilterFindAll, IFilterFindOne, ICrudRepo } from '@fdgn/common';

export abstract class MongoRepo<T> implements ICrudRepo<T> {
  constructor(protected readonly model: Model<T>) {}
  async findAll(options: IFilterFindAll): Promise<T[]> {
    if (!options) {
      return await this.model.find().lean();
    }
    const { filters, sortOption, fields, pagination, populates } = options;
    const result = await this.model
      .find(filters)
      .populate(populates)
      .skip((pagination?.page - 1) * pagination?.size)
      .limit(pagination?.size)
      .sort(sortOption)
      .select(fields)
      .lean();
    return result as T[];
  }

  getModel() {
    return this.model;
  }

  async findOne(options: IFilterFindOne): Promise<T> {
    const { filters, populates, fields } = options;
    const doc = await this.model.findOne(filters).populate(populates).select(fields);
    return doc as T;
  }

  async count(options?: IFilterFindAll): Promise<number> {
    return await this.model.countDocuments(options?.filters);
  }

  async insert(document: Partial<T>): Promise<T> {
    const createdDocument: Document = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return createdDocument as T;
  }

  async save(document: T): Promise<T> {
    return (await (document as Document).save()) as T;
  }

  toJSON(doc: T): T {
    return (doc as Document).toJSON();
  }

  async findOneAndUpdate(options: IFilterFindAll, entity: Partial<T>): Promise<T> {
    return (await this.model.findOneAndUpdate(options?.filters, entity, {
      lean: true,
      new: true,
    })) as T;
  }

  async distinct(options: IFilterFindAll, field: keyof T) {
    if (!field) {
      throw new Error('Missing field in select distinct');
    }
    return await this.model.find(options?.filters).distinct(field.toString());
  }

  async upsert(filterQuery: FilterQuery<T>, entity: Partial<T>) {
    return this.model.findOneAndUpdate(filterQuery, entity, {
      lean: true,
      upsert: true,
      new: true,
    }) as T;
  }

  async update(entity: Partial<T>): Promise<T> {
    const modelUpdated = new this.model(entity);
    return (await modelUpdated.save()) as T;
  }

  async populate(document: Document, populate: PopulateOptions[]): Promise<T> {
    return document.populate(populate);
  }

  async bulkWrite(writes: any[]): Promise<void> {
    await this.model.bulkWrite(writes);
  }

  async findAndUpdate(options: IFilterFindAll, entity: Partial<T>): Promise<T[]> {
    return await this.model.updateMany(options?.filters, entity).lean();
  }

  async findAndDelete(options?: IFilterFindAll): Promise<void> {
    await this.model.deleteMany(options?.filters);
  }
}
