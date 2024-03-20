import { Module } from '@nestjs/common';
import { LogModule } from '@fdgn/common';

import { CommonModule } from '@fdgn/common';
import { RabbitMQModule } from '@fdgn/rabbitmq';
import { SeedModule } from './seed.module';

@Module({
  imports: [CommonModule, RabbitMQModule, LogModule, SeedModule],
})
export class AppModule {}
