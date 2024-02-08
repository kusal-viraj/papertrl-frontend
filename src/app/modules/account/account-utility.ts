import {AccountService} from '../../shared/services/accounts/account.service';
import {DropdownDto} from '../../shared/dto/common/dropDown/dropdown-dto';

export class AccountUtility {

  public accountTypes = new DropdownDto();

  constructor(public accountService: AccountService) {
   this.getAccountTypes(this.accountTypes, false);
  }

  /**
   * this method user to get accounts types
   */
  getAccountTypes(listInstance: DropdownDto, isAddNew){
    this.accountService.getAccountTypes().subscribe((res: any) => {
      listInstance.data = (res);
      if (isAddNew){
        listInstance.addNew();
      }
    });
  }
}
