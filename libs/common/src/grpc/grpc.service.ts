import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as fs from 'fs';
import { glob } from 'glob';

import { ENV } from '../config';
import { GrpcConfig } from './grpc.config';
export class GrpcService {
  static async bootstrap(app: INestApplication) {
    const config = app.get(ConfigService);
    const grpcConfig = config.get<GrpcConfig>('grpc' as any);
    if (!grpcConfig) return;
    const files = glob.sync(`${config.get('env') === ENV.DEV ? 'src' : 'dist'}/**/*.proto`);
    const packages = files.map(
      file =>
        fs
          .readFileSync(file)
          .toString()
          .match(/package (.*);/)[1],
    );
    const logger = new Logger('GrpcService');

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: packages,
        // url: `0.0.0.0:${grpcConfig.port}`,
        protoPath: files,
      },
    });

    await app.startAllMicroservices();
    await app.listen(grpcConfig.port, () => logger.log(`is listening on port ${grpcConfig.port}`));

    console.log(`Application is running on: ${await app.getUrl()}`);
  }
}
