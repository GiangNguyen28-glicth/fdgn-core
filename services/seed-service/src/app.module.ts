import { Module } from '@nestjs/common';

import { CommonModule, HttpClientModule, LogModule, MetricModule, ThrottlerClientModule } from '@fdgn/common';
import { MongoDBModule } from '@fdgn/mongoose';
import { RabbitMQModule } from '@fdgn/rabbitmq';
import { KafkaClientModule } from '@fdgn/kafka';

import { HeroModule } from './hero/hero.module';
import { ProductModule } from './product/product.module';
import { SeedModule } from './seed.module';

@Module({
  imports: [
    CommonModule,
    // MetricModule,
    // RabbitMQModule,
    LogModule,
    KafkaClientModule,

    SeedModule,
    // HeroModule,
    // MongoDBModule,
    // HttpClientModule,
    // ThrottlerClientModule,
  ],
})
export class AppModule {}
