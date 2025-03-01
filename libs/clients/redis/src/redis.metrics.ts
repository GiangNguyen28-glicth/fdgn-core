import { Injectable } from '@nestjs/common';
import { InjectMetric, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { isNil } from 'lodash';
import { Counter } from 'prom-client';

import { DEFAULT_CON_ID } from '@fdgn/common';

import { RedisGetStatus, RedisSetStatus, RedisTrackingStatus } from './constants';
import { IRedisGet } from './interfaces';

export const REDIS_TRACKING_SET_STATUS = 'redis_tracking_set_status';
export const REDIS_TRACKING_GET_STATUS = 'redis_tracking_get_status';
export const TRACK_STATUS_REDIS_METRIC = 'track_status_redis_metric';

export const RedisTrackingSetStatus = makeCounterProvider({
  name: REDIS_TRACKING_SET_STATUS,
  help: 'redis tracking set status',
  labelNames: ['status', 'namespace', 'con_id'],
});

export const RedisTrackingGetStatus = makeCounterProvider({
  name: REDIS_TRACKING_GET_STATUS,
  help: 'redis tracking get status',
  labelNames: ['status', 'namespace', 'con_id'],
});

export const Metrics = [RedisTrackingGetStatus, RedisTrackingSetStatus];

@Injectable()
export class RedisClientMetric {
  constructor(
    @InjectMetric(TRACK_STATUS_REDIS_METRIC)
    private trackMetric: Counter<string>,
  ) {}

  track(
    type: RedisTrackingStatus,
    status: RedisGetStatus | RedisSetStatus,
    namespace: string,
    con_id: string = DEFAULT_CON_ID,
  ) {
    this.trackMetric.inc({ type, status, namespace, con_id });
  }
}

export function GetRedisMetric() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: IRedisGet[]) {
      const redisMetricService: RedisClientMetric = this.redisClientMetric;
      const value = await originalMethod.apply(this, args);
      const { con_id = DEFAULT_CON_ID, namespace } = args[0];
      if (isNil(value)) {
        redisMetricService.track('GET', RedisGetStatus.MISS, namespace, con_id);
        return value;
      }
      redisMetricService.track('GET', RedisGetStatus.HIT, namespace, con_id);
      return value;
    };
  };
}
