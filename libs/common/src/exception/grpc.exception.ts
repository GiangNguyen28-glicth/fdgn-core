import { RpcException } from '@nestjs/microservices';

import { IGrpcException } from '../interfaces';

export class GrpcException extends RpcException {
  constructor(exception: IGrpcException) {
    super(exception);
  }
}
