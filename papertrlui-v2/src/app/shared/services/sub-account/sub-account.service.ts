import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {SubAccountMasterDto} from '../../dto/sub-account/sub-account-master-dto';
import {BehaviorSubject} from "rxjs";
import {CommonUtility} from '../../utility/common-utility';

@Injectable({
  providedIn: 'root'
})
export class SubAccountService {
  constructor(public httpClient: HttpClient) { }
  private commonUtil = new CommonUtility();
  public subAccountRefresh = new BehaviorSubject(null);

  getUpdatedSubAccounts: BehaviorSubject<any> = new BehaviorSubject<any[]>(null);

  /**
   * Convert objects into forms
   */
  getFormData(object) {
    const formData = new FormData();
    for (const key in object) {
      this.commonUtil.appendFormData(formData, key, object[key]);
    }
    return formData;
  }

  /**
   * Get Sub Account table data
   */
  getSubAccountTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/tables/sub-account-column-data.json', {observe: 'response'});
  }
  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getSubAccountListBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/sub-account-bulk-button-data.json', {observe: 'response'});
  }

  /**
   * Get Sub Account Data
   * @param searchFilterDto to searchFilterDto
   */
  getSubAccountTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_search_sub_account_v2',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }
   createSubAccount(subAccountMasterDto: SubAccountMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_create_sub_account_v2', this.getFormData(subAccountMasterDto),
      {observe: 'response', withCredentials: true});
  }

   updateSubAccount(subAccountMasterDto: SubAccountMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/tenant_management/sec_edit_sub_account', this.getFormData(subAccountMasterDto),
      {observe: 'response', withCredentials: true});
  }

   viewSubAccount(idParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_view_sub_account',
      {params: {id: idParam}, observe: 'response', withCredentials: true});
  }

  /**
   * change account status
   * @param idParam to account id
   */
  changSubAccountStatus(idParam) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/tenant_management/sec_toggle_sub_account_status', {},
      {observe: 'response', withCredentials: true, params: {id: idParam}});
  }

  /**
   * Update user status
   * @param ids to user ids
   */
  deleteSubAccountList(ids) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/tenant_management/sec_delete_sub_account_bulk_v2',
      {observe: 'response', withCredentials: true, params: {idList: ids}});
  }

  /**
   * Update user status
   * @param ids to user ids
   */
  activeSubAccountList(ids) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/tenant_management/sec_activate_sub_account_bulk_v2', {},
      {observe: 'response', withCredentials: true, params: {idList: ids}});
  }

  /**
   * Update user status
   * @param ids to user ids
   */
  inactiveSubAccountList(ids) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/tenant_management/sec_inactivate_sub_account_bulk_v2', {},
      {observe: 'response', withCredentials: true, params: {idList: ids}});
  }

}
