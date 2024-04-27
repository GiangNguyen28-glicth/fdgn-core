import { Injectable } from '@nestjs/common';
import { isNil } from 'lodash';
import { RedisClientType, createClient } from 'redis';

import { AbstractClientService, DEFAULT_CON_ID } from '@fdgn/client-core';
import { parseJSON, sleep } from '@fdgn/common';

import { IRedisDel, IRedisGet, IRedisSet, RedisClient } from './interfaces';
import { RedisClientConfig } from './redis.config';

@Injectable()
export class RedisClientService
  extends AbstractClientService<RedisClientConfig, RedisClientType>
  implements RedisClient
{
  constructor() {
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
    return condId ? condId : DEFAULT_CON_ID;
  }

  async get<T>(p: IRedisGet): Promise<T> {
    const namespace = this.getNamespace(p.key, p.namespace);
    const cachedValue = await this.getClient(this.getConId(p.conId)).get(namespace);

    if (!isNil(cachedValue)) {
      const { data, error } = parseJSON(cachedValue);
      return (isNil(error) ? data : cachedValue) as T;
    }
    return cachedValue as T;
  }

  async set(p: IRedisSet): Promise<void> {
    try {
      await this.getClient(this.getConId(p.conId)).set(p.key, p.value, { EX: p.ttl });
    } catch (error) {
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
