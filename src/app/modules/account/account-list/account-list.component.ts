import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AccountService} from '../../../shared/services/accounts/account.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AccountTableDto} from '../../../shared/dto/account/account-table-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AccountUtility} from '../account-utility';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {Subscription} from 'rxjs';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from 'primeng/menu';
import {GoogleAnalyticsService} from '../../../shared/services/google-analytics/google-analytics.service';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountListComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();
  public accountUtility: AccountUtility = new AccountUtility(this.accountService);
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: AccountTableDto; // Selected Action Button
  public editAccount: boolean; // View Edit Account Panel
  public viewAccount: boolean;
  public accountDetailsTypes: DropdownDto = new DropdownDto();
  public parentAccounts: DropdownDto = new DropdownDto();
  public subscription = new Subscription();
  // View Account Panel

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

  constructor(private accountService: AccountService, public messageService: MessageService, public gridService: GridService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public formGuardService: FormGuardService, public gaService: GoogleAnalyticsService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public privilegeService: PrivilegeService) {
    this.accountUtility.getAccountTypes(this.accountUtility.accountTypes, false);
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.ACCOUNT_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.ACCOUNT_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_ACCOUNT_LIST;
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
    if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);


    this.loadTableData();
    // this.loadBulkButtonData();
    this.actionButtonInit();
    this.getAccountDetailsType();
    this.getParentAccount();
    this.subscription = this.accountService.updateTableData.subscribe(() => {
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
        label: this.actionLabelEnum.ACTION_LABEL_EDIT,
        icon: this.iconEnum.ICON_EDIT,
        status: this.enums.STATUS_ACTIVE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_ACCOUNT,
            this.actionLabelEnum.ACTION_LABEL_EDIT,
          );
          this.checkSelectedAccountWhetherCanEdit();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_ACCOUNT,
            this.actionLabelEnum.ACTION_LABEL_DELETE,
          );
          this.deleteAccount();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: this.iconEnum.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_ACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_ACCOUNT,
            this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
          );
          this.activeAccount();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: this.iconEnum.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_INACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_INACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_ACCOUNT,
            this.actionLabelEnum.ACTION_LABEL_INACTIVATE,
          );
          this.inactiveAccount();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_ACCOUNT,
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
          );
          this.editAccount = false;
          this.viewAccount = true;
        }
      }
    ];
  }


  /**
   * This method can be used to check whether can be edit the selected account
   */

  checkSelectedAccountWhetherCanEdit() {
    this.accountService.checkSelectedAccountWhetherCanEdit(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.editAccount = true;
        this.viewAccount = false;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.ACCOUNT_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_ACCOUNT_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.ACCOUNT_TABLE_KEY, this.columnSelect);
    });
  }



  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.accountService.getAccountTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.tableSupportBase.dataSource = res.body.data;
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
  actionButtonClick(val: AccountTableDto) {
    this.activeAction = val;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.activeAccountList();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.inactiveAccountList();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteAccountList();
        break;
    }
  }

  /**
   * inactive account
   */
  inactiveAccount() {
    this.accountService.inactiveAccount(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ACCOUNT_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * active account
   */
  activeAccount() {
    this.accountService.activeAccount(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ACCOUNT_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * delete account
   */
  deleteAccount() {
    this.confirmationService.confirm({
      message: 'You want to delete the selected account <br><br>' +
        'If you perform this action, any associated accounts will be deleted as well',
      accept: () => {
        this.accountService.deleteAccount(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.ACCOUNT_DELETED_SUCCESSFULLY);
            this.tableSupportBase.rows = [];
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * this method can be used to active account bulk
   */
  activeAccountList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.accountService.activeAccountList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.ACCOUNTS_ACTIVATED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
          }
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to inactive account bulk
   */
  inactiveAccountList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.accountService.inactiveAccountList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.ACCOUNTS_INACTIVATED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
          }
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to deleteExpense account bulk
   */
  deleteAccountList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.confirmationService.confirm({
        message: 'You want to delete the selected account(s) <br><br>' +
          'If you perform this action, any associated accounts will be deleted as well',
        accept: () => {
          this.accountService.deleteAccountList(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.ACCOUNTS_DELETED_SUCCESSFULLY);
                this.loadData(this.tableSupportBase.searchFilterDto);
              }
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  /**
   * get refreshTable data
   * @param value to emitted value
   */
  isRefreshTable(value) {
    if (value === 'ACCOUNT_UPDATED') {
      this.loadData(this.tableSupportBase.searchFilterDto);
    }
  }

  /**
   * this method can be used to get item details type for filters
   */
  getAccountDetailsType() {
    this.accountService.getAccountDetaiTypesForFilter().subscribe((res: any) => {
      this.accountDetailsTypes.data = res.body;
    });
  }

  /**
   * this method can be used to get parent accounts for filters
   */
  getParentAccount() {
    this.accountService.getParentAccountsForFilter().subscribe((res: any) => {
      this.parentAccounts.data = res.body;
    });
  }

  getDropDowns(col: any) {
    switch (col.field) {
      case 'acct.id':
        return this.accountUtility.accountTypes.data;
      case 'accParent.id':
        return this.parentAccounts.data;
      case 'accdt.id':
        return this.accountDetailsTypes.data;
      case 'acc.status':
        return col.dropdownValues;
      case 'acc.isPurchaseAccount':
        return col.dropdownValues;
    }
  }
}
