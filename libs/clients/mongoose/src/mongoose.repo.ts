import { IInsert, IUpdateOptions } from '@fdgn/common';
import { ClientSession, Document, Model, PopulateOptions, QueryOptions, SaveOptions, Types } from 'mongoose';
import { IBaseCurdMongo, IOptionsFindAllMongo, IOptionsFindOneMongo } from './common';

export abstract class MongoRepo<T> implements IBaseCurdMongo<T, Model<T>> {
  constructor(protected readonly model: Model<T>) {}

  getRepo(): Model<T> {
    return this.model;
  }

  async findAllAndCount(options?: IOptionsFindAllMongo<T>): Promise<[data: T[], count: number]> {
    return await Promise.all([this.findAll(options), this.count(options)]);
  }

  async findAll(options: IOptionsFindAllMongo<T>): Promise<T[]> {
    if (!options) {
      return await this.model.find().lean();
    }
    const { filters, sort_options, fields, pagination, populates } = options;
    const result = await this.model
      .find(filters)
      .populate(populates)
      .skip((pagination?.page - 1) * pagination?.size)
      .limit(pagination?.size)
      .sort(sort_options)
      .select(fields as string[])
      .lean();
    return result as T[];
  }

  getModel() {
    return this.model;
  }

  async findOne(options: IOptionsFindOneMongo<T>): Promise<T> {
    const { filters, populates, fields } = options;
    const doc = await this.model
      .findOne(filters)
      .populate(populates)
      .select(fields as string[]);
    return doc as T;
  }

  async count(options?: IOptionsFindAllMongo<T>): Promise<number> {
    return await this.model.countDocuments(options?.filters);
  }

  async insert(options: IInsert<T>): Promise<T> {
    const { entity } = options;
    const createdDocument: Document = new this.model({
      ...entity,
      _id: new Types.ObjectId(),
    });
    return createdDocument as T;
  }

  async save(options: IInsert<T>): Promise<T> {
    const { entity, session } = options;
    return (await (entity as unknown as Document).save({ session: session as ClientSession })) as T;
  }

  toJSON(doc: T): T {
    return (doc as Document).toJSON();
  }

  async findOneAndUpdate(options: IUpdateOptions<T>): Promise<T> {
    const { entity, filters, session } = options;
    const otps: QueryOptions = {
      lean: true,
      new: true,
    };
    if (session) {
      otps.session = session as ClientSession;
    }
    return (await this.model.findOneAndUpdate(filters, entity, otps)) as T;
  }

  async distinct(options: IOptionsFindAllMongo<T>, field: keyof T) {
    if (!field) {
      throw new Error('Missing field in select distinct');
    }
    return await this.model.find(options?.filters).distinct(field.toString());
  }

  async upsert(options: IUpdateOptions<T>) {
    const { entity, filters, session } = options;
    const otps: QueryOptions = {
      lean: true,
      new: true,
      upsert: true,
    };
    if (session) {
      otps.session = session as ClientSession;
    }
    return this.model.findOneAndUpdate(filters, entity, otps) as T;
  }

  async update(options: IInsert<T>): Promise<T> {
    const { entity, session } = options;
    const modelUpdated = new this.model(entity);
    const otps: SaveOptions = {};
    if (session) {
      otps.session = session as ClientSession;
    }
    return (await modelUpdated.save(otps)) as T;
  }

  async populate(document: Document, populate: PopulateOptions[]): Promise<T> {
    return document.populate(populate);
  }

  async bulkWrite(writes: any[]): Promise<void> {
    await this.model.bulkWrite(writes);
  }

  async findAndUpdate(options: IUpdateOptions<T>): Promise<T[]> {
    const { filters, entity, session } = options;
    const otps: QueryOptions = {};
    if (session) {
      options.session = session as ClientSession;
    }
    return await this.model.updateMany(filters, entity, otps).lean();
  }

  async findAndDelete(options?: IOptionsFindAllMongo<T>): Promise<void> {
    await this.model.deleteMany(options?.filters);
  }
}
