import {Injectable} from '@angular/core';
import {ApiEndPoint} from "../../utility/api-end-point";
import {HttpClient} from "@angular/common/http";
import {TableSearchFilterDataDto} from "../../dto/table/table-search-filter-data-dto";

@Injectable({
  providedIn: 'root'
})
export class PortalDashboardService {

  constructor(public http: HttpClient) {
  }

  getSubAccountList() {
    return this.http.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_role_privileged_sub_account_dropdown_list', {
      observe: 'response'
    });
  }

  getBillTableData(fromDate, toDate) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_portal_bill_search_grid_v2', {},
      {params: {fromDate, toDate}, observe: 'response'});
  }

  getBillPaymentTableData(fromDate, toDate) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_portal_bill_payment_search_grid_v2', {},
      {params: {fromDate, toDate}, observe: 'response'});
  }

  getExpenseTableData(fromDate, toDate) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_portal_expense_search_grid_v2', {},
      {params: {fromDate, toDate}, observe: 'response'});
  }

  getPoTableData(fromDate, toDate) {
    return this.http.post(ApiEndPoint.API_URL + '/vendor_portal/sec_get_portal_po_search_grid_v2', {},
      {params: {fromDate, toDate}, observe: 'response'});
  }

}
