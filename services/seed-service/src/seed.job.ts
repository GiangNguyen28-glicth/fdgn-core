import { Job } from '@fdgn/job-service-core';

export class SeedJob extends Job {
  data: {
    cursor: string;
  };
}
