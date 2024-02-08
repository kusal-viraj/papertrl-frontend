import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CommonSystemTaskRoutingService} from '../../../shared/services/common/common-system-task-routing/common-system-task-routing.service';
import {AppSystemTaskRouting} from '../../../shared/enums/app-system-task-routing';
import {Subscription} from 'rxjs';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {UserService} from "../../../shared/services/user/user.service";
import {RoleService} from "../../../shared/services/roles/role.service";
import {ReceiptListComponent} from "../../expense/receipt-list/receipt-list.component";
import {UserManageComponent} from "../user-manage/user-manage.component";
import {RoleManageComponent} from "../role-manage/role-manage.component";
import {PortalRoleListComponent} from '../../portal/portal-role-list/portal-role-list.component';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

export class RoleState {
  public activeTab?: any;
  public roleCreate?: any;
  public userCreate?: any;
  public uploadUser?: any;
  public listUser?: any;
  public portalRoleCreate?: any;
  public isUploadApprovalGroup?: any;
  public isListApprovalGroup?: any;
}

@Component({
  selector: 'app-settings-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit, OnDestroy {
  public state: RoleState = new RoleState();
  public subscription: Subscription;
  public tabIndex = 0;
  public createRole = false;
  public createPortalRole = false;
  public createUserBtn = false;
  public uploadUserBtn = false;
  public listUserBtn = false;
  public isUploadApprovalGroup = false;
  public isListApprovalGroup = true;
  public responsePercentage: number;
  public isNotVendor = true;
  public isPortal = false;
  public appAuthorities = AppAuthorities;

  @ViewChild('userManageComponent') public userManageComponent: UserManageComponent;
  @ViewChild('roleManageComponent') public roleManageComponent: RoleManageComponent;
  @ViewChild('portalRoleListComponent') public portalRoleListComponent: PortalRoleListComponent;



  constructor(public route: ActivatedRoute, public privilegeService: PrivilegeService,
              public commonSystemTaskRoutingService: CommonSystemTaskRoutingService, public formGuardService: FormGuardService,
              public userService: UserService, public roleService: RoleService) {

    this.isPortal = privilegeService.isPortal();
    // this.isPortal = true;
  }

  ngOnInit(): void {
    this.getSystemTaskRouting();
    this.listUserBtn = true;
    if (sessionStorage.getItem('roleState')) {
      this.state = JSON.parse(sessionStorage.getItem('roleState'));
      this.tabIndex = this.state.activeTab;
      this.createRole = this.state.roleCreate;
      this.createUserBtn = this.state.userCreate;
      this.uploadUserBtn = this.state.uploadUser;
      this.listUserBtn = this.state.listUser;
      this.createPortalRole = this.state.portalRoleCreate;
    } else {
      this.tabIndex = 0;
    }
    this.route.params.subscribe(params => {
      if (params.tab !== undefined) {
        this.tabChanged(params.tab);
      }
    });
    const user = JSON.parse(localStorage.getItem('user'));
    this.isNotVendor = !user.vendorId;
  }

  ngOnDestroy() {
    sessionStorage.removeItem('roleState');
  }

  storeSessionStore() {
    this.state.activeTab = this.tabIndex;
    this.state.roleCreate = this.createRole;
    this.state.userCreate = this.createUserBtn;
    this.state.uploadUser = this.uploadUserBtn;
    this.state.listUser = this.listUserBtn;
    this.state.isListApprovalGroup = this.isListApprovalGroup;
    this.state.isUploadApprovalGroup = this.isUploadApprovalGroup;
    sessionStorage.setItem('roleState', JSON.stringify(this.state));
  }

  tabChanged(tabIndex: any) {
    this.tabIndex = tabIndex;
    this.storeSessionStore();
    const actionNames = [
      AppAnalyticsConstants.CREATE_USER,
    ];
    const actionName = actionNames[tabIndex] || '';
    this.userService.changeMainTabSet.next(actionName);
  }

  toggleCreateRole() {
    this.createRole = !this.createRole;
    this.storeSessionStore();
  }

  toggleCreatePortalRole() {
    this.createPortalRole = !this.createPortalRole;
    this.storeSessionStore();
  }

  toggleCreateUser(val) {
    if (val === 'cu') {
      this.createUserBtn = true;
      this.uploadUserBtn = false;
      this.listUserBtn = false;

    } else if (val === 'vl') {
      this.uploadUserBtn = false;
      this.createUserBtn = false;
      this.listUserBtn = true;

    } else if (val === 'approvalGroupList') {

      this.createUserBtn = false;
      this.uploadUserBtn = false;
      this.listUserBtn = false;
      this.isListApprovalGroup = !this.isListApprovalGroup;

    } else {
      this.uploadUserBtn = true;
      this.createUserBtn = false;
      this.listUserBtn = false;
      this.isListApprovalGroup = true;
    }
    this.storeSessionStore();
  }

  /**
   * This method use for show / hide approval group action buttons
   * @param action string
   */
  changeApprovalGroupAction(action) {
    if (action === 'UPLOAD_LIST') {
      this.isUploadApprovalGroup = true;
      this.isListApprovalGroup = false;
    } else if (action === 'SHOW_LIST') {
      this.isListApprovalGroup = true;
      this.isUploadApprovalGroup = false;
    }
    this.storeSessionStore();
  }


  /**
   * this method can be used to get visible content
   */
  changeAfterSuccess(event) {
    if (event !== undefined) {
      this.tabIndex = event.tabIndex;
      this.listUserBtn = event.visible;
      this.createUserBtn = false;
      this.userService.updateTableData.next(true);
    }
  }

  /**
   * get navigation component
   */

  getSystemTaskRouting() {
    this.subscription = this.commonSystemTaskRoutingService.commonRouting.subscribe((titleName) => {
      if (AppSystemTaskRouting.TITLE_CRETE_USER === titleName) {
        this.toggleCreateUser('cu');
      }
    });
    this.subscription.unsubscribe();
  }

  userModule() {
    return this.privilegeService.isAuthorizedMultiple(
      [AppAuthorities.USERS_ACTIVATE, AppAuthorities.USERS_CREATE, AppAuthorities.USERS_DELETE, AppAuthorities.USERS_DETAIL_VIEW,
        AppAuthorities.USERS_EDIT, AppAuthorities.USERS_INACTIVATE, AppAuthorities.USERS_UNLOCK, AppAuthorities.USERS_UPLOAD]);
  }

  roleModule() {
    return this.privilegeService.isAuthorizedMultiple(
      [AppAuthorities.ROLES_CREATE, AppAuthorities.ROLES_DELETE, AppAuthorities.ROLES_INACTIVATE, AppAuthorities.ROLES_ACTIVATE,
        AppAuthorities.ROLES_DETAIL_VIEW, AppAuthorities.ROLES_EDIT]);
  }

  portalRoleModule() {
    return this.privilegeService.isAuthorizedMultiple(
      [AppAuthorities.ROLES_CREATE, AppAuthorities.ROLES_DELETE, AppAuthorities.ROLES_INACTIVATE, AppAuthorities.ROLES_ACTIVATE,
        AppAuthorities.ROLES_DETAIL_VIEW, AppAuthorities.ROLES_EDIT]);
  }

  aGroupModule() {
    return this.privilegeService.isAuthorizedMultiple(
      [AppAuthorities.APPROVAL_GROUPS_CREATE, AppAuthorities.APPROVAL_GROUPS_EDIT, AppAuthorities.APPROVAL_GROUPS_DELETE,
        AppAuthorities.APPROVAL_GROUPS_INACTIVATE, AppAuthorities.APPROVAL_GROUPS_ACTIVATE, AppAuthorities.APPROVAL_GROUPS_UPLOAD]);
  }


}
