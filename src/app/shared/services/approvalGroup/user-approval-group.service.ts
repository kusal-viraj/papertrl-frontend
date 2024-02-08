import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {ApprovalGroupMasterDto} from '../../dto/approval group/approval-group-master-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {BulkButtonActionDto} from '../../dto/common/bulk-button-action-dto';
import {map} from 'rxjs/operators';
import {ApiEndPoint} from '../../utility/api-end-point';
import {MessageService} from 'primeng/api';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserApprovalGroupService {
  public updateTableData = new BehaviorSubject<boolean>(false);

  constructor(public httpClient: HttpClient, public messageService: MessageService) {
  }

  /**
   * This service user for create approval group
   * @param requestApprovalGroup RequestApprovalGroupDto
   */
  createApprovalGroup(requestApprovalGroup: ApprovalGroupMasterDto) {
    return this.httpClient.post(ApiEndPoint.API_URL + '/approval_level_management/sec_create_approval_level'
      , requestApprovalGroup, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get approval group object by approvalGroupId
   * @param idPram number
   */
  public viewApprovalLevel(idPram) {
    return this.httpClient.get(ApiEndPoint.API_URL + '/approval_level_management/sec_view_approval_level',
      {params: {id: idPram}, observe: 'response', withCredentials: true});
  }

  /**
   * This service use for update approval group
   * @param requestApprovalGroup RequestApprovalGroupDto
   */
  updateApprovalGroup(requestApprovalGroup: ApprovalGroupMasterDto) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/approval_level_management/sec_update_approval_level'
      , requestApprovalGroup, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for deleteExpense approval group
   * @param approvalGroupId number
   */
  deleteApprovalGroup(approvalGroupId) {
   return this.httpClient.delete(ApiEndPoint.API_URL + '/approval_level_management/sec_delete_approval_level',
     {params: {id: approvalGroupId}, observe: 'response', withCredentials: true});
  }

  /**
   * Get Approval Group Data
   * @param searchFilterDto
   */
  getApprovalGroupTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.httpClient.post<any[]>(ApiEndPoint.API_URL + '/approval_level_management/sec_search_approval_group_v2',
      searchFilterDto, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getApprovalGroupListBulkActionData() {
    return this.httpClient.get<BulkButtonActionDto[]>('assets/demo/data/tables/approval-group-bulk-button-data.json',
      {observe: 'response'});
  }

  /**
   * Update table state
   */
  updateTableState(tableDataOptions: TableDataOptionsDto) {
    return this.httpClient.put<any[]>('', {observe: 'response'});
  }

  /**
   * This service use for download approval group upload template
   */
  downloadApprovalGroupUploadTemplate() {
    return this.httpClient
      .get(ApiEndPoint.API_URL + '/approval_level_management/sec_download_approval_group_temp',
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
   * This service use for check availability of approval group name
   */
  checkApprovalLevelAvailability(approvalLevel: ApprovalGroupMasterDto) {
    if (undefined !== approvalLevel.name && null != approvalLevel.name) {
      return this.httpClient.post(ApiEndPoint.API_URL + '/approval_level_management/sec_check_approval_level_availability', approvalLevel,
        {withCredentials: true});
    }
  }

  /**
   * This service use for upload approval group file
   */
  uploadApprovalGroupUploadTemplate(file: File) {
    const formData = new FormData();
    formData.set('file', file);
    return this.httpClient.post(ApiEndPoint.API_URL + '/approval_level_management/sec_upload_approval_level_v2',
      formData, {observe: 'response', withCredentials: true});
  }

  /**
   * this method can be used to inactivated approval group
   */
  changeApprovalGroupStatus(idParam){
    return this.httpClient.put(ApiEndPoint.API_URL + '/approval_level_management/sec_toggle_approve_level_active_status', {},
      {params: {id: idParam}, observe: 'response', withCredentials: true});
  }


  activeSingalApprovalGroup(idParam){
    return this.httpClient.put(ApiEndPoint.API_URL + '/approval_level_management/sec_activate_approval_group_v2', {},
      {params: {id: idParam}, observe: 'response', withCredentials: true});
  }

  inactiveSingalApprovalGroup(idParam){
    return this.httpClient.put(ApiEndPoint.API_URL + '/approval_level_management/sec_inactivate_approval_group_v2', {},
      {params: {id: idParam}, observe: 'response', withCredentials: true});
  }

  /**
   * Update user status
   * @param ids to user ids
   */
  deleteApprovalGroupList(ids) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/approval_level_management/sec_delete_approval_group_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  /**
   * Update user status
   * @param ids to user ids
   */
  activeApprovalGroupList(ids) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/approval_level_management/sec_activate_approval_group_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  /**
   * Update user status
   * @param ids to user ids
   */
  inactiveApprovalGroupList(ids) {
    return this.httpClient.put(ApiEndPoint.API_URL + '/approval_level_management/sec_inactivate_approval_group_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  getUploadedPercentage(userId){
    return this.httpClient.get(ApiEndPoint.API_URL + '/user_management/sec_get_approval_group_upload_percentage',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  getUploadedFileIssue(userId){
    return this.httpClient.get(ApiEndPoint.API_URL + '/user_management/sec_get_approval_upload_issues',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }
}
