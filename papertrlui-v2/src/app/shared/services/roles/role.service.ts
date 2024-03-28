import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {TableColumnsDto} from '../../dto/table/table-columns-dto';
import {RoleMasterDto} from '../../dto/role/role-master-dto';
import {TableSearchFilterDataDto} from '../../dto/table/table-search-filter-data-dto';
import {TableDataOptionsDto} from '../../dto/table/table-data-options-dto';
import {ApiEndPoint} from '../../utility/api-end-point';
import {AppConstant} from '../../utility/app-constant';
import {PortalUserRole} from '../../dto/portal/portal-user-role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  getValues = new BehaviorSubject<any[]>(null);
  public updateTableData = new BehaviorSubject<boolean>(false);
  public updatePortalTableData = new BehaviorSubject<boolean>(false);

  constructor(public http: HttpClient) {
  }


  /**
   * This service use for get user list bulk action button data form endpoint
   */
  getRoleListBulkActionData() {
    return this.http.get<any[]>('assets/demo/data/tables/role-bulk-button-data.json', {observe: 'response'});
  }

  /**
   * Update table state
   */
  updateTableState(tableDataOptions: TableDataOptionsDto) {
    return this.http.put<any[]>('', tableDataOptions, {observe: 'response'});
  }

  public getInitialSystemRoles() {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/view_role_menu_list_v2', {observe: 'response'});
  }

  public getRoleWisePrivilegeStructure(roleId) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/sec_get_role_wise_privilege_list_structure_v2',
      {params: {roleId}, observe: 'response'});
  }

  public getPortalMenuList() {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/sec_view_portal_menu_list_v2', {observe: 'response'});
  }

  public getSubAccountMenuList() {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/sec_view_subAccount_menu_list_v2', {observe: 'response'});
  }

  public getPortalRoleWisePrivilegeStructure(roleId) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/sec_get_portal_role_wise_privilege_list_structure_v2',
      {params: {roleId}, observe: 'response'});
  }

  public getSubAccountRoleWisePrivilegeStructure(roleId) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/sec_get_sub_account_role_wise_privilege_list_structure_v2',
      {params: {roleId}, observe: 'response'});
  }

  public getRoleSelectedMenu(roleId: any) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/view_role_selected_menu_list_v2', {
      params: {roleId},
      observe: 'response'
    });
  }

  public getPortalRoleSelectedMenu(roleId: any) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/sec_view_portal_role_privilege_list_v2', {
      params: {roleId},
      observe: 'response'
    });
  }

  public getSelectedAllSubAccountRolePrivileges(roleIdParam) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/sec_view_all_sub_account_role_privilege_list_v2', {
      params: {roleId: roleIdParam},
      observe: 'response'
    });
  }

  getRoleSelectedFields(roleId: any) {
    return this.http.get<any>(ApiEndPoint.API_URL + '/role_management/view_role_selected_field_list_v2', {
      params: {roleId},
      observe: 'response'
    });
  }


  getRoles() {
    return this.http.get<any>('assets/demo/data/edit-data/roles-view-data.json', {observe: 'response'});
  }

  getRoleTableData(searchFilterDto: TableSearchFilterDataDto) {
    return this.http.post(ApiEndPoint.API_URL + '/role_management/sec_search_role_v2', searchFilterDto,
      {observe: 'response'}).toPromise();
  }

  createRole(roleRequestDto: RoleMasterDto) {
    // for (const entry of roleRequestDto.previlageList) {
    //   entry.__proto__ = null;
    //   entry.children = null;
    //   entry.parent = null;
    // }

    return this.http.post(ApiEndPoint.API_URL + '/role_management/create_role_v2', roleRequestDto,
      {
        observe: 'response'
      });
  }

  updateRole(roleRequestDto: RoleMasterDto) {
    // for (const entry of roleRequestDto.previlageList) {
    //   entry.__proto__ = null;
    //   entry.children = null;
    //   entry.parent = null;
    // }

    return this.http.put(ApiEndPoint.API_URL + '/role_management/update_role_v2', roleRequestDto,
      {
        observe: 'response'
      });
  }


  deleteRole(id) {
    return this.http.delete(ApiEndPoint.API_URL + '/role_management/sec_delete_role', {
      observe: 'response',
      params: {id}
    });
  }

  activateRole(id: any) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_activate_role_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {id}
    });
  }

  inActivateRole(id: any) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_inactivate_role_v2', {}, {
      observe: 'response',
      withCredentials: true,
      params: {id}
    });
  }

  activateRoleList(idList: any) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_activate_role_bulk_v2', idList,
      {observe: 'response', withCredentials: true});
  }

  inActivateRoleList(idList: any) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_inactivate_role_bulk_v2', idList,
      {observe: 'response', withCredentials: true});
  }

  deleteRoleList(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_delete_role_bulk_v2', idList,
      {observe: 'response', withCredentials: true});
  }

  checkRoleNameAvailability(roleName) {
    return this.http.post(ApiEndPoint.API_URL + '/role_management/sec_check_role_name_availability_v2',
      {}, {params: {roleName}, withCredentials: true});
  }

  checkRoleNameAvailabilityByRoleId(roleName, roleId) {
    return this.http.get(ApiEndPoint.API_URL + '/role_management/sec_check_role_name_availability_by_role_id_v2',
      {params: {roleName, roleId}, observe: 'response'});
  }

  getDisplayableOptionalFields(documentTypeParam: any) {
    return this.http.get(ApiEndPoint.API_URL + '/role_management/sec_get_displayable_optional_fields_v2', {
      params: {documentType: documentTypeParam},
      observe: 'response'
    });
  }

  createPortalRole(portalRolePrivilegeDto: PortalUserRole) {
    return this.http.post(ApiEndPoint.API_URL + '/role_management/sec_create_portal_role_v2', portalRolePrivilegeDto,
      {
        observe: 'response'
      });
  }

  updatePortalRole(portalRolePrivilegeDto: PortalUserRole) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_update_portal_role_v2', portalRolePrivilegeDto,
      {
        observe: 'response'
      });
  }

  getSubAccountList() {
    return this.http.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_sub_account_dropdown_list', {
      observe: 'response'
    }).toPromise();
  }

  activatePortalRole(id: any) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_active_portal_role_v2', {}, {
      observe: 'response',
      params: {id}
    });
  }

  activatePortalRoleList(idList: any) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_active_portal_role_bulk_v2', idList,
      {observe: 'response'});
  }

  inactivatePortalRole(id: any) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_inactive_portal_role_v2', {}, {
      observe: 'response',
      params: {id}
    });
  }

  inActivatePortalRoleList(idList: any) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_inactive_portal_role_bulk_v2', idList,
      {observe: 'response'});
  }

  deletePortalRole(id) {
    return this.http.delete(ApiEndPoint.API_URL + '/role_management/sec_delete_portal_role_v2', {
      observe: 'response',
      params: {id}
    });
  }

  deletePortalRoleList(idList) {
    return this.http.put(ApiEndPoint.API_URL + '/role_management/sec_delete_portal_role_bulk_v2', idList,
      {observe: 'response'});
  }

  getPrivilegedSubAccountList(roleId) {
    return this.http.get(ApiEndPoint.API_URL + '/tenant_management/sec_get_privileged_sub_account_list_v2',
      {params: {roleId}, observe: 'response'});
  }

  getSelectedRolePrivilegeList(roleId, subAccountId) {
    return this.http.get(ApiEndPoint.API_URL + '/role_management/sec_view_sub_account_role_privilege_list_v2',
      {params: {roleId, subAccountId}, observe: 'response'}).toPromise();
  }

}
