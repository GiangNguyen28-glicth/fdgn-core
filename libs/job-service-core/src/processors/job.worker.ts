import { Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isString, isArray, flatten } from 'lodash';
import * as moment from 'moment-timezone';

import { ASIA_HCM_TZ, DATE_FORMAT, sleep } from '@fdgn/common';

import { JobStatus, REPO } from '../common';
import { JobWorkerConfig } from '../configs';
import { IJobRepo } from '../interfaces';
import { Job } from '../repo';
import { JobQueue } from './job.queue';

export abstract class JobWorker<J extends Job> implements OnModuleInit {
  @Inject() protected configService: ConfigService;
  @Inject(REPO.JOB) private jobRepo: IJobRepo;
  private config: JobWorkerConfig;
  private job_queue: JobQueue<Job>;
  private tracking_count = {};

  protected constructor(private context: string, private config_key: string) {}

  abstract process(job: J): Promise<J>;

  async onModuleInit() {
    if (!this.getConfig().enable) {
      console.log(`${this.context} has been disable`);
      return;
    }
    this.initJobQueue();
    await this.initJobs();
  }

  protected getConfig() {
    if (this.config) return this.config;
    this.config = new JobWorkerConfig(this.configService.get<JobWorkerConfig>(this.config_key as any));
    console.log('Config %s', JSON.stringify(this.config, null, 2));
    return this.config;
  }

  protected async isCanProcess(job: J): Promise<boolean> {
    if (!this.config.dependsOn) {
      return true;
    }
    const depends_on: string[] = [];
    if (isString(this.config.dependsOn)) depends_on.push(this.config.dependsOn);
    if (isArray(this.config.dependsOn)) depends_on.push(...this.config.dependsOn);
    const running_jobs: Job[] = await this.jobRepo.getDependJob(depends_on, job.date);
    const can_process = running_jobs.length === 0;

    if (!can_process) {
      const msg = `Unable to continue running job [%s]. This job will be restart after %s second(s)!`;
      const timeout = this.config.resetTimeout / 1000;
      console.warn(msg, job.id, timeout);
    }

    return can_process;
  }

  protected createNewJobs(date: string): J[] {
    return [
      {
        id: `${this.getConfig().type}-${date}`,
        type: this.getConfig().type,
        date: date,
        status: JobStatus.TODO,
        started_at: new Date(),
        data: {},
      } as J,
    ];
  }

  protected async initJobs(): Promise<void> {
    const date_range = moment().tz(ASIA_HCM_TZ).format(DATE_FORMAT.DEFAULT);
    await this.pushJobs(date_range);
    await this.job_queue.drain();
    process.exit(0);
  }

  protected async pushJobs(...dates: string[]) {
    const new_jobs = flatten(await Promise.all(dates.map(date => this.createNewJobs(date))));
    const current_jobs = await this.jobRepo.getCurrentJob(
      this.getConfig().type,
      new_jobs.map(j => j.id),
    );
    for (const job of new_jobs) {
      const current_job = current_jobs.find(j => j.id === job.id);
      if (current_job && !this.config.startFromScratch) {
        Object.assign(job, current_job);
      }
    }

    const run_jobs = new_jobs.filter(j => j.status != JobStatus.DONE).sort(j => moment(j.date).unix());
    await this.jobRepo.batchUpsert(new_jobs);
    if (!run_jobs.length) {
      console.log('All jobs are done');
      process.exit(0);
    }
    this.job_queue.push(run_jobs);
  }

  protected async onJobStart(job: J): Promise<void> {
    return;
  }

  protected async onJobUpdate(job: J): Promise<void> {
    return;
  }

  protected async onJobDone(job: J): Promise<void> {
    return;
  }

  protected async reset(job: J): Promise<J> {
    return job;
  }

  private initJobQueue() {
    this.job_queue = new JobQueue<J>(
      {
        consume: ([job]) => this.processJob(job),
        concurrent: this.getConfig().concurrent,
        batch_size: 1,
      },
      `${this.context}JobQueue`,
    );
  }

  private async processJob(job: J): Promise<void> {
    const can_process = await this.isCanProcess(job);
    const next_job: J = can_process ? await this.process(job) : await this.reset(job);
    if (!can_process) {
      await sleep(this.config.resetTimeout);
    }

    await this.processOnJobStartHook(job);
    await this.processOnJobUpdateHook(job);

    if (next_job.status == JobStatus.DONE) {
      await this.processOnJobDoneHook(next_job);
      return;
    }

    console.log('Next job %j will be processed', job);
    this.job_queue.unshift(next_job);
  }

  private async processOnJobStartHook(job: J) {
    if (job.status == JobStatus.TODO) {
      job.started_at = new Date();
      console.log('Job %s - %s is started at %s', job.type, job.date, job.started_at);
      job.status = JobStatus.IN_PROGRESS;
      await this.onJobStart(job);
    }
  }

  private async processOnJobUpdateHook(job: J) {
    this.tracking_count[job.id] = this.tracking_count[job.id] ? this.tracking_count[job.id] + 1 : 1;
    if (this.tracking_count[job.id] >= this.config.trackingThreshold || job.status == JobStatus.DONE) {
      await this.onJobUpdate(job);
      await this.jobRepo.save({ entity: job });
      delete this.tracking_count[job.id];
    }
  }

  private async processOnJobDoneHook(job: J) {
    if (job.status === JobStatus.DONE) {
      await this.onJobDone(job);
      console.log(
        'Job %j sis completed in %s mins',
        job,
        ((job.updated_at.getTime() - job.started_at.getTime()) / 1000 / 60).toFixed(2),
      );
    }
  }
}
