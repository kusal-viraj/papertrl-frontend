import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {ConfirmationService, LazyLoadEvent, MessageService, TreeNode} from 'primeng/api';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {ProjectCodeService} from '../../../shared/services/project-code/project-code.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ProjectCodeMasterDto} from '../../../shared/dto/project code/project-code-master-dto';
import {TableDataOptionsDto} from '../../../shared/dto/table/table-data-options-dto';
import {TableSearchFilterDataDto} from '../../../shared/dto/table/table-search-filter-data-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {TreeTable} from 'primeng/treetable';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AccountSyncService} from '../../../shared/services/sync-dashboard/account-sync.service';
import {CreateProjectCodeComponent} from '../create-project-code/create-project-code.component';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {Subscription} from 'rxjs';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from "primeng/menu";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";


@Component({
  selector: 'app-project-code-list',
  templateUrl: './project-code-list.component.html',
  styleUrls: ['./project-code-list.component.scss']
})
export class ProjectCodeListComponent implements OnInit, OnDestroy {

  public tableDataOptions: TableDataOptionsDto = new TableDataOptionsDto();
  public searchFilterDto: TableSearchFilterDataDto = new TableSearchFilterDataDto();
  public tableUpdateSubscription = new Subscription();

  public dataSource: any;
  public selectedColumnCount: any;
  public ids: number [] = [];

  public totalRecords: number; // Number Of Total Record for Pagination
  public rows: any[] = []; // Shows the selected Columns
  public filterArray: any[] = []; // Columns with advanced filter
  public activeFilters: any[] = []; // List of Filters Currently Active
  public hiddenInOptions: any[] = []; // Columns Selected to DropDown
  public tableActionList: any [] = [];  // Action Button

  public isVisibleTable = false;
  public isTableInResponsive: boolean;
  public appAuthorities = AppAuthorities;

  public loading = true; // Loader on Table for Lazy Event
  public firstLoad = true;

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;

  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: ProjectCodeMasterDto = new ProjectCodeMasterDto();

  public isEditView = false;
  public isDetailView = false;
  public actionDataID: any;
  public id: any;
  public selectedValues: any [] = [];
  public emitStatusChange = null;
  public selectedBcCompanyList = [];

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();

