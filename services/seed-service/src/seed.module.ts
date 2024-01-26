import { Module } from '@nestjs/common';
import { CommonModule, ThrottlerClientModule } from '@fdgn/common';
import { TypeOrmSQLModule } from '@fdgn/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RabbitMQCsModule } from '@fdgn/rabbitmq';
import { RedisClientModule } from '@fdgn/redis';
import { MongoDBModule } from '@fdgn/mongoose';

import { SeedController } from './seed.controller';
import { Product, ProductRepoProvider } from './entities/seed.entity';

@Module({
  imports: [CommonModule, ThrottlerClientModule, TypeOrmSQLModule, TypeOrmModule.forFeature([Product])],
  controllers: [SeedController],
  providers: [ProductRepoProvider],
})
export class SeedModule {}
