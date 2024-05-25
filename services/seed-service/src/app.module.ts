import { Module } from '@nestjs/common';

import { CommonModule, LogModule } from '@fdgn/common';
import { RabbitMQModule } from '@fdgn/rabbitmq';

import { SeedModule } from './seed.module';
import { HeroModule } from './hero/hero.module';

@Module({
  imports: [CommonModule, LogModule, SeedModule, HeroModule],
})
export class AppModule {}
