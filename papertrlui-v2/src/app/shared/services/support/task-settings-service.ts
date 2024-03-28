import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiEndPoint} from '../../utility/api-end-point';
import {TaskSettingsDto} from '../../dto/support/task-setting-dto';
import {NotificationService} from '../notification/notification.service';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';

@Injectable({
  providedIn: 'root'
})
export class TaskSettingsService {
  constructor(private httpClient: HttpClient, public notificationService: NotificationService) {
  }

  getTenantIdList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/tenant_management/sec_get_all_tenants', {
      withCredentials: true, observe: 'response'
    });
  }

  getCommonUrlIdList() {
    return this.httpClient.get<DropdownDto[]>(ApiEndPoint.API_URL + '/tenant_management/sec_get_common_urls', {
      withCredentials: true,
      observe: 'response'
    });
  }

  createTaskSettings(taskSettingsDto: TaskSettingsDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_create_settings_task', taskSettingsDto,
      {observe: 'response', withCredentials: true});
  }


  /**
   * Get expense table Data
   */
  getTaskTableColumns() {
    return this.httpClient.get<TableColumnsDto>('assets/demo/data/support-task-list.json', {observe: 'response'});
  }

  /**
   * Get task table data
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getTaskTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/tenant_management/sec_search_settings_task',
      searchFilterDto, {withCredentials: true, observe: 'response'}
    );
  }

  deleteTask(tenantId, id) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/tenant_management/sec_delete_settings_task', {}, {
      observe: 'response', params: {tenantId, id}
    });
  }

}
