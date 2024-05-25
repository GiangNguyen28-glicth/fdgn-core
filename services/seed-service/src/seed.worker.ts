import { Injectable } from '@nestjs/common';

import { JobStatus, JobWorker } from '@fdgn/job-service-core';
import { SeedJob } from './seed.job';
import { SeedJobConfig } from './seed-job.config';

const CONFIG_KEY = 'seedJob';

@Injectable()
export class SeedWorker extends JobWorker<SeedJob> {
  private seedJobConfig: SeedJobConfig;
  private get jobConfig(): SeedJobConfig {
    if (this.seedJobConfig) {
      return this.seedJobConfig;
    }
    this.seedJobConfig = new SeedJobConfig(this.configService.get(CONFIG_KEY) as any);
    return this.seedJobConfig;
  }
  constructor() {
    super(SeedWorker.name, CONFIG_KEY);
  }
  async process(job: SeedJob): Promise<SeedJob> {
    console.log('Job:', job);
    job.status = JobStatus.DONE;
    return job;
  }
}
