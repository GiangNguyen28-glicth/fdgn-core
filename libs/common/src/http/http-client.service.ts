import { HttpService } from "@nestjs/axios";
import { Inject, Injectable } from "@nestjs/common";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { Observable } from "rxjs";
import { cloneDeep } from "lodash";
import axios from "axios";

import { AbstractClientService, DEFAULT_CON_ID } from "@fdgn/client-core";

import { HttpClientConfig } from "./http-client.config";
import { mergeDeep } from "../utils";

@Injectable()
export class HttpClientService extends AbstractClientService<HttpClientConfig, HttpService> {
  @Inject()
  private httpService: HttpService;

  constructor() {
    super('httpClient', HttpClientConfig);
  }
  
  protected async init(config: HttpClientConfig): Promise<HttpService> {
    config.onRetryAttempt();
    return this.httpService;
  }

  protected async stop(client: HttpService, conId?: string): Promise<void> {
    console.log("HttpClientService stop");
  }
  
  protected async start(client: HttpService, conId?: string): Promise<void> {
    console.log("HttpClientService start");
  }

  async request<T = any>(config: AxiosRequestConfig, conId: string = DEFAULT_CON_ID): Promise<AxiosResponse<T>> {
    const cf: AxiosRequestConfig = mergeDeep(cloneDeep(this.getConfig(conId)), config);
    cf.raxConfig = {
      retry: 3,
      noResponseRetries: 2,
      retryDelay: 100,
      httpMethodsToRetry: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'],
      statusCodesToRetry: [[100, 199], [429, 429], [500, 599]],
      backoffType: 'exponential',
      onRetryAttempt: err => {
        console.log(err);
        // console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
      }
    };
    return await axios(cf);
  }
}