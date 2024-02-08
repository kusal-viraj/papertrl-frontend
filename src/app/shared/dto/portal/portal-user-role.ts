import {SubAccountRoleGrantPrivileges} from './sub-account-role-grant-privileges';

export class PortalUserRole {
  public roleId: number;
  public roleName: string;
  public previlageList: any[] = [];
  public subAccountPrivilegeList: SubAccountRoleGrantPrivileges[] = [];
}
