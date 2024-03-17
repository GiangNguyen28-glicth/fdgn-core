import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfirmChannel, Connection } from 'amqplib';
import { has } from 'lodash';

import { AbstractClientService, DEFAULT_CON_ID } from '@fdgn/client-core';
import { isArray, sleep } from '@fdgn/common';

import {
  IConsume,
  IExchange,
  IPublish,
  IQueue,
  IQueueBinding,
  ISendToQueue,
  RabbitAssertExchange,
  RabbitAssertQueue,
  RabbitMessage,
} from '../models';
import { RabbitMQClient } from '../rabbitmq.client';
import { RabbitMQConfig } from '../rabbitmq.config';

@Injectable()
export class RabbitMQService extends AbstractClientService<RabbitMQConfig, Connection> implements RabbitMQClient {
  constructor() {
    super('rabbit', RabbitMQConfig);
  }
  private channels: { [conId: string]: ConfirmChannel } = {};
  private hooks: { [conId: string]: ((conId: string) => Promise<void>)[] } = {};

  protected async init(config: RabbitMQConfig): Promise<Connection> {
    try {
      if (!has(this.hooks, config.conId)) this.hooks[config.conId] = [];
      const connection = await amqp.connect(config.getUrl());

      const { onConnectionEvent } = config;

      connection.on(
        'error',
        // TODO: cover the case rabbit connection error, exit or retry connect but channels can create again
        (async (error: Error) => {
          console.error(error ?? {}, '`%s` rabbit connection error', config.conId);
          if (onConnectionEvent.exitOnError) throw error;
          else {
            console.log('Connect error. Trying to reconnect');
            await sleep(3, 'seconds');
            await this.clientInit(config);
          }
        }).bind(this),
      );

      connection.on(
        'close',
        (async (error: Error) => {
          console.error(error ?? {}, '`%s` rabbit connection closed', config.conId);
          if (onConnectionEvent.exitOnClose) throw error ?? new Error(`RabbitMQ [${config.conId}] connection closed`);
          else {
            console.log('Connect close. Trying to reconnect');
            await sleep(3, 'seconds');
            await this.clientInit(config);
          }
        }).bind(this),
      );
      this.setClient(connection, config.conId);
      return connection;
    } catch (error) {
      console.log('Connect failed. Trying to connection');
      await sleep(3, 'seconds');
      await this.init(config);
      return this.getClient(config.conId);
    }
  }

  protected async stop(client: Connection, conId?: string): Promise<void> {
    console.info('Close connection to rabbit client %s', conId);
    await client.close();
  }

  protected async start(client: Connection, conId = DEFAULT_CON_ID): Promise<void> {
    await this.createChannel(conId);
  }

  async createChannelById(channelId: string, conId?: string): Promise<void> {
    const { onChannelEvent } = this.getConfig(conId);
    if (!has(this.hooks, channelId)) this.hooks[channelId] = [];
    this.channels[channelId] = await this.getClient(conId).createConfirmChannel();
    console.info('`%s` rabbit create confirmChannel %s success', conId, channelId);

    this.channels[channelId]?.on(
      'error',
      (async (error: Error) => {
        console.error(error, '`%s` rabbit confirmChannel %s error', conId, channelId);
        if (onChannelEvent.exitOnError) throw error;
        else await this.createChannelById(channelId, conId);
      }).bind(this),
    );

    this.channels[channelId]?.on(
      'close',
      (async (error: Error) => {
        console.error(error, '`%s` rabbit confirmChannel %s closed', conId, channelId);
        if (onChannelEvent.exitOnClose) throw error;
        else await this.createChannelById(channelId, conId);
      }).bind(this),
    );

    for (const hook of this.hooks[channelId]) {
      await hook(channelId);
    }
  }

