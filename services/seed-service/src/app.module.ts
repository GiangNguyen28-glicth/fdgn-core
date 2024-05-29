import { Module } from '@nestjs/common';

import { CommonModule, LogModule, MetricModule } from '@fdgn/common';

import { HeroModule } from './hero/hero.module';
import { ProductModule } from './product/product.module';
import { SeedModule } from './seed.module';

@Module({
  imports: [CommonModule, MetricModule, LogModule, SeedModule, HeroModule, ProductModule],
})
export class AppModule {}
