import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoDBModule } from '@fdgn/mongoose';
import { ClientCoreModule } from '@fdgn/client-core';
import { HttpModule, ThrottlerClientModule } from '@fdgn/common';

import { SeedController } from './seed.controller';
import { Seed, SeedRepoProvider, SeedSchema } from './entities/seed.schema';

@Module({
  imports: [
    ClientCoreModule,
    ThrottlerClientModule,
    HttpModule,
    MongooseModule.forFeature([{ name: Seed.name, schema: SeedSchema }]),
    // TypeOrmModule.forFeature([Product]),
  ],
  controllers: [SeedController],
  providers: [
    SeedRepoProvider,
    // ProductRepoProvider,
    // SeedService,
    // SeedConsumer,
    // SeedWorker,
  ],
})
export class SeedModule {}
