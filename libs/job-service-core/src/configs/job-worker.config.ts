import { toBool, toInt } from '@fdgn/common';

export class JobWorkerConfig {
  type = '';
  enable = false;
  concurrent = 1;
  dependsOn?: string | string[];
  startFromScratch = false;
  resetTimeout: number;
  trackingThreshold: number;

  constructor(props: Partial<JobWorkerConfig>) {
    this.type = props.type;
    this.enable = toBool(props.enable);
    this.concurrent = toInt(props.concurrent);
    this.dependsOn = props.dependsOn;
    this.startFromScratch = toBool(props.startFromScratch);
    this.resetTimeout = toInt(props.resetTimeout);
    this.trackingThreshold = toInt(props.trackingThreshold);
  }
}
