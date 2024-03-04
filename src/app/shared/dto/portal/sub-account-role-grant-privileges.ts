export class SubAccountRoleGrantPrivileges {
  public subAccountId: number;
  public subAccountName: string;
  public modified: boolean;
  public rolePrivilegeList: any[] = [];
  public subAccountPrivilegeList: any[] = [];
  hasPrivilege: boolean;
}
