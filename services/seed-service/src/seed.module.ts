import { CommonModule, Module } from '@fdgn/common';
import { TypeOrmSQLModule } from '@fdgn/typeorm';

import { SeedController } from './seed.controller';

@Module({
  imports: [CommonModule, TypeOrmSQLModule],
  controllers: [SeedController],
})
export class SeedModule {}
