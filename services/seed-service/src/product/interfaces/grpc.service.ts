import { Product, ProductById } from './grpc.interface';
import { Observable } from 'rxjs';
export interface ProductsService {
  findOne(data: ProductById): Observable<Product>;
}
