import { Repository } from 'typeorm';
import { IBaseCurdTypeOrm } from '@fdgn/typeorm';
import { Job } from '../repo';
export interface IJobRepo extends IBaseCurdTypeOrm<Job, Repository<Job>> {
  getDependJob(types: string[], date: string): Promise<Job[]>;
  getCurrentJob(type: string, ids: string[]): Promise<Job[]>;
  batchUpsert(jobs: Job[]): Promise<void>;
}
