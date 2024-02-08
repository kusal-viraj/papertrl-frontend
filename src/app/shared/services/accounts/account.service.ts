import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {AccountMasterDto} from '../../dto/account/account-master-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  updateTableData = new BehaviorSubject<any>(null);

  constructor(public http: HttpClient) {
  }

  /**
   * Get Account table data
   */
  getAccountTableColumns() {
    return this.http.get<TableColumnsDto>('assets/demo/data/tables/account-column-data.json', {observe: 'response'});
  }

  uploadAccountList(file: File) {
    const formData = new FormData();
    formData.set('file', file);
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_upload_account_list_v2',
      formData, {observe: 'response', withCredentials: true});
  }


  /**
   * This service use for download approval group upload template
   */
  downloadAccountListUploadTemplate() {
    return this.http
      .get(ApiEndPoint.API_URL + '/common_service/sec_download_account_import_template',
        {
          responseType: 'blob',
          withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: 'filename.pdf',
          data: new Blob([res], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
        };
      }));
  }


  /**
   * Get Account Data
   * @param searchFilterDto
   */
  getAccountTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_search_account_v2', searchFilterDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * Create Account
   * @param accountRequestDto
   */
  createAccount(accountRequestDto: AccountMasterDto) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_create_account',
      accountRequestDto, {observe: 'response', withCredentials: true});
  }

  /**
   * Update Account
   * @param accountRequestDto
   */
  updateAccount(accountRequestDto: AccountMasterDto) {
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_update_account', accountRequestDto, {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * Update table state
   */
  updateTableState(tableDataOptions: TableDataOptionsDto) {
    return this.http.put<any[]>('', {observe: 'response'});
  }

  /**
   * Get Single Account Data
   * @param accountID
   */
  getAccountDetails(accountID) {
    return this.http.get<AccountMasterDto>(ApiEndPoint.API_URL + '/common_service/sec_view_account',
      {observe: 'response', params: {accountId: accountID}});
  }

  /**
   * Get Account Detail Types
   */
  getAccountDetailTypes() {
    return this.http.get<DropdownDto[]>('assets/demo/data/dropdowns/account/accountDetailTypes.json',
      {observe: 'response'});
  }

  /**
   * Get Parent Accounts
   */
  getParentAccounts() {
    return this.http.get<DropdownDto[]>('assets/demo/data/dropdowns/account/parentAccounts.json',
      {observe: 'response'});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getAccountListBulkActionData() {
    return this.http.get<BulkButtonActionDto[]>('assets/demo/data/tables/account-bulk-button-data.json', {observe: 'response'});
  }

  public getAccountIsAvailable(accountType, accountName) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_is_available',
      {params: {typeId: accountType, number: accountName}, observe: 'response', withCredentials: true});
  }

  public getAccountDetailTypeList(listInstance: DropdownDto, accountTypeId: number) {
    if (undefined !== accountTypeId) {
      return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_detail_types', {
        params: {typeId: accountTypeId + ''},
        observe: 'response',
        withCredentials: true
      });
    }
  }

  public getParents(accountType: number, accId) {
    if (undefined !== accountType) {
      return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_parents_except', {
        params: {accountTypeId: accountType + '', accId},
        observe: 'response', withCredentials: true
      });
    }
  }

  getAccountTypes() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_types',
      {});
  }

  getAccountDetaiTypesForFilter() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_detail_types_v2',
      {observe: 'response', withCredentials: true});
  }


  getParentAccountsForFilter() {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_parents_v2', {observe: 'response', withCredentials: true});
  }

  getUploadedPercentage(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_upload_percentage_v2',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  getUploadedFileIssue(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_upload_issues_v2',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  /*
   * Signal Action------------------------------------------------------------------------------------------------->
   */

  inactiveAccount(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_inactivate_account_v2', {},
      {observe: 'response', params: {id: idParam}});
  }

  activeAccount(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_activate_account_v2', {},
      {observe: 'response', params: {id: idParam}});
  }

  deleteAccount(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_delete_account_v2', {},
      {observe: 'response', params: {id: idParam}});
  }


  /*
   * Bulk Action----------------------------------------------------------------------------------------------------->
   */

  inactiveAccountList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_inactivate_account_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  activeAccountList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_activate_account_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  deleteAccountList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_delete_account_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  /**
   * Get account popup data
   */
  getAccountPopupData(accountId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_details_dto_v2',
      {observe: 'response', params: {id: accountId}});
  }

  /**
   * this method can be used to check whether account can be edit
   * @param accountId to account master id
   */
  checkSelectedAccountWhetherCanEdit(accountId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_check_account_is_editable', {
      params: {accountId},
      observe: 'response',
      withCredentials: true
    });
  }
}
