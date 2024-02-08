import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {AppConstant} from '../../utility/app-constant';

@Injectable({
  providedIn: 'root'
})
export class AccountSyncService {

  constructor(public httpClient: HttpClient) {
  }

  /**
   * Get Category List of user has access
   */
  getCategoryList() {
    return this.httpClient.get<any[]>(ApiEndPoint.API_URL + '/integration/sec_get_integration_systems_by_tenant_v2', {observe: 'response'});
  }

  /**
   * Get Configurations to system
   */
  getConfigurationProperties(sysId) {
    return this.httpClient.get<any[]>(ApiEndPoint.API_URL + '/integration/sec_get_integration_service_properties_v2', {
      observe: 'response',
      params: {systemId: sysId}
    });
  }

  /**
   * Get Configurations to system
   */
  getConfigurationsListBc(systemId, companyId) {
    return this.httpClient.get<any[]>(ApiEndPoint.API_URL + '/integration/sec_get_integration_service_status_v2', {
      observe: 'response', params: {systemId, companyId}
    });
  }


  getSelectedCompanyList(systemId) {
    return this.httpClient.get<any[]>(ApiEndPoint.API_URL + '/integration/sec_get_selected_companies_v2', {
      observe: 'response', params: {systemId}
    });
  }


  /**
   * Get Configurations to system
   */
  getConfigurationsListQb(systemId) {
    return this.httpClient.get<any[]>(ApiEndPoint.API_URL + '/integration/sec_get_integration_service_status_v2', {
      observe: 'response', params: {systemId}
    });
  }

  /**
   * Configurations Changed
   */
  changeConfig(value) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/sec_mark_system_sync_properties_v2', value, {
      observe: 'response',
      withCredentials: true
    });
  }

  /**
   * Connect To Integration System
   */
  public getQBOnlineConnectURL() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/get_connect_url', {observe: 'response'});
  }

  public getBccOnlineConnectURL() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/get_business_central_connect_url', {observe: 'response'});
  }

  public getBBOnlineConnectURL() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/get_blackbaud_connect_url', {observe: 'response'});
  }

  public getCompanyList(systemId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/get_company_list', {observe: 'response', params:{systemId}});
  }

  public saveCompanyData(company) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/save_company_data', company,{
      observe: 'response'
    });
  }

  public clearCompanyData() {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/clear_company_data', {}, {observe: 'response'});
  }

  /**
   * Disconnect from Qb
   */
  public getDisconnectedFromQBO() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/revoke_connection', {observe: 'response'});
  }

  public disconnectFromBb() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/revoke_blackbaud_connection', {observe: 'response'});
  }

  public getDisconnectedFromBcc() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/revoke_business_central_connection', {observe: 'response'});
  }

  /**
   * Get Pending table bulk action button list
   */
  getPendingSyncAccountListBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/pending-sync-bulk-button-data.json', {observe: 'response'});
  }

  /**
   * Get failed table bulk action button list
   */
  getFailedSyncAccountListBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/pending-re-sync-bulk-button-data.json', {observe: 'response'});
  }

  /**
   * Get Pending Sync table Columns
   */
  getPendingSyncTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/tables/pending-sync-column-data.json', {observe: 'response'});
  }

  /**
   * Get Pending table data
   */
  getPendingAccountSync(searchFilterDto: TableSearchFilterDataDto, systemID) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/sec_search_pending_sync_data_v2', searchFilterDto,
      {params: {systemId: systemID}, observe: 'response'});
  }


  /**
   * Get Pending table data
   */
  getProcessingAccountSync(searchFilterDto: TableSearchFilterDataDto, systemID) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/sec_search_processing_sync_data_v2', searchFilterDto,
      {params: {systemId: systemID}, observe: 'response'});
  }

  /**
   * Get Pending table data
   */
  getCompletedAccountSync(searchFilterDto: TableSearchFilterDataDto, systemID) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/sec_search_completed_sync_data_v2', searchFilterDto, {
      params: {systemId: systemID},
      observe: 'response'
    });
  }

  /**
   * Get Pending table data
   */
  getCompletedPullAccountSync(searchFilterDto: TableSearchFilterDataDto, systemID) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/sec_search_completed_pull_sync_data_v2', searchFilterDto, {
      params: {systemId: systemID},
      observe: 'response'
    });
  }

  /**
   * Get Pending table data
   */
  getFailedAccountSync(searchFilterDto: TableSearchFilterDataDto, systemId) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/integration/sec_search_sync_failed_data_v2', searchFilterDto,
      {params: {systemId}, observe: 'response'});
  }

  getPullFailedAccountSync(searchFilterDto: TableSearchFilterDataDto, systemId) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/integration/sec_search_sync_pull_failed_data_v2', searchFilterDto,
      {params: {systemId}, observe: 'response'});
  }


  /**
   * Sync Bulk List
   */
  bulkSync(systemIds: any[], systemId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/sec_sync_selected_object_v2', systemIds, {
      observe: 'response',
      withCredentials: true,
      params: {systemId}
    });
  }

  /**
   * ReSync Bulk List
   */
  bulkReSync(systemIds: any[], systemId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/resync_failed_push_bulk_records', systemIds, {
      observe: 'response',
      withCredentials: true,
      params: {systemId}
    });
  }

    bulkReSyncFailedPull(systemIds: any[], systemId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/resync_failed_pull_bulk_records', systemIds, {
      observe: 'response',
      withCredentials: true,
      params: {systemId}
    });
  }

  /**
   * Sync one single data
   */
  sync(id: any, systemId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/sec_sync_single_object_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {id, systemId}
    });
  }

  reSync(id: any, systemId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/resync_failed_push_record', {}, {
      observe: 'response',
      withCredentials: true,
      params: {id, systemId}
    });
  }

  reSyncFailedPull(id: any, systemId) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/resync_failed_pull_record', {}, {
      observe: 'response',
      withCredentials: true,
      params: {id, systemId}
    });
  }

  userPrivileges(systemId, username, password) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_save_papertrl_credetials_v2',
      {params: {systemId, username, password}, observe: 'response', withCredentials: true});
  }

  saveBcDetails(systemId, username, password) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/integration/sec_save_bc_credentials_v2',password,
      {params: {systemId, username, }, observe: 'response', withCredentials: true});
  }

  /**
   * This service use for check availability of user mail
   */
  checkUserEmailAvailability(emailParam) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/user_management/sec_check_user_email_availability',
      {params: {email: emailParam}, withCredentials: true, observe: 'response'});
  }

  public getSystemTokenStatus(systemIid) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_token_status_v2',
      {params: {systemId: systemIid}, withCredentials: true, observe: 'response'});
  }
}
