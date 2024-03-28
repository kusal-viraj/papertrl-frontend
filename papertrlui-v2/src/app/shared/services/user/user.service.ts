import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {DropdownDto} from '../../dto/common/dropDown/dropdown-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {map} from 'rxjs/operators';
import {UserMasterDto} from '../../dto/user/user-master-dto';
import {AppConstant} from '../../utility/app-constant';
import {DomSanitizer} from '@angular/platform-browser';
import {PasswordResetDto} from '../../../modules/admin/password-reset/password-reset.component';
import {CommonUtility} from '../../utility/common-utility';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  getUpdatedProfilePicPath: BehaviorSubject<any> = new BehaviorSubject<any[]>(null);
  private commonUtil = new CommonUtility();
  public updateTableData = new BehaviorSubject<boolean>(false);
  public changeMainTabSet = new BehaviorSubject(null);

  constructor(public http: HttpClient, public sanitizer: DomSanitizer) {
  }

  /**
   * Create a Single User Data
   * @param masterDto to dto
   */
  createUser(masterDto: UserMasterDto) {
    return this.http.post(ApiEndPoint.API_URL + '/user_management/sec_create_user_v2', this.getUserFormData(masterDto),
      {observe: 'response', withCredentials: true});
  }

  createVendorUser(masterDto: UserMasterDto) {
    return this.http.post(ApiEndPoint.API_URL + '/user_management/sec_create_vendor_user_from_tenant', this.getUserFormData(masterDto),
      {observe: 'response', withCredentials: true});
  }

  getUserFormData(object) {
    const formData = new FormData();
    for (const key in object) {
      this.commonUtil.appendFormData(formData, key, object[key]);
    }
    return formData;
  }

  /**
   * upload user list
   * @param file to uploaded file
   */
  uploadUserList(file: File) {
    const formData = new FormData();
    formData.set('file', file);
    return this.http.post(ApiEndPoint.API_URL + '/user_management/sec_upload_user_list_v2',
      formData, {observe: 'response', withCredentials: true});
  }

  /**
   * Get a Single User Data
   * @param idParam to user id
   */
  getUser(idParam) {
    return this.http.post<UserMasterDto>(ApiEndPoint.API_URL + '/user_management/sec_view_user', {},
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * Get Roles DropDown Data
   */
  getRoles(userId, isSearch, isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get(ApiEndPoint.API_URL + '/role_management/sec_view_role_dropdown_v2',
      {params: {userId, isSearch, isCreate}, observe: 'response'});
  }

  /**
   * Get Status DropDown Data
   */
  getStatuses() {
    return this.http.get<DropdownDto[]>('assets/demo/data/dropdowns/user/status.json',
      {observe: 'response'});
  }

  /**
   * Get Approval Groups DropDown Data
   */
  getApprovalGroupsWithNoApproval(isCreate?) {
    if (isCreate == null) {
      isCreate = false;
    }
    return this.http.get(ApiEndPoint.API_URL + '/user_management/sec_view_approval_group_list_with_no_approval_group_option_v2',
      {observe: 'response', params: {isCreate}});
  }

  /**
   * Update User
   * @param userMasterDto to user dto
   */
  updateUser(userMasterDto: UserMasterDto) {
    return this.http.put(ApiEndPoint.API_URL + '/user_management/sec_update_user_v2',
      this.getUserFormData(userMasterDto), {observe: 'response', withCredentials: true});
  }

  /**
   * Update user status
   * @param idParam to user id
   */
  deleteUser(idParam) {
    return this.http.delete(ApiEndPoint.API_URL + '/user_management/sec_delete_user',
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * Unlock a Single User Data
   * @param idParam to user id
   */
  changeUserStatus(idParam) {
    return this.http.put(ApiEndPoint.API_URL + '/user_management/sec_toggle_user_status', {},
      {observe: 'response', params: {id: idParam}});
  }

  /**
   * Get User Table Data columns
   *
   */
  getUserTableColumns() {
    return this.http.get<TableColumnsDto>('assets/demo/data/tables/user-column-data.json', {observe: 'response'});
  }

  /**
   * Get User Data for table
   * @param searchFilterDto TableSearchFilterDataDto
   */
  getUserTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post<any[]>(ApiEndPoint.API_URL + '/user_management/sec_search_users_v2  ', searchFilterDto,
      {observe: 'response', withCredentials: true});
  }

  /**
   * Update table state
   */
  updateTableState(tableDataOptions: TableDataOptionsDto) {
    return this.http.put<any[]>('', {observe: 'response'});
  }

  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getUserListBulkActionData() {
    return this.http.get<any[]>('assets/demo/data/tables/user-bulk-button-data.json', {observe: 'response'});
  }

  /**
   * This service use for download approval group upload template
   */
  downloadUserListUploadTemplate() {
    return this.http
      .get(ApiEndPoint.API_URL + '/user_management/sec_download_userlist_template_v2',
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
   * password reset from manage users
   * @param user to user dto
   */

  adminPasswordReset(user: PasswordResetDto) {
    return this.http.put(ApiEndPoint.API_URL + '/user_management/sec_admin_password_reset_v2',
      user, {observe: 'response', withCredentials: true});
  }

  /**
   * This service use for check availability of user mail
   */
  checkUserEmailAvailability(emailParam) {
    return this.http.get(ApiEndPoint.API_URL + '/user_management/sec_check_user_email_availability',
      {params: {email: emailParam}, withCredentials: true, observe: 'response'});
  }

  /**
   * This method use for download profile pic
   * @param userDto UserMasterDto
   */
  public downloadProfilePic(userDto: UserMasterDto) {
    const idPram: any = userDto.id;
    return this.http
      .get(ApiEndPoint.API_URL + '/user_management/sec_download_profile_pic',
        {
          params: {id: idPram},
          responseType: 'blob'
          , withCredentials: true
        })
      .pipe(map(res => {
        return {
          filename: userDto.proPicName,
          data: new Blob([res], {type: userDto.proPicContentType})
        };
      }))
      .subscribe(res => {
        const url = window.URL.createObjectURL(res.data);
        userDto.proficServerPath = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        localStorage.setItem(AppConstant.SESSION_USER_ATTR, JSON.stringify(userDto));
      }, error => {
      });
  }

  updateUserProfile(user) {
    const formData = new FormData();
    formData.set('id', user.id + '');
    formData.set('name', user.name);
    formData.set('userName', user.username);
    formData.set('email', user.email);
    formData.set('nicPassportNo', user.nicPassportNo);
    if (undefined !== user.profilePic) {
      formData.set('profilePic', user.profilePic);
    }
    return this.http.put(ApiEndPoint.API_URL + '/user_management/sec_update_profile',
      formData, {observe: 'response', withCredentials: true});
  }

  ownPasswordReset(user) {
    return this.http.put(ApiEndPoint.API_URL + '/user_management/sec_own_password_reset_v2',
      user, {observe: 'response', withCredentials: true});
  }

  /**
   * Update user status
   * @param ids to user ids
   */
  deleteUserList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/user_management/sec_delete_user_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  /**
   * Update user status
   * @param ids to user ids
   */
  activeUserList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/user_management/sec_activate_user_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  /**
   * Update user status
   * @param ids to user ids
   */
  inactiveUserList(ids) {
    return this.http.put(ApiEndPoint.API_URL + '/user_management/sec_inactivate_user_bulk_v2', ids,
      {observe: 'response', withCredentials: true});
  }

  getUploadedPercentage(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/user_management/sec_get_user_upload_percentage',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }

  getUploadedFileIssue(userId) {
    return this.http.get(ApiEndPoint.API_URL + '/user_management/sec_get_user_upload_issues',
      {observe: 'response', withCredentials: true, params: {uuid: userId}});
  }
}
