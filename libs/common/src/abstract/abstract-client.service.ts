import { Inject, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmpty } from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ClientConfig } from '../config';
import { Client } from '../interfaces';
import { toArray } from '../utils';
import { DEFAULT_CON_ID } from '../constants';

export abstract class AbstractClientService<Config extends ClientConfig, C = any>
  implements Client<Config, C>, OnModuleInit, OnModuleDestroy
{
  private configs: { [con_id: string]: Config } = {};
  private clients: { [con_id: string]: C } = {};

  @Inject()
  protected configService: ConfigService;

  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  protected logger: Logger;

  protected constructor(protected service: string, protected config_class: new (props: Config) => Config) {}

  onModuleDestroy() {
    return;
  }

  async onModuleInit() {
    const config = this.configService.get(this.service);
    if (isEmpty(config)) throw new Error(`Config key ${this.service} not found !!!`);
    const configKeys = Object.keys(config);

    if (configKeys.find(key => key === 'default')) {
      // If have default object, then use it as default config
      for (const configKey of configKeys) {
        await this.clientInit({ con_id: configKey, ...config[configKey] });
      }
    } else {
      // array of config if no default object
      for (const cfg of toArray(config)) await this.clientInit(cfg);
    }
  }

  protected async clientInit(config: Config, first = true) {
    const { con_id = DEFAULT_CON_ID } = config;
    const begin_message = first ? 'initializing...' : 're-initializing...';
    const end_message = first ? 'initialized' : 're-initialized';

    this.configs[con_id] = this.validateConfig(config);

    this.logger.debug(`${con_id} ${this.service} is ${begin_message}`);
    this.clients[con_id] = await this.init(this.configs[con_id]);
    this.logger.debug(` ${con_id} ${this.service} ${end_message} with config:\n ${this.configs[con_id]}`);

    await this.start(this.clients[con_id], con_id);
  }

  private validateConfig(config: Config): Config {
    const cfg = new this.config_class(config);
    const error = cfg.validate();
    if (error?.length) {
      this.logger.debug(error[0], `${this.service} invalid config`);
      throw new Error('Invalid Config');
    }

    return cfg;
  }

  getConfig(con_id = DEFAULT_CON_ID): Config {
    return this.configs[con_id];
  }

  getClient(con_id = DEFAULT_CON_ID): C {
    const client = this.clients[con_id];
    if (!client) {
      throw new Error(`Client did not initial, Please verify the ${con_id} connection.`);
    }
    return client;
  }

  setClient(client: C, con_id = DEFAULT_CON_ID): void {
    this.clients[con_id] = client;
  }

  protected abstract init(config: Config): Promise<C>;

  protected abstract stop(client: C, con_id?: string): Promise<void>;

  protected abstract start(client: C, con_id?: string): Promise<void>;
}
