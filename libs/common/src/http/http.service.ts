import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';

import { AppExceptionsFilter } from '../exception';
import { HttpConfig } from './http-interface';
export class HttpService {
  static async bootstrap(args: {
    http_config: HttpConfig;
    logger: Logger;
    app: NestExpressApplication;
    config: ConfigService;
  }) {
    const { app, http_config, logger, config } = args;
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new AppExceptionsFilter(app.get(HttpAdapterHost)));
    app.setGlobalPrefix(http_config.contextPath, { exclude: ['metrics', 'health'] });
    // app.use(
    //   helmet({
    //     contentSecurityPolicy: {
    //       directives: {
    //         'script-src': ['self'],
    //       },
    //     },
    //     hidePoweredBy: true,
    //   }),
    // );
    const description = this.getDescription(config);

    const options = new DocumentBuilder()
      .setTitle(`${description} API`)
      .setDescription(description)
      .setVersion(`${config.get('version')}`)
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    await app.listen(http_config.port, () => logger.log(`Application is listening on port ${http_config.port}`));
  }

  static getDescription(config: ConfigService): string {
    const { description } = config.get('swagger') ?? {};
    const default_description = config.get('description') ?? 'UnKnow';
    return description ?? default_description;
  }
}
