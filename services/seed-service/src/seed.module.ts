import { Module } from '@nestjs/common';
import { CommonModule } from '@fdgn/common';
import { TypeOrmSQLModule } from '@fdgn/typeorm';
import { RabbitMQCsModule } from '@fdgn/rabbitmq';
import { RedisClientModule } from '@fdgn/redis';
import { MongoDBModule } from '@fdgn/mongoose';

import { SeedController } from './seed.controller';

@Module({
  imports: [CommonModule, MongoDBModule, TypeOrmSQLModule, RedisClientModule, RabbitMQCsModule.register('abc')],
  controllers: [SeedController],
})
export class SeedModule {}
