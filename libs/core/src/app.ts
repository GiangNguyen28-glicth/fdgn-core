import { NestFactory } from '@nestjs/core';
import { NestApplicationOptions, NestModule } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpService } from '@fdgn/common';

export type ApplicationOptions = NestApplicationOptions;
export type Module = NestModule;

export class Application {
  static initTrackingProcessEvent(logger: Logger) {
    const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];
    signalsNames.forEach(signalName =>
      process.on(signalName, signal => {
        logger.log(`Retrieved signal: ${signal}, application terminated`);
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

  static async bootstrap(module: any, opts?: ApplicationOptions) {
    const app = await NestFactory.create<NestExpressApplication>(module, {
      logger: ['debug', 'error', 'warn'],
      ...opts,
    });

    const logger = app.get(Logger);
    app.useLogger(logger);
    if (opts?.cors) {
      app.enableCors(opts.cors as any); 
    }

    Application.initTrackingProcessEvent(logger);
    await HttpService.bootstrap(app);
  }
}
