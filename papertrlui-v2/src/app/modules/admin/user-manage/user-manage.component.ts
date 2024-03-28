import {Component, HostListener, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {UserService} from '../../../shared/services/user/user.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {UserTableDto} from '../../../shared/dto/user/user-table-dto';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DepartmentService} from '../../../shared/services/department/department.service';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {Subscription} from 'rxjs';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-user-manage',
  templateUrl: './user-manage.component.html',
  styleUrls: ['./user-manage.component.scss']
})
export class UserManageComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();
  public userMastrDto: UserMasterDto = new UserMasterDto();
  public approvalGroupList: DropdownDto = new DropdownDto();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;
  public subscription = new Subscription();
  public actionActive: UserTableDto;

  public isVisibleEditUser = false;
  public editUser: boolean;
  public isPasswordReset = false;
  public viewUser: boolean;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();


  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }



  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(private userService: UserService, public messageService: MessageService, public notificationService: NotificationService,
              public gridService: GridService, public confirmationService: ConfirmationService, public privilegeService: PrivilegeService,
              public formGuardService: FormGuardService, public billsService: BillsService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public departmentService: DepartmentService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.USER_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.USER_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_USER_LIST;
      this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true){
          this.loadTableData();
        }
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    });
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.USERS_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.USERS_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.USERS_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
    this.subscription = this.userService.updateTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.USERS_EDIT),
        command: () => {
          this.editUser = true;
          this.viewUser = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.USERS_DETAIL_VIEW),
        command: () => {
          this.editUser = false;
          this.viewUser = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.USERS_DELETE),
        command: () => {
          this.deleteUser();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.USERS_ACTIVATE),
        command: () => {
          this.activeUser();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.USERS_INACTIVATE),
        command: () => {
          this.inactiveUser();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_UNLOCK,
        status: this.enums.STATUS_LOCK,
        icon: AppIcons.ICON_UNLOCK,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.USERS_UNLOCK),
        command: () => {
          this.unlockedUser();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_PASSWORD_RESET,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_PASSWORD_RESET,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.USERS_EDIT),
        command: () => {
          this.isPasswordReset = true;
          this.userMastrDto = Object.assign(this.userMastrDto, this.actionActive);
        }
      },
    ];
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.USER_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_USER_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.USER_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.userService.getUserTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.tableSupportBase.dataSource = res.body.data.map(usm => {
        if (usm.nicPassportNo === null || usm.nicPassportNo === undefined) {
          return { ...usm, nicPassportNo: '' };
        }
        return usm;
      });
      this.tableSupportBase.totalRecords = res.body.totalRecords;
      if (this.tableSupportBase.totalRecords === 0) {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
      } else {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
      }
    });
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: UserTableDto) {
    this.actionActive = val;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.activeUserList();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.inactiveUserList();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteUserList();
        break;
    }
  }


  /**
   * <---- User Action Button Services --->
   */

  /**
   * active user method
   */
  activeUser() {
    this.userService.changeUserStatus(this.actionActive.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.USER_ACTIVATED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.tableSupportBase.rows = [];
      this.loadData(this.tableSupportBase.searchFilterDto);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * unlock user method
   */
  unlockedUser() {
    this.userService.changeUserStatus(this.actionActive.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.USER_UNLOCKED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.tableSupportBase.rows = [];
      this.loadData(this.tableSupportBase.searchFilterDto);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * inactive user method
   */
  inactiveUser() {
    this.userService.changeUserStatus(this.actionActive.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.USER_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.tableSupportBase.rows = [];
      this.loadData(this.tableSupportBase.searchFilterDto);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * deleteExpense user method
   */
  deleteUser() {
    this.confirmationService.confirm({
      message: 'You want to delete this User',
      key: 'user',
      accept: () => {
        this.userService.deleteUser(this.actionActive.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.USER_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
          this.tableSupportBase.rows = [];
          this.loadData(this.tableSupportBase.searchFilterDto);
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * this method can be used to active user bulk
   */
  activeUserList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.userService.activeUserList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.USERS_ACTIVATED_SUCCESSFULLY);
          }
          this.tableSupportBase.rows = [];
          this.loadData(this.tableSupportBase.searchFilterDto);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to inactive user bulk
   */
  inactiveUserList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.userService.inactiveUserList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.USERS_INACTIVATED_SUCCESSFULLY);
          }
          this.tableSupportBase.rows = [];
          this.loadData(this.tableSupportBase.searchFilterDto);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to deleteExpense user bulk
   */
  deleteUserList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.confirmationService.confirm({
        message: 'You want to delete the selected User(s)',
        key: 'user',
        accept: () => {
          this.userService.deleteUserList(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.USERS_DELETED_SUCCESSFULLY);
              }
              this.tableSupportBase.rows = [];
              this.loadData(this.tableSupportBase.searchFilterDto);
            }
          }, error => {
            this.notificationService.successMessage(error);
          });
        }
      });
    }
  }
}
