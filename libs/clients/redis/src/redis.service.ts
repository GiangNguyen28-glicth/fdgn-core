import { Injectable } from '@nestjs/common';

import { AbstractClientService, DEFAULT_CON_ID } from '@fdgn/client-core';
import { sleep } from '@fdgn/common';

import { RedisClientConfig } from './redis.config';
import { RedisClientType, createClient } from 'redis';
import { RedisClient } from './redis.client';

@Injectable()
export class RedisClientService
  extends AbstractClientService<RedisClientConfig, RedisClientType>
  implements RedisClient
{
  constructor() {
    super('redis', RedisClientConfig);
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
