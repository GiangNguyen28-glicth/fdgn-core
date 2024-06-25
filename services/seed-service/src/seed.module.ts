import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ElasticSearchModule } from '@fdgn/elasticsearch';
import { RabbitMQService } from '@fdgn/rabbitmq';

import { ClientCoreModule } from '@fdgn/client-core';
import { HttpModule, ThrottlerClientModule } from '@fdgn/common';

import { SeedController } from './seed.controller';
import { Seed, SeedRepoProvider, SeedSchema } from './entities/seed.schema';
import { SeedConsumer } from './seed.consumer';

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
    SeedConsumer,
    // SeedWorker,
  ],
})
export class SeedModule {}
