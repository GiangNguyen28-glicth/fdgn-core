import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';

import { AppExceptionsFilter } from '../exception';
import { HttpConfig } from './http-config';
export class HttpService {
  static async bootstrap(app: NestExpressApplication) {
    const config = app.get(ConfigService);
    const httpConfig = config.get<HttpConfig>('http');
    if (!httpConfig) return;
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new AppExceptionsFilter());
    app.setGlobalPrefix(httpConfig.contextPath, { exclude: ['metrics', 'health'] });
    app.use(
      helmet({
        hidePoweredBy: true,
        contentSecurityPolicy: {
          directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            'connect-src': ["'self'"],
          },
        },
      }),
    );
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
  }

  static getDescription(config: ConfigService): string {
    const { description } = config.get('swagger') ?? {};
    const defaultDescription = config.get('description') ?? 'UnKnow';
    return description ?? defaultDescription;
  }
}
