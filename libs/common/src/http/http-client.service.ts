import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { cloneDeep } from 'lodash';
import { lastValueFrom } from 'rxjs';


import { mergeDeep } from '../utils';
import { HttpClientConfig } from './http-client.config';
import { AbstractClientService } from '../abstract';
import { DEFAULT_CON_ID, HTTP_CLIENT_SERVICE_CONFIG_KEY } from '../config';

@Injectable()
export class HttpClientService extends AbstractClientService<HttpClientConfig, HttpService> {
  @Inject()
  private readonly httpService: HttpService;

  constructor() {
    super(HTTP_CLIENT_SERVICE_CONFIG_KEY, HttpClientConfig);
  }

  protected async init(config: HttpClientConfig): Promise<HttpService> {
    const instance = this.httpService;
    axiosRetry(instance.axiosRef, {
      retries: config.raxConfig.retries,
      retryDelay: retryCount => {
        this.logger.log(`Retry attempt: ${retryCount}`);
        return retryCount * 1000;
      },
      retryCondition: error => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status >= 500;
      },
    });
    return instance;
  }

  protected async stop(client: HttpService, con_id?: string): Promise<void> {
    this.logger.log({ level:'info', message: 'HttpClientService stop' });
  }

  protected async start(client: HttpService, con_id?: string): Promise<void> {
    this.logger.log({ level: 'info', message: 'HttpClientService start' });
  }

  async request<T = any>(config: AxiosRequestConfig, con_id: string = DEFAULT_CON_ID): Promise<AxiosResponse<T>> {
    const cf: AxiosRequestConfig = mergeDeep(cloneDeep(this.getConfig(con_id)), config);
    return await lastValueFrom(this.httpService.request(cf));
  }
}
