import { ConfigService } from '@nestjs/config';

export class ClientConfig {
  enable = false;

  constructor(props: Partial<ClientConfig> | any) {
    Object.assign(this, {
      ...props,
    });
  }
}

export abstract class AbstractClientConfig<T> {
  config: T;

  constructor(public configService: ConfigService, public configKey: string) {
    this.config = this.getInstance();
  }

  getInstance(): T {
    if (this.config) return this.config;
    const props: T = this.configService.get<T>(this.configKey as any);
    console.log(JSON.stringify(props));
    if (!props) {
      throw new Error(`Config key ${this.configKey} not found !!!`);
    }
    this.config = this.createConfigInstance(props);
    return this.config;
  }

  public get getConfig(): T {
    return this.config;
  }

  protected abstract createConfigInstance(configData: T): T;
}
