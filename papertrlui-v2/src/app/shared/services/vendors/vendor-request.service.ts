import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ApiEndPoint} from '../../utility/api-end-point';

@Injectable({
  providedIn: 'root'
})
export class VendorRequestService {
  getValues = new BehaviorSubject<any[]>(null);

  constructor(public http: HttpClient) {
  }

  /**
   * Get Vendor Request List
   */
  getVendorRequestTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_search_vendor_request_v2',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }


  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getUserListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/vendor-request-bulk-button-data.json', {observe: 'response'});
  }

  approveRequest(requestId: any) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_approve_vendor_request_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {requestId}
    });
  }

  rejectRequest(requestId: any) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_vendor_request_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {requestId}
    });
  }

  deleteRequest(requestId: any) {
    return this.http.delete(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_vendor_request_v2', {
      observe: 'response',
      withCredentials: true,
      params: {requestId}
    });
  }

  bulkRequestApprove(requestIds: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_approve_bulk_request_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {requestIds}
    });
  }

  bulkRequestReject(requestIds: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_reject_bulk_request_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {requestIds}
    });
  }

  bulkRequestDelete(requestIds: any[]) {
    return this.http.put(ApiEndPoint.API_URL + '/vendor_portal/sec_delete_bulk_vendor_request_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {requestIds}
    });
  }
}
