import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FilterTypeOrmBuilder, TypeOrmRepo, TypeOrmService } from '@fdgn/typeorm';

import { JobStatus, REPO } from '../common';
import { IJobRepo } from '../interfaces';
import { Job } from './job.entities';

export class JobRepo extends TypeOrmRepo<Job> implements IJobRepo {
  constructor(
    @InjectRepository(Job)
    protected jobRepo: Repository<Job>,
    private typeOrmService: TypeOrmService,
  ) {
    super(jobRepo);
  }

  async getDependJob(types: string[], date: string): Promise<Job[]> {
    if (!types.length) {
      return [];
    }
    const { filters, sorts } = new FilterTypeOrmBuilder<Job>()
      .setFilterItem('type', '$in', types)
      .setFilterItem('status', '$ne', JobStatus.DONE)
      .setFilterItem('date', '$eq', date)
      .setSortItem('date', 'asc')
      .setSortItem('id', 'asc')
      .buildQuery();
    return await this.findAll({ filters, sort_options: sorts });
  }

  async getCurrentJob(type: string, ids: string[]): Promise<Job[]> {
    const { filters, sorts } = new FilterTypeOrmBuilder<Job>()
      .setFilterItem('type', '$eq', type)
      .setFilterItem('id', '$in', ids)
      .setSortItem('date', 'asc')
      .buildQuery();
    return await this.findAll({ filters, sort_options: sorts });
  }

  async batchUpsert(jobs: Job[]): Promise<void> {
    const query_runner = await this.typeOrmService.getConnection();
    try {
      await this.jobRepo.upsert(jobs, { conflictPaths: ['id'] });
      await query_runner.commitTransaction();
    } catch (error) {
      console.log(error);
      await query_runner.rollbackTransaction();
    } finally {
      await query_runner.release();
    }
  }
}

export const JobRepoProvider = {
  provide: REPO.JOB,
  useClass: JobRepo,
};
