import { Client } from '@fdgn/client-core';
import { RedisClientType } from 'redis';
import { RedisClientConfig } from './redis.config';

export interface RedisClient extends Client<RedisClientConfig, RedisClientType> {
  getCachedValue<T>(
    key: string,
    valueCallback: () => Promise<T>,
    config?: { namespace?: string; expiry?: number },
    conId?,
  ): Promise<T>;

  getSortedSet(
    namespace: string,
    withScore: boolean,
    conId?: string,
  ): Promise<string[] | { value: string; score: number }[]>;

  getScoreSortedSet(namespace: string, members: string[], conId?: string): Promise<number[]>;

  getSortedSetSize(namespace: string, conId?: string): Promise<number>;
}
