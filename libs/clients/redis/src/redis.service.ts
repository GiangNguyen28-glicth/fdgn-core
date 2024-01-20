import { Injectable } from '@nestjs/common';
import { AbstractClientService } from '@fdgn/client-core';

import { RedisClientConfig } from './redis.config';
import { RedisClientType } from 'redis';
import { RedisClient } from './redis.client';

@Injectable()
export class RedisClientService
  extends AbstractClientService<RedisClientConfig, RedisClientType>
  implements RedisClient
{
  constructor() {
    super('redis', RedisClientConfig);
  }
  getCachedValue<T>(
    key: string,
    valueCallback: () => Promise<T>,
    config?: { namespace?: string; expiry?: number },
    conId?: any,
  ): Promise<T> {
    throw new Error('Method not implemented.');
  }
  getSortedSet(
    namespace: string,
    withScore: boolean,
    conId?: string,
  ): Promise<string[] | { value: string; score: number }[]> {
    throw new Error('Method not implemented.');
  }
  getScoreSortedSet(namespace: string, members: string[], conId?: string): Promise<number[]> {
    throw new Error('Method not implemented.');
  }
  getSortedSetSize(namespace: string, conId?: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
