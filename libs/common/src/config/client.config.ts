import { ConfigService } from '@nestjs/config';
import { validateSync, ValidationError } from 'class-validator';
import { DEFAULT_CON_ID } from '../constants';

export abstract class AbstractClientConfig<T> {
  config: T;

  constructor(public configService: ConfigService, public configKey: string) {
    this.config = this.getInstance();
  }

  getInstance(): T {
    if (this.config) return this.config;
    const props: T = this.configService.get<T>(this.configKey as any);
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


export class ClientConfig {
  con_id?: string;

  context: string;

  constructor(props: ClientConfig) {
    this.con_id = props?.con_id || DEFAULT_CON_ID;
    this.context = props?.context;
  }

  validate(): string[] {
    const errors: ValidationError[] = validateSync(this);
    return errors.length ? errors.reduce((res, err) => res.concat(Object.values(err.constraints)), []) : null;
  }
}
