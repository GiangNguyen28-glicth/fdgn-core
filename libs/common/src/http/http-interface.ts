import { CorsOptions, CorsOptionsDelegate } from '@nestjs/common/interfaces/external/cors-options.interface';

export interface IBootstrap {
  corsOtp?: CorsOptions | CorsOptionsDelegate<any>;
}

export interface HttpConfig {
  port: number;
  contextPath?: string;
}
