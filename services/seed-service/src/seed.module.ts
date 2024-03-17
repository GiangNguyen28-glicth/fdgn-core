import { Module } from '@nestjs/common';
import { CommonModule, ThrottlerClientModule, LogModule } from '@fdgn/common';
import { TypeOrmSQLModule } from '@fdgn/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { ClientsModule } from '@nestjs/microservices';

import { RabbitMQClientModule, RabbitMQModule, RabbitMQService } from '@fdgn/rabbitmq';
import { RedisClientModule } from '@fdgn/redis';
import { MongoDBModule } from '@fdgn/mongoose';

import { SeedController } from './seed.controller';
import { Product, ProductRepoProvider } from './entities';
import { SeedConsumer } from './seed.consumer';
import { SeedService } from './seed.service';

@Module({
  imports: [
    CommonModule,
    ThrottlerClientModule,
    RabbitMQModule,
    LogModule,
    // PrometheusModule.register({ defaultMetrics: { enabled: true } }),
  ],
  controllers: [SeedController],
  providers: [
    SeedService,
    // SeedConsumer,
  ],
})
export class SeedModule {}
