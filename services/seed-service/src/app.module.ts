import { Module } from '@nestjs/common';

import { CommonModule, LogModule, MetricModule } from '@fdgn/common';
import { MongoDBModule } from '@fdgn/mongoose';
import { RabbitMQModule } from '@fdgn/rabbitmq';

import { HeroModule } from './hero/hero.module';
import { ProductModule } from './product/product.module';
import { SeedModule } from './seed.module';

@Module({
  imports: [
    CommonModule,
    MetricModule,
    RabbitMQModule,
    LogModule,
    SeedModule,
    HeroModule,
    ProductModule,
    MongoDBModule,
  ],
})
export class AppModule {}
