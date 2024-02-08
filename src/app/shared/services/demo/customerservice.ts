import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Customer, TableData} from '../../../../assets/demo/customer';
import {BehaviorSubject} from 'rxjs';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';

@Injectable()
export class CustomerService {

  customer: Customer[];
  getCustomer = new BehaviorSubject<Customer[]>(null);

  constructor(private http: HttpClient) {
  }

  getCustomersSmall() {
    return this.http.get<any>('assets/demo/data/customers-small.json')
      .toPromise()
      .then(res => res.data as Customer[])
      .then(data => data);
  }

  getCustomersMedium() {
    return this.http.get<any>('assets/demo/data/customers-medium.json')
      .toPromise()
      .then(res => res.data as Customer[])
      .then(data => data);
  }

  getCustomersLarge() {
    return this.http.get<Customer[]>('assets/demo/data/vendor-invoice-master-data.json', {observe: 'response'});
  }

  getCustomers() {
    return this.http.get<any>('assets/demo/data/vendor-invoice-master-data.json')
      .toPromise()
      .then(res => res.data as Customer[])
      .then(data => data);
  }


  getCustomersEmptyData() {
    return this.http.get<any>('assets/demo/data/empty-customer-data.json')
      .toPromise()
      .then(res => res.data as Customer[])
      .then(data => data);
  }



  getBillPaymentColumnData() {
    return this.http.get<TableColumnsDto>('assets/demo/data/bill-payment-column-data.json')
      .toPromise()
      .then(res => res as TableColumnsDto)
      .then(data => data);
  }

  getBillPaymentMasterData() {
    return this.http.get<Customer[]>('assets/demo/data/bill-payment-master-data.json', {observe: 'response'});
  }

  getPOColumnData() {
    return this.http.get<TableColumnsDto>('assets/demo/data/vendor-po-column-data.json')
      .toPromise()
      .then(res => res as TableColumnsDto)
      .then(data => data);
  }

  getPOMasterData() {
    return this.http.get<Customer[]>('assets/demo/data/vendor-po-master-data.json', {observe: 'response'});
  }

  getPRColumnData() {
    return this.http.get<TableColumnsDto>('assets/demo/data/pr-column-data.json')
      .toPromise()
      .then(res => res as TableColumnsDto)
      .then(data => data);
  }

  getPRMasterData() {
    return this.http.get<Customer[]>('assets/demo/data/pr-master-data.json', {observe: 'response'});
  }

  getVendorInvitationColumnData() {
    return this.http.get<TableColumnsDto>('assets/demo/data/vendor-invitation-column-data.json')
      .toPromise()
      .then(res => res as TableColumnsDto)
      .then(data => data);
  }

  getVendorInvitationMasterData() {
    return this.http.get<Customer[]>('assets/demo/data/vendor-invitation-master-data.json', {observe: 'response'});
  }

  getVendorRequestColumnData() {
    return this.http.get<TableColumnsDto>('assets/demo/data/vendor-request-column-data.json')
      .toPromise()
      .then(res => res as TableColumnsDto)
      .then(data => data);
  }

  getVendorRequestMasterData() {
    return this.http.get<Customer[]>('assets/demo/data/vendor-request-master-data.json', {observe: 'response'});
  }

  getUserColumnData() {
    return this.http.get<TableColumnsDto>('assets/demo/data/user-column-data.json')
      .toPromise()
      .then(res => res as TableColumnsDto)
      .then(data => data);
  }

  getUserMasterData() {
    return this.http.get<Customer[]>('assets/demo/data/user-master-data.json', {observe: 'response'});
  }

  getRoleColumnData() {
    return this.http.get<TableColumnsDto>('assets/demo/data/role-column-data.json')
      .toPromise()
      .then(res => res as TableColumnsDto)
      .then(data => data);
  }

  getRoleMasterData() {
    return this.http.get<Customer[]>('assets/demo/data/role-master-data.json', {observe: 'response'});
  }

  getItemColumnData() {
    return this.http.get<TableColumnsDto>('assets/demo/data/item-column-data.json')
      .toPromise()
      .then(res => res as TableColumnsDto)
      .then(data => data);
  }

  getItemMasterData() {
    return this.http.get<Customer[]>('assets/demo/data/item-master-data.json', {observe: 'response'});
  }

}
