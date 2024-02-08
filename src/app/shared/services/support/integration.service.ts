import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {

  constructor(public httpClient: HttpClient) {
  }

  getConfigTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/support-config-list.json', {observe: 'response'});

  }

  getConfigTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<TableColumnsDto>(ApiEndPoint.API_URL + '/integration/sec_search_integration_configuration_v2', searchFilterDto, {observe: 'response'});
  }

  deleteConfig(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/integration/sec_delete_intergration_configuration_v2', {
      observe: 'response',
      params: {id}
    });
  }

  deleteSystem(id) {
    return this.httpClient.delete(ApiEndPoint.API_URL + '/integration/sec_delete_integration_system_v2', {
      observe: 'response',
      params: {id}
    });
  }

  getSystemTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<TableColumnsDto>(ApiEndPoint.API_URL + '/integration/sec_search_integration_systems_v2', searchFilterDto, {observe: 'response'});
  }

  getSystemTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/support-system-list.json', {observe: 'response'});

  }

  getApiEndPointServiceNameList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_service_name_list',
      {withCredentials: true});
  }

  public getIntegrationSystemList(tenantId) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_applicable_integration_systems_list_v2',
      {params: {tenantId}, withCredentials: true});
  }

  public getAllIntegrationSystemList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_systems_list_v2',
      {withCredentials: true});
  }

  public getAuthTypes() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_system_auth_types_v2',
      {withCredentials: true});
  }

  public getGrantTypes() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_system_grant_types_v2',
      {withCredentials: true});
  }

  public getScopes() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_system_scopes_v2',
      {withCredentials: true});
  }

  public getServiceNameList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_system_scopes_v2',
      {withCredentials: true});
  }

  getTenantIdList() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_tenant_list_v2', {withCredentials: true});
  }

  getTypes() {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_system_types_v2', {withCredentials: true});
  }

  getSystemExists(systemName: any, id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_system_is_exist_v2',
      {params: {systemName, id}, observe: 'response', withCredentials: true});
  }

  createIntegrationSystem(value: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/sec_create_integration_system_v2', value,
      {observe: 'response', withCredentials: true});
  }

  createConfiguration(value: any) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/integration/sec_create_integration_configuration_v2', value,
      {observe: 'response', withCredentials: true});
  }

  getIntegrationSystem(id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_system_v2', {
      params: {id},
      withCredentials: true,
      observe: 'response'
    });
  }

  getIntegrationConfiguration(id) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/integration/sec_get_integration_configuration_v2', {
      params: {id},
      withCredentials: true,
      observe: 'response'
    });
  }

}
