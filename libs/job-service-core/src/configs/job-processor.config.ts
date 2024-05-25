import { toInt } from '@fdgn/common';

export class JobProcessorConfig {
  batchSize: number;
  concurrent: number;
  constructor(props: Partial<JobProcessorConfig>) {
    this.batchSize = toInt(props.batchSize);
    this.concurrent = toInt(props.concurrent);
  }
}
