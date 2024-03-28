export class Roles {
  roleId: any;
  roleName: any;
  previlageList: any[];
  subAccounts: SubAccountPrivileges[];
}

export class SubAccountPrivileges {
  id: any;
  previlageList: any[];
  fieldList: any[];
}
export class RolesBeforeSubmitObj {
  previlageList: any[];
  fieldList: any[];
  selectedPrivilegeNodes: any[];
  selectedFieldsNodes: any[];
  id: any;
  name: any;
}
