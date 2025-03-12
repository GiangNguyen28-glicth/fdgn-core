import { ConfigService } from '@nestjs/config';
import { AbstractClientConfig, ClientConfig, toBool, toInt } from '@fdgn/common';
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
  logging?: boolean;
  constructor(props: TypeOrmConfig) {
    super(props);
    this.type = props.type;
    this.host = props.host;
    this.port = toInt(props.port ?? this.getDefaultPort(this.type));
    this.username = props.username || 'root';
    this.password = props.password;
    this.synchronize = toBool(props.synchronize);
    this.autoLoadEntities = toBool(props.autoLoadEntities);
    this.database = props.database;
    this.logging =toBool(props.logging);
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
    return this.getConfig;
  }
}
