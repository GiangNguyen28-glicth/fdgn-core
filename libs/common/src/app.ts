import { Logger, NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GatewayConfig, GatewayService } from './gateway';
import { HttpConfig, HttpService } from './http';
import { GATEWAY_CONFIG_KEY, HTTP_CONFIG_KEY } from './constants';

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

    const gateway_config = new GatewayConfig(config.get<GatewayConfig>(GATEWAY_CONFIG_KEY));
    if (gateway_config) {
      await GatewayService.bootstrap({ app, logger, gateway_config });
    }
  }
}
