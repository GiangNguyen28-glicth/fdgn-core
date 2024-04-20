import { ICrudRepo, IFilterFindAll, IFilterFindOne, IUpdateOptions } from '@fdgn/common';
import { ClientSession, Connection, Document, Model, PopulateOptions, QueryOptions, Types } from 'mongoose';

export abstract class MongoRepo<T> implements ICrudRepo<T> {
  constructor(protected readonly model: Model<T>, private readonly connection: Connection) {}

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

  async distinct(options: IFilterFindAll, field: keyof T) {
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

  async findAndUpdate(options: IUpdateOptions<T>): Promise<T[]> {
    const { filters, entity, session } = options;
    const otps: QueryOptions = {};
    if (session) {
      options.session = session as ClientSession;
    }
    return await this.model.updateMany(filters, entity, otps).lean();
  }

  async findAndDelete(options?: IFilterFindAll): Promise<void> {
    await this.model.deleteMany(options?.filters);
  }

  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  async getConnection<ClientSession>(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session as ClientSession;
  }
}
