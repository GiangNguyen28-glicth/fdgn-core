/* eslint-disable @typescript-eslint/no-empty-interface */
import { Schema, Prop, InjectModel, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBaseCurdMongo, MongoRepo } from '@fdgn/mongoose';
@Schema()
export class Seed {
  _id: string;

  @Prop({ default: 0 })
  price: number;

  @Prop()
  name: string;
}

export interface ISeedRepo extends IBaseCurdMongo<Seed, Model<Seed>> {}

export class SeedRepo extends MongoRepo<Seed> {
  constructor(
    @InjectModel(Seed.name)
    seedRepo: Model<Seed>,
  ) {
    super(seedRepo);
  }
}
export const SeedRepoProvider = {
  provide: SeedRepo.name,
  useClass: SeedRepo,
};

export const SeedSchema = SchemaFactory.createForClass(Seed);
