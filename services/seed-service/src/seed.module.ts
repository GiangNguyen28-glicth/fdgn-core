import { ClientCoreModule } from '@fdgn/client-core';
import { HttpModule, ThrottlerClientModule } from '@fdgn/common';
import { Module } from '@nestjs/common';

import { RedisClientModule } from '@fdgn/redis';
import { SeedController } from './seed.controller';

@Module({
  imports: [
    ClientCoreModule,
    ThrottlerClientModule,
    HttpModule,
    // TypeOrmModule.forFeature([Product]),
    // MongoDBModule,
  ],
  controllers: [SeedController],
  providers: [
    // ProductRepoProvider,
    // SeedService,
    // SeedConsumer,
    // SeedWorker,
  ],
})
export class SeedModule {}
