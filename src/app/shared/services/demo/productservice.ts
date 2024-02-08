import {Injectable} from '@angular/core';
import {Product} from '../../../modules/dashboard/dashboard/dashboard.component';
import {HttpClient} from '@angular/common/http';
import {LazyLoadEvent} from 'primeng/api';


@Injectable()
export class ProductService {

  constructor(private http: HttpClient) {
  }

  getProductsSmall() {
    return this.http.get<any>('to-do-master-data.json')
      .toPromise()
      .then(res => res.data as Product[])
      .then(data => data);
  }


  getProducts(event: LazyLoadEvent) {
    return this.http.get<any>('assets/demo/data/vendors-master-data.json')
      .toPromise()
      .then(res => res as Product[])
      .then(data => data);
  }

  getProductsMixed() {
    return this.http.get<any>('assets/demo/data/products-mixed.json')
      .toPromise()
      .then(res => res.data as Product[])
      .then(data => data);
  }

  getProductsWithOrdersSmall() {
    return this.http.get<any>('assets/demo/data/products-orders-small.json')
      .toPromise()
      .then(res => res.data as Product[])
      .then(data => data);
  }

}
