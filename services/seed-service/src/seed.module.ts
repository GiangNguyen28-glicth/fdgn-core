import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Seed, SeedSchema } from './entities/seed.schema';
import { SeedKafkaConsumer } from './seed-kafka.consumer';
import { SeedController } from './seed.controller';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: Seed.name, schema: SeedSchema }]),
  ],
  controllers: [],
  providers: [
  ],
})
export class SeedModule {}
