import { Module } from '@nestjs/common';

import { CommonModule, HttpClientModule, HttpClientService, MetricModule, ThrottlerClientModule } from '@fdgn/common';
import { MongoDBModule } from '@fdgn/mongoose';
import { RabbitMQModule } from '@fdgn/rabbitmq';
import { KafkaClientModule } from '@fdgn/kafka';

import { HeroModule } from './hero/hero.module';
import { ProductModule } from './product/product.module';
import { SeedModule } from './seed.module';
import { RedisClientModule } from '@fdgn/redis';


@Module({
  imports: [
    CommonModule,
    // HttpClientModule,
    MetricModule,
    SeedModule,
    // HeroModule,
    // MongoDBModule,
    // HttpClientModule,
    // ThrottlerClientModule,
  ],
})
export class AppModule {}
