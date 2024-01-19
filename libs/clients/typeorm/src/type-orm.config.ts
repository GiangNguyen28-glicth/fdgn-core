import { ConfigService } from '@nestjs/config';
import { AbstractClientConfig, ClientConfig, toInt } from '@fdgn/common';
export type ORM_TYPE = 'mysql' | 'postgres';
export class TypeOrmConfig extends ClientConfig {
  type: ORM_TYPE;
  host: string;
  port: number;
  username: string;
  password: string;
  synchronize?: boolean;
  autoLoadEntities?: boolean;
  database: string;
  constructor(props: TypeOrmConfig) {
    super(props);
    this.port = toInt(props.port ?? this.getDefaultPort(this.type));
  }

  getDefaultPort(type: ORM_TYPE): number {
    switch (type) {
      case 'mysql':
        return 3306;
      case 'postgres':
        return 5432;
      default:
        return 3306;
    }
  }
}
export class TypeOrmClientConfig extends AbstractClientConfig<TypeOrmConfig> {
  constructor(configService: ConfigService, configKey: string) {
    super(configService, configKey);
  }

  protected createConfigInstance(configData: TypeOrmConfig): TypeOrmConfig {
    return new TypeOrmConfig(configData);
  }

  getConnectionConfig() {
    const { host, port, username, password, database, type } = this.getConfig;
    return { host, port, username, password, database, type };
  }
}
