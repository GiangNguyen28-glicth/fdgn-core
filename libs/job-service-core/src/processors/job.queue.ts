import async, { QueueObject } from 'async';
import { Logger } from '@nestjs/common';

export class QueueConfig<T> {
  consume: (d: T[]) => Promise<void>;
  concurrent = 1;
  batch_size = 1;
  max_retries = 3;
  failed_idle_timeout = 15000;

  constructor(props: Partial<QueueConfig<T>>) {
    Object.assign(this, props);
  }
}

class QueueMessage<T> {
  retries = 0;
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}

export class JobQueue<T> {
  private queue: QueueObject<QueueMessage<T>>;
  private readonly logger = new Logger(JobQueue.name);
  private config: QueueConfig<T>;

  constructor(config: Partial<QueueConfig<T>>, private context?: string) {
    this.config = new QueueConfig<T>(config);
    this.init();
  }

  init(): void {
    this.queue = async.cargoQueue<QueueMessage<T>>(
      (messages: QueueMessage<T>[], callback) => {
        const startedAt = new Date().getTime();
        this.config
          .consume(messages.map(msg => msg.data))
          .then(_ => callback())
          .catch(err => {
            this.logger.error(
              `The message is processed, wait for ${this.config.failed_idle_timeout} to be re-processed`,
              err?.stack || err,
              this.context,
            );
            setTimeout(() => callback(err), this.config.failed_idle_timeout);
          })
          .finally(() =>
            this.logger.log(
              `${messages.length} messages is processed within ${(new Date().getTime() - startedAt) / 1000} secs`,
              this.context,
            ),
          );
      },
      this.config.concurrent,
      this.config.batch_size,
    );
  }

  push(data: T[]) {
    for (const d of data) {
      const msg = new QueueMessage(d);
      this._push(msg);
    }
  }

  unshift(d: T) {
    const msg = new QueueMessage(d);
    this._push(msg, true);
  }

  private _push(msg: QueueMessage<T>, priority = false) {
    const push = priority ? this.queue.unshift.bind(this.queue) : this.queue.push.bind(this.queue);
    push(msg, async err => {
      if (err) {
        msg.retries++;
        this._push(msg, true);
      }
    });
  }

  async drain(): Promise<void> {
    await this.queue.drain();
  }
}
