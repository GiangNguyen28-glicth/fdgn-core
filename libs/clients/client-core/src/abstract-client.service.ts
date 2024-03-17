import { Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmpty } from 'lodash';
import { toArray } from '@fdgn/common';

import { Client } from './client';
import { ClientConfig, DEFAULT_CON_ID } from './client.config';

export abstract class AbstractClientService<Config extends ClientConfig, C = any>
  implements Client<Config, C>, OnModuleInit, OnModuleDestroy
{
  private configs: { [conId: string]: Config } = {};
  private clients: { [conId: string]: C } = {};

  @Inject()
  protected configService: ConfigService;

  protected constructor(protected service: string, protected configClass: new (props: Config) => Config) {}

  onModuleDestroy() {
    return;
    throw new Error('Method not implemented.');
  }

  async onModuleInit() {
    const config = this.configService.get(this.service);
    if (isEmpty(config)) throw new Error(`Config key ${this.service} not found !!!`);
    const configKeys = Object.keys(config);

    if (configKeys.find(key => key === 'default')) {
      // If have default object, then use it as default config
      for (const configKey of configKeys) {
        await this.clientInit({ conId: configKey, ...config[configKey] });
      }
    } else {
      // array of config if no default object
      for (const cfg of toArray(config)) await this.clientInit(cfg);
    }
  }

  protected async clientInit(config: Config, first = true) {
    const { conId = DEFAULT_CON_ID } = config;
    const beginMessage = first ? 'initializing...' : 're-initializing...';
    const endMessage = first ? 'initialized' : 're-initialized';

    this.configs[conId] = this.validateConfig(config);

    console.log('`%s` %s is %s', conId, this.service, beginMessage);
    this.clients[conId] = await this.init(this.configs[conId]);
    console.log('`%s` %s %s with config:\n%j', conId, this.service, endMessage, this.configs[conId]);

    await this.start(this.clients[conId], conId);
  }

  private validateConfig(config: Config): Config {
    const cfg = new this.configClass(config);
    const error = cfg.validate();
    if (error?.length) {
      console.error(error, `${this.service} invalid config`);
      throw new Error('Invalid Config');
    }

    return cfg;
  }

  getConfig(conId = DEFAULT_CON_ID): Config {
    return this.configs[conId];
  }

  getClient(conId = DEFAULT_CON_ID): C {
    return this.clients[conId];
  }

  setClient(client: C, conId = DEFAULT_CON_ID): void {
    this.clients[conId] = client;
  }

  protected abstract init(config: Config): Promise<C>;

  protected abstract stop(client: C, conId?: string): Promise<void>;

  protected abstract start(client: C, conId?: string): Promise<void>;
}
