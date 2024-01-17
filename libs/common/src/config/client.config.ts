import { Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export class ClientConfig {
  enable = false;

  constructor(props: Partial<ClientConfig> | any) {
    Object.assign(this, {
      ...props,
    });
  }
}

export abstract class AbstractClientConfig {
  public config: ClientConfig;

  public constructor(public configService: ConfigService, public configKey: string) {}

  public getConfig() {
    if (this.config) return this.config;
    this.config = new ClientConfig(this.configService.get<ClientConfig>(this.configKey as any));
    return this.config;
  }
}
