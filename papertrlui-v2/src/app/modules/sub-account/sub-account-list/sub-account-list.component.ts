import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {SubAccountService} from '../../../shared/services/sub-account/sub-account.service';
import {SubAccountTableDto} from '../../../shared/dto/sub-account/sub-account-table-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {CreateSubAccountComponent} from "../create-sub-account/create-sub-account.component";
import {FormGuardService} from "../../../shared/guards/form-guard.service";
import {Subscription} from "rxjs";
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-sub-account-list',
  templateUrl: './sub-account-list.component.html',
  styleUrls: ['./sub-account-list.component.scss']
})
export class SubAccountListComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;
  public ids: any [] = [];

  public activeAction: SubAccountTableDto; // Selected Action Button
  public editSubAccount: boolean; // View Edit Account Panel
  public viewSubAccount: boolean;
  public subAccountId: number;
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

  constructor(public subAccountService: SubAccountService, public messageService: MessageService, public gridService: GridService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public formGuardService: FormGuardService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.SUB_ACCOUNT_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.SUB_ACCOUNT_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_SUB_ACCOUNT_LIST;
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
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
    this.subscription = this.subAccountService.subAccountRefresh.subscribe(() => {
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
        authCode: this.privilegeService.isAuthorized(AppAuthorities.SUB_ACCOUNTS_EDIT),
        command: () => {
          this.editSubAccount = true;
          this.viewSubAccount = false;
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: this.iconEnum.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.SUB_ACCOUNTS_ACTIVATE),
        command: () => {
          this.activeInactiveSubAccount('STATUS_INACTIVE');
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: this.iconEnum.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.SUB_ACCOUNTS_INACTIVATE),
        command: () => {
          this.activeInactiveSubAccount('STATUS_ACTIVE');
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: true,
        command: () => {
          this.editSubAccount = false;
          this.viewSubAccount = true;
        }
      }
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
    sessionStorage.removeItem(AppTableKeysData.SUB_ACCOUNT_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_SUB_ACCOUNT_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.SUB_ACCOUNT_TABLE_KEY, this.columnSelect);
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.subAccountService.getSubAccountTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val: SubAccountTableDto) {
    this.activeAction = val;
    this.subAccountId = val.id;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.activeSubAccountList();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.inactiveSUbAccountList();
        break;
    }
  }

  /**
   * inactive account
   */
  activeInactiveSubAccount(status) {
    this.subAccountService.changSubAccountStatus(this.activeAction.id).subscribe((res: any) => {
      let message: any;
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (status === 'STATUS_ACTIVE') {
          message = HttpResponseMessage.RECORD_INACTIVATED_SUCCESSFULLY;
          this.loadData(this.tableSupportBase.searchFilterDto);
        } else {
          message = HttpResponseMessage.RECORD_ACTIVATED_SUCCESSFULLY;
          this.loadData(this.tableSupportBase.searchFilterDto);
        }
        this.notificationService.successMessage(message);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to active account bulk
   */
  activeSubAccountList() {
    if (this.ids.length > 0) {
      this.subAccountService.activeSubAccountList(this.ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.RECORD_ACTIVATED_SUCCESSFULLY);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to inactive account bulk
   */
  inactiveSUbAccountList() {
    if (this.ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.subAccountService.inactiveSubAccountList(this.ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.RECORD_INACTIVATED_SUCCESSFULLY);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * this method can be used to get finalize ids
   * @param tableDataObject to selected id list obj
   * @param isChecked to whether is checked
   * @param isAllSelected identify is all selected
   */
  getFinalizeIds(tableDataObject, isChecked, isAllSelected) {
    if (isAllSelected) {
      if (isChecked) {
        tableDataObject.forEach((selectedValues) => {
          if (!this.ids.includes(selectedValues.id)) {
            this.ids.push(selectedValues.id);
          }
        });
      } else {
        this.ids.forEach((selectedValues, index) => {
          this.ids.splice(index);
        });
      }
    } else {
      if (isChecked) {
        if (!this.ids.includes(tableDataObject)) {
          this.ids.push(tableDataObject);
        }
      } else {
        const i = this.ids.indexOf(tableDataObject);
        this.ids.splice(i, 1);
      }
    }
  }

  /**
   * get refreshTable data
   * @param value to emitted value
   */
  isRefreshTable() {
    this.loadData(this.tableSupportBase.searchFilterDto);
    this.editSubAccount = false;
  }

}
