import { ConfigService } from '@nestjs/config';
import { AbstractClientConfig, ClientConfig, toInt } from '@fdgn/common';

export class MongooseConfig extends ClientConfig {
  uri?: string;
  host?: string;
  username?: string;
  password?: string;
  database?: string;
  port?: number;
  constructor(props: MongooseConfig) {
    super(props);
    this.host = props.host ?? 'localhost';
    this.port = toInt(props.port, 27017);
  }
}

export class MongooseClientConfig extends AbstractClientConfig<MongooseConfig> {
  constructor(configService: ConfigService, configKey: string) {
    super(configService, configKey);
  }

  protected createConfigInstance(configData: MongooseConfig): MongooseConfig {
    return new MongooseConfig(configData);
  }

  getUrl(): string {
    if (this.getConfig.uri) {
      return this.getConfig.uri;
    }
    return `mongodb://$${this.getConfig.username}:${this.getConfig.password}@${this.getConfig.host}:${this.getConfig.port}/${this.getConfig.database}?authSource=admin`;
  }
}
