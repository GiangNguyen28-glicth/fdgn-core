import { Injectable } from '@nestjs/common';
import { InjectMetric, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { isNil } from 'lodash';
import { Counter } from 'prom-client';

import { DEFAULT_CON_ID } from '@fdgn/client-core';

import { RedisGetStatus, RedisSetStatus, RedisTrackingStatus } from './constance';
import { IRedisGet } from './interfaces';

export const REDIS_TRACKING_SET_STATUS = 'redis_tracking_set_status';
export const REDIS_TRACKING_GET_STATUS = 'redis_tracking_get_status';
export const TRACK_STATUS_REDIS_METRIC = 'track_status_redis_metric';

export const RedisTrackingSetStatus = makeCounterProvider({
  name: REDIS_TRACKING_SET_STATUS,
  help: 'redis tracking set status',
  labelNames: ['status', 'namespace', 'conId'],
});

export const RedisTrackingGetStatus = makeCounterProvider({
  name: REDIS_TRACKING_GET_STATUS,
  help: 'redis tracking get status',
  labelNames: ['status', 'namespace', 'conId'],
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
    conId: string = DEFAULT_CON_ID,
  ) {
    this.trackMetric.inc({ type, status, namespace, conId });
  }
}

export function GetRedisMetric() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: IRedisGet[]) {
      const redisMetricService: RedisClientMetric = this.redisClientMetric;
      const value = await originalMethod.apply(this, args);
      const { conId = DEFAULT_CON_ID, namespace } = args[0];
      if (isNil(value)) {
        redisMetricService.track('GET', RedisGetStatus.MISS, namespace, conId);
        return value;
      }
      redisMetricService.track('GET', RedisGetStatus.HIT, namespace, conId);
      return value;
    };
  };
}
