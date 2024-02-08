import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {UserMasterDto} from '../../dto/user/user-master-dto';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  constructor(public httpClient: HttpClient) {
  }


  getTenantList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/get_sub_account_and_portal_dropdown',  {
      observe: 'response'
    });
  }


  filterAccordingToSelectedValue(filterValue) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/common_service/sec_export_tenant_transaction_report', filterValue, {
      responseType: 'blob',observe: 'response'
    })
      .pipe(map(res => {
        return {
          filename: 'filename.csv',
          result: res,
          data: new Blob([res.body], {type: 'text/plain'})
        };
      }));;
  }

  /**
   * get available sftp server
   * @param serverStatus to serverStatus
   */
  getAvailableSftpServers(serverStatus: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_get_supported_sftp_servers_v2', {},
      {params: {status: serverStatus}, observe: 'response', withCredentials: true});
  }

  /**
   * get available db server
   * @param dbClass to selected id
   * @param serverStatus to status
   */
  getAvailableDBServers(dbClass: string, serverStatus: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_get_supported_db_servers_v2', {},
      {params: {serverName: dbClass, status: serverStatus}, observe: 'response', withCredentials: true});
  }

  getTenantTableData(filter) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_search_tenant', filter,
      {withCredentials: true, observe: 'response'});
  }

  getTenantTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/support-tenant-list.json', {observe: 'response'});
  }


  /**
   * this method can be used to get package name list
   */
  getPackageNameList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_package_name_list',
      {withCredentials: true});
  }


  createTenant(value) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_create_tenant', value,
      {observe: 'response', withCredentials: true});
  }

  getActivityLogsTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/support-activity-list.json', {observe: 'response'});
  }

  getActivityLogsTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/support-activity-data.json', {observe: 'response'});
  }

  deleteTenant(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/tenant_management/sec_delete_tenant', {
      observe: 'response', params: {id}
    });
  }

  getSubClientList(userDto: UserMasterDto) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_sub_account_list_with_tenant_id',
      {params: {roleId: userDto.roleId.toString()}, observe: 'response'});
  }
}
