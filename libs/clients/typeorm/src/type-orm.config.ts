import { ConfigService } from "@nestjs/config";
import { AbstractClientConfig } from '@fdgn/common';
export class TypeOrmConfig extends AbstractClientConfig {
  constructor(configService: ConfigService, configKey: string) {
    super(configService, configKey);
  }

  log() {
    console.log('done');
  }

}
