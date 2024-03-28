import {Component, OnInit, ViewChild} from '@angular/core';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {CreateSubAccountComponent} from '../create-sub-account/create-sub-account.component';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {SubAccountService} from '../../../shared/services/sub-account/sub-account.service';
import {SubAccountListComponent} from '../sub-account-list/sub-account-list.component';

@Component({
  selector: 'app-sub-account-home',
  templateUrl: './sub-account-home.component.html',
  styleUrls: ['./sub-account-home.component.scss']
})
export class SubAccountHomeComponent implements OnInit {
  createSubAccount = false;
  listSubAccount = false;

  appAuthorities = AppAuthorities;

  @ViewChild('createSubAccountComponent') createSubAccountComponent: CreateSubAccountComponent;
  @ViewChild('subAccountListComponent') subAccountComponent: SubAccountListComponent;

  constructor(public privilegeService: PrivilegeService, public subAccountService: SubAccountService,
              public formGuardService: FormGuardService) {
  }

  ngOnInit(): void {
    this.listSubAccount = true;
  }

  /**
   * this method identify the sub account screen
   * @param name to screen param
   */
  toggleSubAccount(name: string) {
    if (name === 'cs') {
      this.createSubAccount = true;
      this.listSubAccount = false;
    }
    if (name === 'cl') {
      this.createSubAccount = false;
      this.listSubAccount = true;
    }
  }

  isTableAccess() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.SUB_ACCOUNTS_EDIT, AppAuthorities.SUB_ACCOUNTS_DELETE,
      AppAuthorities.SUB_ACCOUNTS_INACTIVATE, AppAuthorities.SUB_ACCOUNTS_ACTIVATE]);
  }

  subAccountCreated() {
    this.createSubAccount = false;
    this.listSubAccount = true;
    this.subAccountService.subAccountRefresh.next(true);
  }
}
