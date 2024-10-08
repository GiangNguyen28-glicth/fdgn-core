import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { lastValueFrom, Observable } from 'rxjs';
import axiosRetry from 'axios-retry';
import { cloneDeep } from 'lodash';
import axios from 'axios';

import { AbstractClientService, DEFAULT_CON_ID } from '@fdgn/client-core';

import { HttpClientConfig } from './http-client.config';
import { mergeDeep } from '../utils';

@Injectable()
export class HttpClientService extends AbstractClientService<HttpClientConfig, HttpService> {
  @Inject()
  private httpService: HttpService;

  constructor() {
    super('httpClient', HttpClientConfig);
  }

  protected async init(config: HttpClientConfig): Promise<HttpService> {
    // config.onRetryAttempt();
    console.log(JSON.stringify(config));
    const instance = this.httpService;
    axiosRetry(instance.axiosRef, {
      retries: config.raxConfig.retries, // Number of retries
      retryDelay: retryCount => {
        console.log(`Retry attempt: ${retryCount}`);
        console.log('Number of retries:', retryCount * config.raxConfig.retryDelay);
        return retryCount * 1000; // Exponential backoff
      },
      retryCondition: error => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
      },
    });
    return instance;
  }

  protected async stop(client: HttpService, conId?: string): Promise<void> {
    console.log('HttpClientService stop');
  }

  protected async start(client: HttpService, conId?: string): Promise<void> {
    console.log('HttpClientService start');
  }

  async request<T = any>(config: AxiosRequestConfig, conId: string = DEFAULT_CON_ID): Promise<AxiosResponse<T>> {
    const cf: AxiosRequestConfig = mergeDeep(cloneDeep(this.getConfig(conId)), config);
    return await lastValueFrom(this.httpService.request(cf));
  }
}
