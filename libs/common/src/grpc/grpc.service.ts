import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import * as fs from 'fs';
import { glob } from 'glob';

import { ENV } from '../config';
import { GrpcConfig } from './grpc.config';
export class GrpcService {
  static async bootstrap(args: {app: INestApplication, logger: Logger, grpc_config: GrpcConfig}) {
    const { app, grpc_config, logger } = args;
    const config = app.get(ConfigService);
    const files = glob.sync(`${config.get('env') === ENV.DEV ? 'src' : 'dist'}/**/*.proto`);
    const packages = files.map(
      file =>
        fs
          .readFileSync(file)
          .toString()
          .match(/package (.*);/)[1],
    );

    app.connectMicroservice<GrpcOptions>({
      transport: Transport.GRPC,
      options: {
        package: packages,
        url: `${grpc_config.host}:${grpc_config.port}`,
        protoPath: files,
      },
    });

    await app.startAllMicroservices();
    logger.log(`Grpc is listening on port ${grpc_config.port}`);
  }
}
