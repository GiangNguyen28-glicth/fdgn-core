import { Module, Global } from '@nestjs/common';
import { ClientCoreModule } from '@fdgn/client-core';
import { RedisClientService } from './redis.service';

@Global()
@Module({
  imports: [ClientCoreModule],
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
