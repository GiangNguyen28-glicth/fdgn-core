import { Controller, Get, Inject, OnModuleInit, Param } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import { ProductsService } from './interfaces/grpc.service';
import { Product, ProductById } from './interfaces/grpc.interface';

@Controller('product')
export class ProductController implements OnModuleInit {
  private productsService: ProductsService;
  // private productCircuitBreaker: ProductCircuit;

  constructor(@Inject('PRODUCT_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.productsService = this.client.getService<ProductsService>('ProductsService');
    // this.productCircuitBreaker = new ProductCircuit({ default_1: this.productsService.findOne });
  }

  @Get(':id')
  async findProductById(@Param('id') id: string): Promise<Product> {
    return await this.findOne({ _id: id });
  }

  async findOne(data: ProductById): Promise<Product> {
    // return await this.productCircuitBreaker.request('default_1', data);
    return await lastValueFrom(this.productsService.findOne(data));
  }
}
