import { NestApplicationOptions, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { HttpConfig, HttpService } from './http';
import { GrpcConfig, GrpcService } from './grpc';

export type ApplicationOptions = NestApplicationOptions;
export type Module = NestModule;

export class Application {
  static initTrackingProcessEvent() {
    const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];
    signalsNames.forEach(signalName =>
      process.on(signalName, signal => {
        console.log(`Retrieved signal: ${signal}, application terminated`);
        process.exit(0);
      }),
    );

    process.on('uncaughtException', (error: Error) => {
      console.error({ err: error });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error(`Unhandled Promise Rejection, reason: ${reason}`);
      promise.catch((err: Error) => {
        console.error({ err });
        process.exit(1);
      });
    });
  }

  static async bootstrap(module: any, opts?: ApplicationOptions) {
    const app = await NestFactory.create<NestExpressApplication>(module, {
      logger: ['debug', 'error', 'warn'],
      ...opts,
    });

    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    if (opts?.cors) {
      app.enableCors(opts.cors as any);
    }

    Application.initTrackingProcessEvent();
    const config = app.get(ConfigService);

    const http_config = config.get<HttpConfig>('http');
    if (http_config) {
      await HttpService.bootstrap(app);
    }

    const grpc_config = config.get<GrpcConfig>('grpc');
    if (grpc_config) {
      await GrpcService.bootstrap(app);
    }

    await app.listen(http_config.port, () => console.log(`Application is listening on port ${http_config.port}`));
  }
}
