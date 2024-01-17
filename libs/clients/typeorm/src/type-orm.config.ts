import { AbstractClientConfig, ConfigService, Injectable } from '@fdgn/common';

export class TypeOrmConfig extends AbstractClientConfig {
  constructor(configService: ConfigService, configKey: string) {
    super(configService, configKey);
  }

  log() {
    console.log('done');
  }

}
