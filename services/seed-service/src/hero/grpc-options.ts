import { ReflectionService } from '@grpc/reflection';
import { ClientOptions, Transport } from '@nestjs/microservices';
import * as fs from 'fs';
import { glob } from 'glob';
const files = glob.sync('src/hero/*.proto');
console.log(files);

export const grpcClientOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['hero'], // ['hero', 'hero2']
    protoPath: files, // ['./hero/hero.proto', './hero/hero2.proto']
    onLoadPackageDefinition: (pkg, server) => {
      new ReflectionService(pkg).addToServer(server);
    },
  },
};
