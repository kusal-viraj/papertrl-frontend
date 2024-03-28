import {AppConstant} from '../../utility/app-constant';

export class ErpConfigDto {
  thirdPartySystemConnected: boolean;
  thirdPartySystemList: any;
  thirdPartySystemName: any;
  activePackage: any;
  thirdPartySystemConfigStatus: string;
  thirdPartySystemId: any;
  isThirdPartySystemConfig?: any;
  isThirdPartySystemPending?: any;

  constructor() {
    this.activePackage = AppConstant.PAPERTRL_SYSTEM_USERS;
  }
}