  private async createChannel(conId: string = DEFAULT_CON_ID): Promise<void> {
    this.channels[conId] = await this.getClient(conId).createConfirmChannel();
    console.info('`%s` rabbit create confirmChannel success', conId);
    const { onChannelEvent } = this.getConfig(conId);
    this.channels[conId]?.connection.on(
      'error',
      (async (error: Error) => {
        console.error(error ?? {}, '`%s` rabbit confirmChannel error', conId);
        if (onChannelEvent.exitOnError) throw error;
        // else await this.createChannel(conId);
      }).bind(this),
    );

    this.channels[conId]?.connection.on(
      'close',
      (async (error: Error) => {
        console.error(error ?? {}, '`%s` rabbit confirmChannel closed', conId);
        if (onChannelEvent.exitOnClose) throw error ?? new Error(`RabbitMQ [${conId}] confirmChannel closed`);
        else {
          console.log('Channels close. Trying reconnect');
          // await this.createChannel(conId);
        }
      }).bind(this),
    );

    this.channels[conId]?.connection.on('heartbeat', () => {
      console.debug('Received a Heartbeat signal');
    });

    for (const hook of this.hooks[conId]) await hook(conId);
  }

  async sendToQueue(options: ISendToQueue): Promise<void> {
    const { conId = DEFAULT_CON_ID, queue, opts, msgs } = options;
    for (const msg of msgs) {
      this.channels[conId].sendToQueue(queue, Buffer.from(msg), opts);
    }
    await this.channels[conId].waitForConfirms();
  }

  async publish(options: IPublish): Promise<void> {
    const { conId = DEFAULT_CON_ID, exchange, opts, msgs } = options;
    for (const { key, content } of msgs) {
      this.channels[conId].publish(exchange, key, Buffer.from(content), opts);
    }
    await this.channels[conId].waitForConfirms();
  }

  async consume(options: IConsume): Promise<void> {
    const { queue, callback, rbOptions, conId = DEFAULT_CON_ID } = options;
    const hook = async (conId: string) => {
      await this.channels[conId].prefetch(rbOptions.prefetchMessages ?? 10);
      await this.channels[conId].consume(
        queue,
        async (msg: RabbitMessage) => {
          try {
            await callback(msg);
            rbOptions.autoCommit && (await this.commit(msg, conId));
          } catch (error) {
            await this.reject(msg, rbOptions.requeue ?? true, conId);
          }
        },
        options,
      );
    };

    this.hooks[conId].push(hook);
    await hook(conId);
  }

  async exchange(exchangeRb: IExchange, channelId: string = DEFAULT_CON_ID): Promise<RabbitAssertExchange> {
    const { exchange, type, options } = exchangeRb;
    return await this.channels[channelId].assertExchange(exchange, type, options);
  }

  async assertQueue(queueOptions: IQueue, channelId: string = DEFAULT_CON_ID): Promise<RabbitAssertQueue> {
    const { queue, options } = queueOptions;
    return await this.channels[channelId].assertQueue(queue, options);
  }

  async binding(bindQueue: IQueueBinding, channelId: string = DEFAULT_CON_ID) {
    const { queue, exchange, routingKey, exchangeType } = bindQueue;
    await this.exchange({ exchange, type: exchangeType ?? 'direct' });
    await this.assertQueue({ queue });
    return await this.channels[channelId].bindQueue(queue, exchange, routingKey);
  }

  async reject(msg: RabbitMessage | RabbitMessage[], requeue?: boolean, conId: string = DEFAULT_CON_ID): Promise<void> {
    if (isArray(msg)) {
      for (const message of msg) {
        this.channels[conId].reject(message, requeue ?? true);
        await this.channels[conId].waitForConfirms();
      }
      return;
    }
    this.channels[conId].reject(msg, requeue ?? true);
    await this.channels[conId].waitForConfirms();
  }

  async commit(msg: RabbitMessage | RabbitMessage[], conId: string = DEFAULT_CON_ID): Promise<void> {
    if (isArray(msg)) {
      for (const message of msg) {
        this.channels[conId].ack(message);
        await this.channels[conId].waitForConfirms();
      }
      return;
    }
    this.channels[conId].ack(msg);
    await this.channels[conId].waitForConfirms();
  }
}
