import { AxiosRequestConfig, Method, AxiosBasicCredentials } from 'axios';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

import { HttpMethod } from '../constants';
import { mergeDeep } from '../utils';
import { ClientConfig } from '../config';

export class RaxConfig {
  @IsOptional()
  @IsInt()
  retries: number;

  @IsOptional()
  @IsInt()
  retryDelay: number;
}

export class HttpClientConfig extends ClientConfig implements AxiosRequestConfig {
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsEnum(HttpMethod)
  method?: Method;

  @IsOptional()
  @IsString()
  baseURL?: string;

  headers?: any;
  params?: any;

  @IsOptional()
  @IsPositive()
  timeout = 30000;

  @IsOptional()
  @IsString()
  timeoutErrorMessage?: string;

  @IsOptional()
  auth: AxiosBasicCredentials;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxRedirects = 3;

  raxConfig: RaxConfig;

  constructor(props: HttpClientConfig) {
    super(props);
    mergeDeep(this, props);
  }

  retryDelay(retryCount: number) {
    return this.raxConfig.retryDelay; // Exponential backoff
  }

  onRetryAttempt() {
    // this.raxConfig.onRetryAttempt = (err: AxiosError) => {
    //   const { method, url, raxConfig } = err.config;
    //   console.error('%s %s with %o error, currentRetryAttempt: %s', method, url, err, raxConfig.currentRetryAttempt);
    // };
  }
}
