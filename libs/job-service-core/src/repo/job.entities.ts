import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryColumn } from 'typeorm';

import { IDateTracking } from '@fdgn/common';
import { JobStatus } from '../common';

@Entity({ name: 'jobs' })
export class Job implements IDateTracking {
  @PrimaryColumn()
  id: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  date: string;

  @Column({ default: JobStatus.TODO })
  status: JobStatus;

  @Column({ type: 'date' })
  started_at: Date;

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @Column({ type: 'text' })
  data: any;
}
