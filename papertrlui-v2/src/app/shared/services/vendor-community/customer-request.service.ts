import {Injectable} from '@angular/core';
import {ApiEndPoint} from '../../utility/api-end-point';
import {HttpClient} from '@angular/common/http';
import {TableSearchFilterDataDto} from "../../dto/table/table-search-filter-data-dto";
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';

@Injectable({
  providedIn: 'root'
})
export class CustomerRequestService {

  constructor(public http: HttpClient) {
  }

  getCustomerList() {
    return this.http.get(ApiEndPoint.API_URL + '/vendor_portal/sec_get_applicable_customers_v2',
      {observe: 'response'});
  }

  sendCustomerRequest(customer) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_create_customer_request_v2', customer,
      {observe: 'response'});
  }

  /**
   * Get Invitation List
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getCustomerRequestTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/vendor_portal/sec_search_customer_request_v2', searchFilterDto,
      {observe: 'response'});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getUserListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/vendor-community-customer-bulk-button-data.json',
      {observe: 'response'});
  }

  deleteRequest(id: any) {
    return this.http.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_customer_request_delete_v2', {
      observe: 'response', params: {requestId: id}
    });
  }

  deleteRequestBulk(idList: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_customer_request_bulk_delete_v2', idList, {
      observe: 'response'});
  }

  resendRequest(id: any) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_customer_request_resend_v2', {}, {
      observe: 'response', params: {requestId: id}
    });
  }

  resendRequestBulk(idList: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_customer_request_bulk_resend_v2', idList, {
      observe: 'response',
    });
  }
}
