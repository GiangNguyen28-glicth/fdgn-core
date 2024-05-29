import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import * as fs from 'fs';
import { glob } from 'glob';

import { ENV } from '../config';
import { GrpcConfig } from './grpc.config';
export class GrpcService {
  static async bootstrap(app: INestApplication) {
    const config = app.get(ConfigService);
    const grpcConfig = config.get<GrpcConfig>('grpc');
    if (!grpcConfig) return;
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
        url: `${grpcConfig.host}:${grpcConfig.port}`,
        protoPath: files,
      },
    });

    await app.startAllMicroservices();

    console.log(`Grpc is listening on port ${grpcConfig.port}`);
  }
}
