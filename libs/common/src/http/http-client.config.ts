import { AxiosRequestConfig, Method, AxiosBasicCredentials } from 'axios';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { ClientConfig } from '@fdgn/client-core';

import { HttpMethod } from '../consts';
import { mergeDeep } from '../utils';
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
    console.log(`Retry attempt: ${retryCount}`);
    console.log('this.raxConfig.retryDelay', this.raxConfig.retryDelay);
    return this.raxConfig.retryDelay; // Exponential backoff
  }

  onRetryAttempt() {
    // this.raxConfig.onRetryAttempt = (err: AxiosError) => {
    //   const { method, url, raxConfig } = err.config;
    //   console.error('%s %s with %o error, currentRetryAttempt: %s', method, url, err, raxConfig.currentRetryAttempt);
    // };
  }
}

export class RaxConfig {
  @IsOptional()
  @IsInt()
  retries: number;

  @IsOptional()
  @IsInt()
  retryDelay: number;
}
