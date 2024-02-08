import { Injectable } from '@angular/core';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(public httpClient: HttpClient) { }

  getEmailTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<TableColumnsDto>(ApiEndPoint.API_URL + '/tenant_management/sec_get_all_emails_list',
      searchFilterDto, {observe: 'response'});

  }

  resendEmail(emailId, tenantId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_send_email', {},
      {observe: 'response', params: {tenantId, emailId}});
  }

  getTenantIdList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_all_tenants', {withCredentials: true});
  }
}
