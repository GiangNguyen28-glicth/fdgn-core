import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { grpcClientOptions } from './grpc.config';
import { ProductController } from './product.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_PACKAGE',
        ...grpcClientOptions,
      },
    ]),
  ],
  controllers: [ProductController],
})
export class ProductModule {}
