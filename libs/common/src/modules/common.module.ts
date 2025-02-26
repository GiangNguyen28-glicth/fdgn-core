import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { config } from '../config';
import { LogModule } from './log.module';
import { HealthRest } from '../http';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    LogModule
  ],
  controllers: [HealthRest]
})
export class CommonModule {}
