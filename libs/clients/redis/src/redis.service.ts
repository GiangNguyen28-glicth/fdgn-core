import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { isNil } from 'lodash';
import { Counter } from 'prom-client';
import { RedisClientType, createClient } from 'redis';

import { AbstractClientService, DEFAULT_CON_ID } from '@fdgn/client-core';
import { parseJSON, sleep } from '@fdgn/common';

import { RedisGetStatus, RedisSetStatus } from './constance';
import { IRedisDel, IRedisGet, IRedisSet, RedisClient } from './interfaces';
import { RedisClientConfig } from './redis.config';
import { REDIS_TRACKING_GET_STATUS, REDIS_TRACKING_SET_STATUS } from './redis.metrics';

@Injectable()
export class RedisClientService
  extends AbstractClientService<RedisClientConfig, RedisClientType>
  implements RedisClient
{
  constructor(
    @InjectMetric(REDIS_TRACKING_SET_STATUS)
    private trackingSet: Counter<string>,

    @InjectMetric(REDIS_TRACKING_GET_STATUS)
    private trackingGet: Counter<string>,
  ) {
    super('redis', RedisClientConfig);
  }

  async init(config: RedisClientConfig): Promise<RedisClientType> {
    return this.connect(config);
  }

  async connect(config: RedisClientConfig): Promise<RedisClientType> {
    const { retryTimeout } = config;
    try {
      const redis = createClient(config);
      redis.on('connect', () => {
        console.info('Redis is initiating a connection to the server.');
      });

      redis.on('ready', () => {
        console.info('Redis successfully initiated the connection to the server.');
      });

      redis.on('reconnecting', () => {
        console.info('Redis is trying to reconnect to the server.');
      });

      redis.on('error', error => {
        console.error(error, 'Redis error.');
      });
      await redis.connect();
      return redis as RedisClientType;
    } catch (error) {
      console.error(error, 'Redis init error %j.\nRetry after %dms', config, retryTimeout);
      await sleep(retryTimeout);
      return this.connect(config);
    }
  }

  async stop(client: RedisClientType): Promise<void> {
    const messages = await client.quit();
    console.info('Quit redis client %s', messages);
  }

  async start(client: RedisClientType, conId = DEFAULT_CON_ID): Promise<void> {
    await client.clientSetName(conId);
    const name = await client.clientGetName();
    console.info('Redis %s client started!', name);
  }

  getNamespace(key: string, namespace?: string) {
    return namespace ? `${namespace}:${key}` : key;
  }

  getConId(condId = DEFAULT_CON_ID) {
    return condId;
  }

  async get<T>(p: IRedisGet): Promise<T> {
    const conId = this.getConId(p.conId);
    try {
      const namespace = this.getNamespace(p.key, p.namespace);
      const cachedValue = await this.getClient(conId).get(namespace);

      if (isNil(cachedValue)) {
        this.trackingGet.inc({ status: RedisGetStatus.MISS, namespace: p.namespace, conId });
        return null;
      }

      this.trackingGet.inc({ status: RedisGetStatus.HIT, namespace: p.namespace, conId });
      if (p.isJson) {
        const { data, error } = parseJSON<T>(cachedValue);
        return isNil(error) ? data : (cachedValue as T);
      }

      return cachedValue as T;
    } catch (error) {
      this.trackingGet.inc({ status: RedisGetStatus.ERROR, namespace: p.namespace, conId });
      throw error;
    }
  }

  async set(p: IRedisSet): Promise<void> {
    const conId = this.getConId(p.conId);
    try {
      let value = p.value;
      if (p.isJson) {
        value = JSON.stringify(p.value);
      }
      this.trackingSet.inc({ status: RedisSetStatus.SUCCESS, namespace: p.namespace, conId });
      await this.getClient(conId).set(p.key, value, { EX: p.ttl });
    } catch (error) {
      this.trackingSet.inc({ status: RedisSetStatus.ERROR, namespace: p.namespace, conId });
      throw error;
    }
  }

  async del(p: IRedisDel): Promise<number> {
    try {
      return await this.getClient(p.conId).del(p.keys);
    } catch (error) {
      console.error(`Deleted redis key failed, Error: ${error}`);
      throw error;
    }
  }

  async delNamespace(namespace: string, COUNT = 100, condId = DEFAULT_CON_ID): Promise<void> {
    let cursor = 0;
    const data = await this.getClient(this.getConId(condId)).scan(cursor, { MATCH: namespace, COUNT });
    do {
      const { cursor: newCursor, keys } = await data;
      if (keys.length > 0) {
        // Delete the keys in batches
        await this.getClient(this.getConId(condId)).del(keys);
      }
      cursor = newCursor;
    } while (cursor !== 0);
  }
}
