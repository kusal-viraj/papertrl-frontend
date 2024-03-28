import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {AccountService} from "../../../shared/services/accounts/account.service";
import {AccountListComponent} from "../account-list/account-list.component";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

export class AccountState {
  public activeTab?: any;
  public roleCreate?: any;
  public userCreate?: any;
  public uploadUser?: any;
  public listUser?: any;
}

@Component({
  selector: 'app-account-home',
  templateUrl: './account-home.component.html',
  styleUrls: ['./account-home.component.scss']
})
export class AccountHomeComponent implements OnInit, OnDestroy {
  public tabIndex: any;
  public state: AccountState = new AccountState();
  public createAccountBtn = false;
  public uploadAccountBtn = false;
  public listAccountBtn = false;
  public appAuthorities = AppAuthorities;
  public AppAnalyticsConstants = AppAnalyticsConstants;


  @ViewChild('accountListComponent') accountListComponent: AccountListComponent;

  constructor(public privilegeService: PrivilegeService, public formGuardService: FormGuardService, public accountService: AccountService) {

  }

  ngOnInit(): void {
    this.listAccountBtn = true;
    if (sessionStorage.getItem('roleState')) {
      this.state = JSON.parse(sessionStorage.getItem('roleState'));
      this.tabIndex = this.state.activeTab;
      this.createAccountBtn = this.state.userCreate;
      this.uploadAccountBtn = this.state.uploadUser;
      this.listAccountBtn = this.state.listUser;
    } else {
      this.tabIndex = 0;
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem('roleState');
  }

  /**
   * This method can be used store data in storage
   */
  storeSessionStore() {
    this.state.activeTab = this.tabIndex;
    this.state.userCreate = this.createAccountBtn;
    this.state.uploadUser = this.uploadAccountBtn;
    this.state.listUser = this.listAccountBtn;
    sessionStorage.setItem('roleState', JSON.stringify(this.state));
  }

  /**
   * This method can be used to validate appear button
   * @param val to button type param
   */

  toggleCreateUser(val) {
    if (val === 'cu') {
      this.createAccountBtn = true;
      this.uploadAccountBtn = false;
      this.listAccountBtn = false;
    } else if (val === 'vl') {
      this.uploadAccountBtn = false;
      this.createAccountBtn = false;
      this.listAccountBtn = true;
    } else {
      this.uploadAccountBtn = true;
      this.createAccountBtn = false;
      this.listAccountBtn = false;
    }
    this.storeSessionStore();
  }

  /**
   * this method can be used to get visible content
   */
  getTabAfterSuccess(event) {
    if (event !== undefined) {
      this.tabIndex = event.tabIndex;
      this.listAccountBtn = event.visible;
      this.createAccountBtn = false;
      this.refreshTableData();
    }
  }

  /**
   * Refresh account table data from another component
   */
  refreshTableData(){
    this.accountService.updateTableData.next(true);
  }
}
