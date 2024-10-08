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
  private channels: { [con_id: string]: ConfirmChannel } = {};
  private hooks: { [con_id: string]: ((con_id: string) => Promise<void>)[] } = {};

  protected async init(config: RabbitMQConfig): Promise<Connection> {
    try {
      if (!has(this.hooks, config.con_id)) this.hooks[config.con_id] = [];
      const connection = await amqp.connect(config.getUrl());

      const { onConnectionEvent } = config;

      connection.on(
        'error',
        // TODO: cover the case rabbit connection error, exit or retry connect but channels can create again
        (async (error: Error) => {
          console.error(error ?? {}, '`%s` rabbit connection error', config.con_id);
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
          console.error(error ?? {}, '`%s` rabbit connection closed', config.con_id);
          if (onConnectionEvent.exitOnClose) throw error ?? new Error(`RabbitMQ [${config.con_id}] connection closed`);
          else {
            console.log('Connect close. Trying to reconnect');
            await sleep(3, 'seconds');
            await this.clientInit(config);
          }
        }).bind(this),
      );
      this.setClient(connection, config.con_id);
      return connection;
    } catch (error) {
      console.log('Connect failed. Trying to connection');
      await sleep(3, 'seconds');
      await this.init(config);
      return this.getClient(config.con_id);
    }
  }

  protected async stop(client: Connection, con_id?: string): Promise<void> {
    console.info('Close connection to rabbit client %s', con_id);
    await client.close();
  }

  protected async start(client: Connection, con_id = DEFAULT_CON_ID): Promise<void> {
    await this.createChannel(con_id);
  }

  async createChannelById(channelId: string, con_id?: string): Promise<void> {
    const { onChannelEvent } = this.getConfig(con_id);
    if (!has(this.hooks, channelId)) this.hooks[channelId] = [];
    this.channels[channelId] = await this.getClient(con_id).createConfirmChannel();
    console.info('`%s` rabbit create confirmChannel %s success', con_id, channelId);

    this.channels[channelId]?.on(
      'error',
      (async (error: Error) => {
        console.error(error, '`%s` rabbit confirmChannel %s error', con_id, channelId);
        if (onChannelEvent.exitOnError) throw error;
        else await this.createChannelById(channelId, con_id);
      }).bind(this),
    );

    this.channels[channelId]?.on(
      'close',
      (async (error: Error) => {
        console.error(error, '`%s` rabbit confirmChannel %s closed', con_id, channelId);
        if (onChannelEvent.exitOnClose) throw error;
        else await this.createChannelById(channelId, con_id);
      }).bind(this),
    );

    for (const hook of this.hooks[channelId]) {
      await hook(channelId);
    }
  }

  private async createChannel(con_id: string = DEFAULT_CON_ID): Promise<void> {
    this.channels[con_id] = await this.getClient(con_id).createConfirmChannel();
    console.info('`%s` rabbit create confirmChannel success', con_id);
    const { onChannelEvent } = this.getConfig(con_id);
    this.channels[con_id]?.connection.on(
      'error',
      (async (error: Error) => {
        console.error(error ?? {}, '`%s` rabbit confirmChannel error', con_id);
        if (onChannelEvent.exitOnError) throw error;
        // else await this.createChannel(con_id);
      }).bind(this),
    );

    this.channels[con_id]?.connection.on(
      'close',
      (async (error: Error) => {
        console.error(error ?? {}, '`%s` rabbit confirmChannel closed', con_id);
        if (onChannelEvent.exitOnClose) throw error ?? new Error(`RabbitMQ [${con_id}] confirmChannel closed`);
        else {
          console.log('Channels close. Trying reconnect');
          // await this.createChannel(con_id);
        }
      }).bind(this),
    );

    this.channels[con_id]?.connection.on('heartbeat', () => {
      console.debug('Received a Heartbeat signal');
    });

    for (const hook of this.hooks[con_id]) await hook(con_id);
  }

  async sendToQueue(options: ISendToQueue): Promise<void> {
    const { con_id = DEFAULT_CON_ID, queue, opts, msgs } = options;
    for (const msg of msgs) {
      this.channels[con_id].sendToQueue(queue, Buffer.from(msg), opts);
    }
    await this.channels[con_id].waitForConfirms();
  }

  async publish(options: IPublish): Promise<void> {
    const { con_id = DEFAULT_CON_ID, exchange, opts, msgs } = options;
    for (const { key, content } of msgs) {
      this.channels[con_id].publish(exchange, key, Buffer.from(content), opts);
    }
    await this.channels[con_id].waitForConfirms();
  }

  async consume(options: IConsume): Promise<void> {
    const { queue, callback, rbOptions, con_id = DEFAULT_CON_ID } = options;
    const hook = async (con_id: string) => {
      await this.channels[con_id].prefetch(rbOptions.prefetchMessages ?? 10);
      await this.channels[con_id].consume(
        queue,
        async (msg: RabbitMessage) => {
          try {
            await callback(msg);
            rbOptions.autoCommit && (await this.commit(msg, con_id));
          } catch (error) {
            await this.reject(msg, rbOptions.requeue ?? true, con_id);
          }
        },
        options,
      );
    };

    this.hooks[con_id].push(hook);
    await hook(con_id);
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
    const { queue, exchange, routingKey, exchangeType, queueOptions } = bindQueue;
    await this.exchange({ exchange, type: exchangeType ?? 'direct' }, channelId);
    await this.assertQueue({ queue, options: queueOptions }, channelId);
    return await this.channels[channelId].bindQueue(queue, exchange, routingKey);
  }

  async reject(msg: RabbitMessage | RabbitMessage[], requeue?: boolean, con_id: string = DEFAULT_CON_ID): Promise<void> {
    if (isArray(msg)) {
      for (const message of msg) {
        this.channels[con_id].reject(message, requeue ?? true);
        await this.channels[con_id].waitForConfirms();
      }
      return;
    }
    this.channels[con_id].reject(msg, requeue ?? true);
    await this.channels[con_id].waitForConfirms();
  }

  async commit(msg: RabbitMessage | RabbitMessage[], con_id: string = DEFAULT_CON_ID): Promise<void> {
    if (isArray(msg)) {
      for (const message of msg) {
        this.channels[con_id].ack(message);
        await this.channels[con_id].waitForConfirms();
      }
      return;
    }
    this.channels[con_id].ack(msg);
    await this.channels[con_id].waitForConfirms();
  }

  async getTotalMessageInQueue(queueName: string, con_id: string = DEFAULT_CON_ID) {
    return this.channels[con_id].checkQueue(queueName);
  }
}
