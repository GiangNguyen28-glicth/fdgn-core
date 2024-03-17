import { ConfigService } from '@nestjs/config';
import { AbstractClientConfig } from '@fdgn/common';
import { RabbitMQConfig } from '../rabbitmq.config';

export class RabbitMQClientConfig extends AbstractClientConfig<RabbitMQConfig> {
  constructor(configService: ConfigService, configKey: string) {
    super(configService, configKey);
  }

  protected createConfigInstance(configData: RabbitMQConfig): RabbitMQConfig {
    return new RabbitMQConfig(configData);
  }

  getUrl(): string {
    if (this.getConfig.uri) {
      return this.getConfig.uri;
    }
    const { username, password, hostname, port } = this.getConfig;
    return `amqp://${username}:${password}@${hostname}:${port}`;
  }
}
