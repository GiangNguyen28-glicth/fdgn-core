import { ConfigService } from '@nestjs/config';
import { AbstractClientConfig } from '@fdgn/common';
import { RabbitMQConfig } from '../rabbitmq.config';

export class RabbitMQCsConfig extends AbstractClientConfig<RabbitMQConfig> {
  constructor(configService: ConfigService, configKey: string) {
    super(configService, configKey);
  }

  protected createConfigInstance(configData: RabbitMQConfig): RabbitMQConfig {
    return new RabbitMQConfig(configData);
  }
}
