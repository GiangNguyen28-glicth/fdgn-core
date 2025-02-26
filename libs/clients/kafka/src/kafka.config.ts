import { ISocketFactory, KafkaConfig, RetryOptions, SASLOptions } from 'kafkajs';
import { ClientConfig, DEFAULT_CON_ID } from '@fdgn/common';
import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsPositive, IsString } from 'class-validator';
export class KafkaClientConfig extends ClientConfig implements KafkaConfig {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  brokers: string[];

  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  sasl?: SASLOptions;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsPositive()
  connectionTimeout?: number;

  @IsOptional()
  @IsPositive()
  authenticationTimeout?: number;

  @IsOptional()
  @IsPositive()
  reAuthenticationThreshold?: number;

  @IsOptional()
  @IsPositive()
  requestTimeout?: number;

  @IsOptional()
  @IsBoolean()
  enforceRequestTimeout?: boolean;

  retry?: RetryOptions;
  socketFactory?: ISocketFactory;

  constructor(props:KafkaClientConfig) {
    super(props);
    this.brokers = props.brokers;
    this.ssl = props.ssl ?? false;
    this.sasl = props.sasl;
    this.clientId = props.clientId ?? DEFAULT_CON_ID;
    this.connectionTimeout = props.connectionTimeout ?? 1000;
    this.authenticationTimeout = props.authenticationTimeout;
    this.reAuthenticationThreshold = props.reAuthenticationThreshold;
    this.enforceRequestTimeout = props.enforceRequestTimeout;
    this.requestTimeout = props.requestTimeout ?? 30000;
    this.retry = props.retry;
    this.socketFactory = props.socketFactory;
  }
}