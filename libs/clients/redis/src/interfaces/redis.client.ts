import { RedisClientType } from 'redis';

import { Client } from '@fdgn/client-core';

import { RedisClientConfig } from '../redis.config';

export interface IRedisCommon {
  namespace?: string;
  con_id?: string;
}

export interface IRedisGet extends IRedisCommon {
  key: string;
  isJson?: boolean;
}

export interface IRedisSet extends IRedisCommon {
  key: string;
  value: string;
  ttl?: number;
  isJson?: boolean;
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
