import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@fdgn/common';
import { TypeOrmSQLModule } from '@fdgn/typeorm';

import { Job, JobRepoProvider } from './repo';

@Module({
  imports: [CommonModule, TypeOrmSQLModule, TypeOrmModule.forFeature([Job])],
  providers: [JobRepoProvider],
  exports: [JobRepoProvider],
})
export class JobModule {}
