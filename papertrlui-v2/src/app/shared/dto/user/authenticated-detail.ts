import {UserMasterDto} from './user-master-dto';
export class AuthenticatedDetail {
  public userMst = new UserMasterDto();
  public encryptedUserName = '';
  public csrfToken: string;
  public sessionid: string;
  public authenticated: boolean;
  constructor() {
  }
}
