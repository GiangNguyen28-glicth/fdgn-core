import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as fs from 'fs';
import { glob } from 'glob';

import { ENV } from '../config';
import { GatewayConfig } from './gateway.config';
export class GatewayService {
  static async bootstrap(args: {
    app: INestApplication;
    logger: Logger;
    gateway_config: GatewayConfig;
    config: ConfigService;
  }) {
    const { app, gateway_config, logger, config } = args;
    const gateway_options = GatewayService.getGatewayOptions(gateway_config, config);
    app.connectMicroservice(gateway_options);
    await app.startAllMicroservices();
    if (gateway_options.options['url']) {
      logger.log(`Gateway is listening on url ${gateway_options.options['url']}`);
    }
  }

  static getGatewayOptions(gateway_config: GatewayConfig, config_service: ConfigService): MicroserviceOptions {
    let files: string[] = [];
    let packages: string[] = [];
    const gateway_options = {
      transport: gateway_config.transport,
      options: {
        ...gateway_config.options,
      },
    };

    if (gateway_config.transport == Transport.GRPC) {
      files = glob.sync(`${config_service.get('env') === ENV.DEV ? 'src' : 'dist'}/**/*.proto`);
      packages = files.map(
        file =>
          fs
            .readFileSync(file)
            .toString()
            .match(/package (.*);/)[1],
      );
      gateway_options.options['package'] = packages;
      gateway_options.options['protoPath'] = files;
    }

    return gateway_options as MicroserviceOptions;
  }
}
