import { AxiosRequestConfig, Method, AxiosBasicCredentials } from "axios";
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import rax from "retry-axios";

import { ClientConfig } from "@fdgn/client-core";

import { HttpMethod } from "../consts";
import { AxiosError, mergeDeep } from "../utils";

const defaultRetryConfig = {
  retry: 3,
  retryDelay: 1000,
  httpMethodsToRetry: ['GET', 'POST'],
};

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

  raxConfig: rax.RetryConfig = defaultRetryConfig;

  constructor(props: HttpClientConfig) {
    super(props);
    mergeDeep(this, props);
    rax.attach();
  }

  onRetryAttempt() {
    this.raxConfig.onRetryAttempt = (err: AxiosError) => {
      const { method, url, raxConfig } = err.config;
      console.error('%s %s with %o error, currentRetryAttempt: %s', method, url, err, raxConfig.currentRetryAttempt);
    };
  }
}