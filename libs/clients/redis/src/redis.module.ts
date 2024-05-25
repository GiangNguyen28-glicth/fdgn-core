import { ClientCoreModule } from '@fdgn/client-core';
import { Global, Module } from '@nestjs/common';
import { Metrics } from './redis.metrics';
import { RedisClientService } from './redis.service';

@Global()
@Module({
  imports: [ClientCoreModule],
  providers: [RedisClientService, ...Metrics],
  exports: [RedisClientService],
})
export class RedisClientModule {}
