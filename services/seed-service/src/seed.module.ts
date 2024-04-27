import { Module } from '@nestjs/common';
import { CommonModule, ThrottlerClientModule, LogModule } from '@fdgn/common';
import { ClientCoreModule } from '@fdgn/client-core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { ClientsModule } from '@nestjs/microservices';

import { RabbitMQClientModule, RabbitMQModule, RabbitMQService } from '@fdgn/rabbitmq';
import { RedisClientModule } from '@fdgn/redis';
import { MongoDBModule } from '@fdgn/mongoose';

import { SeedController } from './seed.controller';
import { Product, ProductRepo, ProductRepoProvider } from './entities';
import { SeedConsumer } from './seed.consumer';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ClientCoreModule,
    ThrottlerClientModule,
    LogModule,
    TypeOrmModule.forFeature([Product]),
    MongoDBModule,
    // PrometheusModule.register({ defaultMetrics: { enabled: true } }),
  ],
  controllers: [SeedController],
  providers: [
    ProductRepoProvider,
    // SeedService,
    // SeedConsumer,
  ],
})
export class SeedModule {}
