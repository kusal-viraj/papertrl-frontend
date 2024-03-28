import {SubAccountRoleGrantPrivileges} from './sub-account-role-grant-privileges';

export class PortalUserRole {
  public roleId: number;
  public roleName: string;
  public privilegeList: any[] = [];
  public subAccountPrivilegeList: SubAccountRoleGrantPrivileges[] = [];
}
