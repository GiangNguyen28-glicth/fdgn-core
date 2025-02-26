import { Global, Module } from '@nestjs/common';
import { CommonModule } from '@fdgn/common';

import { Metrics } from './redis.metrics';
import { RedisClientService } from './redis.service';

@Global()
@Module({
  imports: [CommonModule],
  providers: [RedisClientService, ...Metrics],
  exports: [RedisClientService],
})
export class RedisClientModule {}
