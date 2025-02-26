import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { isNil } from 'lodash';
import { Counter } from 'prom-client';
import { RedisClientType, createClient } from 'redis';

import { parseJSON, sleep, AbstractClientService, DEFAULT_CON_ID } from '@fdgn/common';

import { RedisGetStatus, RedisSetStatus } from './constants';
import { IRedisDel, IRedisGet, IRedisSet, RedisClient } from './interfaces';
import { CONFIG_KEY, RedisClientConfig } from './redis.config';
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
    super(CONFIG_KEY, RedisClientConfig);
  }

  async init(config: RedisClientConfig): Promise<RedisClientType> {
    return this.connect(config);
  }

  async connect(config: RedisClientConfig): Promise<RedisClientType> {
    const { retryTimeout } = config;
    // this.logger.log('Redis is initiating a connection to the server.');
    try {
      const redis = createClient(config);
      redis.on('connect', () => {
        this.logger.log('Redis is initiating a connection to the server.');
      });

      redis.on('ready', () => {
        this.logger.log('Redis successfully initiated the connection to the server.');
      });

      redis.on('reconnecting', () => {
        this.logger.log('Redis is trying to reconnect to the server.');
      });

      redis.on('error', error => {
        this.logger.error('Redis error.', error);
      });
      await redis.connect();
      return redis as RedisClientType;
    } catch (error) {
      this.logger.error(`Redis init error. Retry after ms ${retryTimeout} s`, error);
      await sleep(retryTimeout, 'seconds');
      return this.connect(config);
    }
  }

  async stop(client: RedisClientType): Promise<void> {
    const messages = await client.quit();
    this.logger.log(`Quit redis client ${messages}`);
  }

  async start(client: RedisClientType, con_id = DEFAULT_CON_ID): Promise<void> {
    await client.clientSetName(con_id);
    const name = await client.clientGetName();
    this.logger.log({ level: 'info', message: `Redis ${name} client started!` });
  }

  getNamespace(key: string, namespace?: string) {
    return namespace ? `${namespace}:${key}` : key;
  }

  getConId(condId = DEFAULT_CON_ID) {
    return condId;
  }

  async get<T>(p: IRedisGet): Promise<T> {
    const con_id = this.getConId(p.con_id);
    try {
      const namespace = this.getNamespace(p.key, p.namespace);
      const cachedValue = await this.getClient(con_id).get(namespace);

      if (isNil(cachedValue)) {
        this.trackingGet.inc({ status: RedisGetStatus.MISS, namespace: p.namespace, con_id });
        return null;
      }

      this.trackingGet.inc({ status: RedisGetStatus.HIT, namespace: p.namespace, con_id });
      if (p.is_json) {
        const { data, error } = parseJSON<T>(cachedValue);
        return isNil(error) ? data : (cachedValue as T);
      }

      return cachedValue as T;
    } catch (error) {
      this.trackingGet.inc({ status: RedisGetStatus.ERROR, namespace: p.namespace, con_id });
      throw error;
    }
  }

  async set(p: IRedisSet): Promise<void> {
    const con_id = this.getConId(p.con_id);
    try {
      let value = p.value;
      if (p.is_json) {
        value = JSON.stringify(p.value);
      }
      this.trackingSet.inc({ status: RedisSetStatus.SUCCESS, namespace: p.namespace, con_id });
      await this.getClient(con_id).set(p.key, value, { EX: p.ttl });
    } catch (error) {
      this.trackingSet.inc({ status: RedisSetStatus.ERROR, namespace: p.namespace, con_id });
      throw error;
    }
  }

  async del(p: IRedisDel): Promise<number> {
    try {
      return await this.getClient(p.con_id).del(p.keys);
    } catch (error) {
      this.logger.error(`Deleted redis key failed, Error: ${error}`);
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
