import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SeedController } from './seed.controller';
import { Seed, SeedRepoProvider, SeedSchema } from './entities/seed.schema';
import { SeedConsumer } from './seed.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Seed.name, schema: SeedSchema }]),
  ],
  controllers: [SeedController],
  providers: [
    SeedRepoProvider,
    SeedConsumer
  ],
})
export class SeedModule {}
