import { ClientConfig } from '@fdgn/common';
import { IsNotEmpty, IsOptional, IsInt, IsBoolean, IsString } from 'class-validator';
import { startsWith } from 'lodash';
import * as tls from 'tls';
import * as net from 'net';
import { Options as PoolOptions } from 'generic-pool';
export const CONFIG_KEY = 'redis';
interface RedisSocketCommonOptions {
  connectTimeout?: number;
  noDelay?: boolean;
  keepAlive?: number | false;
  reconnectStrategy?(retries: number): number | Error;
}
declare type RedisNetSocketOptions = Partial<net.SocketConnectOpts>;
interface RedisTlsSocketOptions extends RedisSocketCommonOptions, tls.ConnectionOptions {
  tls: true;
}
declare type RedisSocketOptions = RedisSocketCommonOptions & (RedisNetSocketOptions | RedisTlsSocketOptions);

export class RedisClientConfig extends ClientConfig {
  @IsString()
  @IsNotEmpty()
  url: string;

  socket?: RedisSocketOptions;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  @IsInt()
  database?: number;

  @IsOptional()
  @IsInt()
  commandsQueueMaxLength?: number;

  @IsOptional()
  @IsBoolean()
  readonly?: boolean;

  @IsOptional()
  @IsBoolean()
  legacyMode?: boolean;

  @IsOptional()
  @IsInt()
  retryTimeout: number;

  isolationPoolOptions?: PoolOptions;

  constructor(props: RedisClientConfig) {
    super(props);
    this.url = props.url && !startsWith(props.url, 'redis://') ? `redis://${props.url}` : props.url;
    this.socket = props.socket;
    this.username = props.username;
    this.password = props.password;
    this.database = Number(props.database);
    this.commandsQueueMaxLength = props.commandsQueueMaxLength;
    this.readonly = props.readonly;
    this.legacyMode = props.legacyMode;
    this.retryTimeout = props.retryTimeout ?? 3;
    this.isolationPoolOptions = props.isolationPoolOptions;
  }
}
