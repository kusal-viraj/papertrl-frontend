import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {ProjectCodeMasterDto} from '../../dto/project code/project-code-master-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {map} from 'rxjs/operators';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProjectCodeService {
  public updateTableData = new BehaviorSubject<boolean>(false);
  constructor(public http: HttpClient) {
  }

  /**
   * Get Table Columns
   */
  getCodeTableColumns() {
    return this.http.get<TableColumnsDto>('assets/demo/data/tables/project-code-column-data.json', {observe: 'response'});
  }

  /**
   * Get User Data for table
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getCodeTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/common_service/sec_search_project_code_v2', searchFilterDto,
      {observe: 'response', withCredentials: true});
  }

  /**
   * Update table state
   */
  updateApprovalCode(projectCodeMasterDto: ProjectCodeMasterDto) {
    return this.http.put<string>(ApiEndPoint.API_URL + '/common_service/sec_update_approval_code', projectCodeMasterDto,
      {observe: 'response', withCredentials: true});
  }

  /**
   * Create table state
   */
  createProjectCode(projectCodeMasterDto: ProjectCodeMasterDto) {
    return this.http.post<string>(ApiEndPoint.API_URL + '/common_service/sec_create_approval_code_v2', projectCodeMasterDto,
      {observe: 'response', withCredentials: true});
  }

  uploadCodeList(file: File) {
    const formData = new FormData();
    formData.set('file', file);
    return this.http.post(ApiEndPoint.API_URL + '/common_service/sec_upload_project_code_list_v2',
      formData, {observe: 'response', withCredentials: true});
  }

  public downloadApprovalCodeTemplate() {
    return this.http
      .get(ApiEndPoint.API_URL + '/common_service/sec_download_approval_template',
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
   * Unlock a Single User Data
   * @param idParam to user id
   */
  changeProjectCodeStatus(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_toggle_active_status_v2', {},
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getProjectCodeBulkButtonData() {
    return this.http.get<any[]>('assets/demo/data/tables/project-code-bulk-button.json', {observe: 'response'});
  }

  /**
   * Get a Single User Data
   * @param idPram to projectCodeID
   */
  getProjectDetails(idPram) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_view_code_level',
      {params: {id: idPram}, observe: 'response', withCredentials: true});
  }

  getProjectDataToDetailView(projectCodeId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/get_project_code_by_id',
      {params: {projectCodeId}, observe: 'response', withCredentials: true});
  }

  getUploadedPercentage(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_project_code_upload_percentage_v2',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  getUploadedFileIssue(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_project_code_upload_issues_v2',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  /*
   * Signal Actions---------------------------------------------------------------------------------------->
   */

  activeProjectCode(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_activate_project_code_v2', {},
      {observe: 'response', params: {id: idParam}});
  }

  inactiveProjectCode(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_inactivate_project_code_v2', {},
      {observe: 'response', params: {id: idParam}});
  }

  deleteProjectCode(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_delete_project_code_v2', {},
      {observe: 'response', params: {id: idParam}});
  }


  /*
   * Bulk Actions---------------------------------------------------------------------------------------->
   */
  deleteProjectCodeList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_delete_project_code_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  activeProjectCodeList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_activate_project_code_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  inactiveProjectCodeList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/common_service/sec_inactivate_project_code_bulk_v2', ids,
      {observe: 'response', withCredentials: true, params: {idList: ids}});
  }


  getProjectBillTableData(searchFilterDto: TableSearchFilterDataDto, projectCodeId) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/common_service/load_data_grid_by_project_code_id', searchFilterDto,
      {observe: 'response', withCredentials: true, params: {projectCodeId}});
  }

  /**
   * This service user for get user list
   * @param isCreate if in a create screen true
   * @param projectCodeId to project code id
   */
  getUserList(isCreate?, projectCodeId?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get<DropdownDto[]>(ApiEndPoint.API_URL + '/common_service/sec_get_userlist_dropdown_for_project_code',
      {observe: 'response', params: {isCreate, projectCodeId}});
  }

  /**
   * This service user for get user list
   * @param isCreate if in a create screen true
   * @param projectCodeId to project code id
   */
  getAccountList(isCreate?, projectCodeId?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get(ApiEndPoint.API_URL + '/common_service/sec_get_account_dropdown_list_for_project_code',
      {params: {isCreate, projectCodeId}});
  }
}
