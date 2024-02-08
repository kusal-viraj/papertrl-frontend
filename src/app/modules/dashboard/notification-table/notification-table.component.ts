import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {TableDataOptionsDto} from '../../../shared/dto/table/table-data-options-dto';
import {TableSearchFilterDataDto} from '../../../shared/dto/table/table-search-filter-data-dto';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {ProjectCodeMasterDto} from '../../../shared/dto/project code/project-code-master-dto';
import {TreeTable} from 'primeng/treetable';
import {ConfirmationService, LazyLoadEvent, MessageService, TreeNode} from 'primeng/api';
import {ProjectCodeService} from '../../../shared/services/project-code/project-code.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {DashboardService} from '../../../shared/services/dashboard/dashboard.service';
import {SubscriptionDto} from '../../../shared/dto/dashboard/subscription-dto';

@Component({
  selector: 'app-notification-table',
  templateUrl: './notification-table.component.html',
  styleUrls: ['./notification-table.component.scss']
})
export class NotificationTableComponent implements OnInit {

  public totalRecords: number; // Number Of Total Record for Pagination
  public filterArray: any[] = []; // Columns with advanced filter
  public hiddenInOptions: any[] = []; // Columns Selected to DropDown
  public tableActionList: any [] = [];  // Action Button

  public isVisibleTable = false;
  public isTableInResponsive: boolean;
  public appAuthorities = AppAuthorities;

  public loading = true; // Loader on Table for Lazy Event
  public firstLoad = true;

  public tableSupportBase = new TableSupportBase();

  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;

  public selectedValues: any [] = [];
  public actionsDisable = false;
  public dataSource: TreeNode[];

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
    // this.table.clear();
    this.onTableChanged();
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: TreeTable;


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(private projectCodeService: ProjectCodeService, public notificationService: NotificationService,
              public gridService: GridService, public dashboardService: DashboardService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.PROJECT_CODE_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
  }

  /**
   * Multi select value changed
   * @param event value
   * @param field field name
   * @param table field reference name
   */
  onMultiSelectChange(table, event, field: any) {
    table.filter(event.value, field, 'contains');
  }


  ngOnInit() {
    this.loadTableData();
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
    this.projectCodeService.getCodeTableColumns().subscribe((res: any) => {
      this.tableDataProcess(res, AppTableKeysData.PROJECT_CODE_TABLE_KEY, this.columnSelect);
      this.tableSupportBase.loading = false;
    });
    // this.gridService.getTableStructure(AppConstant.GRID_PROJECT_CODE_LIST).subscribe((res: any) => {
    //   this.tableDataProcess(res, AppTableKeysData.PROJECT_CODE_TABLE_KEY, this.columnSelect);
    //   this.tableSupportBase.loading = false;
    // });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.dashboardService.getNotificationsTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.dataSource = res.body.data;
      this.totalRecords = res.body.totalRecords;
    });
  }


  /**
   * Loads Table Data (Settings)
   */
  tableDataProcess(tableData, key, columnSelect) {
    this.loading = true;
    if (this.firstLoad) {
      this.firstLoad = false;
    } else {
      // table.clear();
    }

    // Restore Column Widths form Session Storage
    setTimeout(() => {
      // this.changeFilterSelectionLabel(columnSelect.value);
      // table.restoreColumnWidths();
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
   * this method can be used to get finalize ids
   */


  switchChanged(data) {

    const subscriptionDto = new SubscriptionDto();
    subscriptionDto.eventId = data.id;
    subscriptionDto.enableEmail = data.enableEmail;
    subscriptionDto.enableNotification = data.enableNotification;

    this.dashboardService.notificationSubscriptionChanged(subscriptionDto).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {

      } else {

      }
    }, (error => {
      this.notificationService.errorMessage(error);
    }));
  }
}
