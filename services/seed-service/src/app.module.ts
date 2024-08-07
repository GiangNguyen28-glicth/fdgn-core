import { Module } from '@nestjs/common';

import { CommonModule, HttpClientModule, LogModule, MetricModule, ThrottlerClientModule } from '@fdgn/common';
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
    HttpClientModule,
    ThrottlerClientModule,
  ],
})
export class AppModule {}
