import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {map} from 'rxjs/operators';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {UomDto} from '../../dto/item/uom-dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor(public httpClient: HttpClient) {
  }

  getBillPaymentTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_invoice_payments_v2',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  getDashboardPaymentTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_vendor_dashboard_bill_payment_list',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }


  addNote(uomDto: UomDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_create_uom',
      uomDto, {observe: 'response', withCredentials: true});
  }

  getCustomerList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_get_related_customer_list',
      {observe: 'response', withCredentials: true});
  }
}
