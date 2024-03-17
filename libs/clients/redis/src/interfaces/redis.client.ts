import { RedisClientType } from 'redis';

import { Client } from '@fdgn/client-core';

import { RedisClientConfig } from '../redis.config';

export interface IRedisCommon {
  namespace?: string;
  conId?: string;
}

export interface IRedisGet extends IRedisCommon {
  key: string;
}

export interface IRedisSet extends IRedisCommon {
  key: string;
  value: string;
  ttl?: number;
}

export interface IRedisDel extends IRedisCommon {
  keys: string | string[];
}

export interface RedisClient extends Client<RedisClientConfig, RedisClientType> {
  set(p: IRedisSet): Promise<void>;

  get<T>(p: IRedisGet): Promise<T>;

  del(p: IRedisDel): Promise<number>;

  delNamespace(namespace: string): Promise<void>;
}
