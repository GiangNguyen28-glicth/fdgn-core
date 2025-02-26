import { Logger, NestApplicationOptions, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GrpcConfig, GrpcService } from './grpc';
import { HttpConfig, HttpService } from './http';
import { GRPC_CONFIG_KEY, HTTP_CONFIG_KEY } from './config';

export class Application {
  static initTrackingProcessEvent(logger: Logger) {
    const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];
    signalsNames.forEach(signal_name =>
      process.on(signal_name, signal => {
        logger.error(`Retrieved signal: ${signal}, application terminated`);
        process.exit(0);
      }),
    );

    process.on('uncaughtException', (error: Error) => {
      logger.error({ err: error });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Promise Rejection, reason: ${reason}`);
      promise.catch((err: Error) => {
        logger.error({ err });
        process.exit(1);
      });
    });
  }

  static async bootstrap(module: any, opts?: NestApplicationOptions) {
    const app = await NestFactory.create<NestExpressApplication>(module, {
      logger: ['debug', 'error', 'warn'],
      ...opts,
    });
    const logger: Logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger)
    if (opts?.cors) {
      app.enableCors(opts.cors as any);
    }

    Application.initTrackingProcessEvent(logger);
    const config = app.get(ConfigService);

    const http_config = config.get<HttpConfig>(HTTP_CONFIG_KEY);
    if (http_config) {
      await HttpService.bootstrap({ app, logger, http_config });
    }

    const grpc_config = config.get<GrpcConfig>(GRPC_CONFIG_KEY);
    if (grpc_config) {
      await GrpcService.bootstrap({ app, logger, grpc_config });
    }
  }
}