  @Output() successEvent = new EventEmitter();
  @ViewChild('createProjectCodeComponent') public createProjectCodeComponent: CreateProjectCodeComponent;
  @ViewChild('editProjectCodeComponent') public editProjectCodeComponent: CreateProjectCodeComponent;


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
  @ViewChild('dt') table: TreeTable;
  @ViewChild('menu') menu: Menu;
  files: TreeNode[];
  isRefreshTable = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(private projectCodeService: ProjectCodeService, public messageService: MessageService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService,
              public gaService: GoogleAnalyticsService,
              public gridService: GridService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public privilegeService: PrivilegeService, public accountSyncService: AccountSyncService,
              public formGuardService: FormGuardService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.PROJECT_CODE_TABLE_KEY);
    this.tableUpdateSubscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  ngOnInit() {
    if (this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_INACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.INACTIVE);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_ACTIVATE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.ACTIVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    if (this.privilegeService.isExusPartner()) {
      this.getCompanyList();
    }
    this.tableUpdateSubscription = this.projectCodeService.updateTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
    this.loadTableData();
    this.loadBulkButtonData();
    this.actionButtonInit();
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
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_EDIT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_EDIT,
            AppAnalyticsConstants.MODULE_NAME_PROJECT_CODE,
            AppActionLabel.ACTION_LABEL_EDIT,
          );
          this.isEditView = true;
          this.isDetailView = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_PROJECT_CODE,
            AppActionLabel.ACTION_LABEL_DELETE,
          );
          this.deleteProjectCode();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_INACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_INACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_PROJECT_CODE,
            AppActionLabel.ACTION_LABEL_INACTIVATE,
          );
          this.inactiveProjectCode();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_ACTIVATE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_ACTIVATE,
            AppAnalyticsConstants.MODULE_NAME_PROJECT_CODE,
            AppActionLabel.ACTION_LABEL_ACTIVATE,
          );
          this.activeProjectCode();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
        icon: AppIcons.ICON_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PROJECT_CODES_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_PROJECT_CODE,
            AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
          );
          this.isEditView = false;
          this.isDetailView = true;
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
    sessionStorage.removeItem(AppTableKeysData.PROJECT_CODE_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_PROJECT_CODE_LIST).subscribe((res: any) => {
      this.tableDataProcess(res, AppTableKeysData.PROJECT_CODE_TABLE_KEY, this.columnSelect);
      this.tableSupportBase.loading = false;
    });
  }

  /**
   * This method use for get bulk button list data
   */
  loadBulkButtonData() {
    this.projectCodeService.getProjectCodeBulkButtonData().subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        const arr = [];
        for (const property of res.body) {
          const val: ButtonPropertiesDto = property;
          arr.push(
            {
              label: val.label,
              action: val.action,
              authCode: val.authCode,
              disabled: !val.active,
              icon: val.icon,
              command: (event) => {
                this.bulkButtonAction(event.item.action);
              }
            }
          );
        }
        this.bulkButtonListResponsive = arr;
        this.bulkButtonList = res.body;
      }
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.projectCodeService.getCodeTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.files = res.body.data;
      this.totalRecords = res.body.totalRecords;
    });
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: ProjectCodeMasterDto) {
    this.activeAction = val;
    this.id = this.activeAction.id;
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_ACTIVATE:
        this.activeProjectCodesList();
        break;
      case  AppBulkButton.BUTTON_INACTIVATE:
        this.inactiveProjectCodesList();
        break;
      case AppBulkButton.BUTTON_DELETE:
        this.deleteProjectCodesList();
        break;
    }
  }

  /**
   * Loads Table Data (Settings)
   */
  tableDataProcess(tableData, key, columnSelect) {
    this.loading = true;
    if (this.firstLoad) {
      this.firstLoad = false;
    }

    // Restore Column Widths form Session Storage
    setTimeout(() => {
      this.loading = false;
    }, AppTableKeysData.RESTORE_COLUMN_WIDTHS_TIME_OUT);

    const tempArr: any[] = [];
    const tempArr1: any[] = [];
    const tempArr2: any[] = [];
    for (const i of tableData.body.columns) {
      if (i.columnShow === true) {
        tempArr.push(i);
      }
      if (i.canHide === true) {
        tempArr1.push(i);
      }
    }
    for (const i of tableData.body.advancedFilters) {
      tempArr2.push(i);
    }

    this.hiddenInOptions = tempArr1;
    this.selectedColumns = tempArr;
    this.filterArray = tempArr2;
    // Clear Table Session State
    setTimeout(() => {
      sessionStorage.removeItem(key);
    }, AppTableKeysData.REMOVE_TABLE_ITEM_TIME_OUT);
  }


  /**
   * this method can be used to active project code
   */
  activeProjectCode() {
    this.projectCodeService.activeProjectCode(this.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CODE_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.successEvent.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to inactive project code
   */
  inactiveProjectCode() {
    this.projectCodeService.inactiveProjectCode(this.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CODE_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.successEvent.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * delete user method
   */
  deleteProjectCode() {
    this.confirmationService.confirm({
      message: 'You want to delete the selected Project code <br> <br>' +
        'If you perform this action, any associated project codes will be deleted as well',
      key: 'prjCodeTable',
      accept: () => {
        this.projectCodeService.deleteProjectCode(this.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.CODE_DELETED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.successEvent.emit();
            this.tableSupportBase.rows = [];
            this.emitStatusChange = null;
            setTimeout(() => {
              this.emitStatusChange = 'UPDATED';
            }, 500);
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
   * this method can be used to active user bulk
   */
  activeProjectCodesList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].data.id);
      }
      this.projectCodeService.activeProjectCodeList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.CODE_ACTIVATED_SUCCESSFULLY);
          }
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to inactive user bulk
   */
  inactiveProjectCodesList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].data.id);
      }
      this.projectCodeService.inactiveProjectCodeList(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.CODES_INACTIVATED_SUCCESSFULLY);
          }
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to delete user bulk
   */
  deleteProjectCodesList() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].data.id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected Project code(s) <br> <br>' +
          'If you perform this action, any associated project codes will be deleted as well',
        key: 'prjCodeTable',
        accept: () => {
          this.projectCodeService.deleteProjectCodeList(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.emitStatusChange = null;
                setTimeout(() => {
                  this.emitStatusChange = 'UPDATED';
                }, 500);
                this.notificationService.successMessage(HttpResponseMessage.CODES_DELETED_SUCCESSFULLY);
              }
              this.loadData(this.tableSupportBase.searchFilterDto);
              this.tableSupportBase.rows = [];
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
   * this method can be used to refresh the table
   */
  getNewUpdatedData() {
    this.isEditView = false;
    this.isDetailView = false;
    this.projectCodeService.updateTableData.next(true);
  }

  getCompanyList() {
    this.accountSyncService.getSelectedCompanyList(AppConstant.SYSTEM_BUISNESS_CENTRAL_CLOUD).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.selectedBcCompanyList = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getMultiSelectValues(col) {
    switch (col.field) {
      case 'company.tpCompanyId':
        return this.selectedBcCompanyList;
      default :
        return [];
    }
  }

  selectAllData() {
    this.tableSupportBase.rows = this.files;
    const dataList = Object.assign(this.files);
    const selectedData = [];
    dataList.forEach((value) => {
      isChildPresent(value);
    });

    function isChildPresent(value) {
      value.children?.forEach((value) => {
        isChildPresent(value);
      });
      selectedData.push(value);
    }

    this.tableSupportBase.rows = selectedData;
  }

  unSelectAllData() {
    this.tableSupportBase.rows = [];
  }

  isSelectOrUnselect() {
    let count = 0;
    this.files?.forEach((value) => {
      isChildPresent(value);
    });

    function isChildPresent(value) {
      value.children?.forEach((value) => {
        isChildPresent(value);
      });
      count++;
    }

    return this.tableSupportBase.rows.length == count;
  }

  isProjectCodeTableVisible() {
    return this.privilegeService.isAuthorizedMultiple(
      [this.appAuthorities.PROJECT_CODES_EDIT, this.appAuthorities.PROJECT_CODES_DELETE,
        this.appAuthorities.PROJECT_CODES_INACTIVATE, this.appAuthorities.PROJECT_CODES_ACTIVATE, this.appAuthorities.PROJECT_CODES_DETAIL_VIEW,
        this.appAuthorities.PROJECT_CODES_CSV_EXPORT, this.appAuthorities.PROJECT_CODES_CSV_EXPORT]);
  }
}
