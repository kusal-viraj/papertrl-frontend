import {Component, HostListener, Input, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {ButtonPropertiesDto} from "../../../shared/dto/common/Buttons/button-properties-dto";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {AppIcons} from "../../../shared/enums/app-icons";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {OverlayPanel} from "primeng/overlaypanel";
import {Table} from "primeng/table";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {LazyLoadEvent, MessageService} from "primeng/api";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {AccountSyncService} from "../../../shared/services/sync-dashboard/account-sync.service";
import {AppWindowResolution} from "../../../shared/enums/app-window-resolution";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppBulkButton} from "../../../shared/enums/app-bulk-button";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";

@Component({
  selector: 'app-account-failed-pull',
  templateUrl: './account-failed-pull.component.html',
  styleUrls: ['./account-failed-pull.component.scss']
})
export class AccountFailedPullComponent implements OnInit {


  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;
  public commonUtil = new CommonUtility();

  public enums = AppEnumConstants;
  public appIcons = AppIcons;
  public tableKeyEnum = AppTableKeysData;
  public activeAction: any;
  public message: any;
  public companyList = [];
  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();



  @Input() public systemId: any; // Id of QB Sync


  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('dt') table: Table;

  @ViewChild('columnSelect') columnSelect: any;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public gridService: GridService, public messageService: MessageService,
              public notificationService: NotificationService, public accountSyncService: AccountSyncService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.ACCOUNT_SYNC_FAILED_PULL_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.ACCOUNT_SYNC_FAILED_PULL_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_ACCOUNT_SYNC_FAILED_PULL_LIST;
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
    this.availableHeaderActions.push(AppTableHeaderActions.RE_SYNC);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.getCompanyList();
  }

  getCompanyList() {
    this.accountSyncService.getSelectedCompanyList(this.systemId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.companyList = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getDropDown(col: any) {
    switch (col.field) {
      case 'incompleteDetail.objectType':
        return col.dropdownValues;
      case 'failRecord.recordStatus':
        return col.dropdownValues;
      case 'incompleteDetail.tpCompanyId':
        return this.companyList;
    }
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.ACCOUNT_SYNC_FAILED_PULL_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_ACCOUNT_SYNC_FAILED_PULL_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.ACCOUNT_SYNC_FAILED_PULL_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.getDataFromBackend();
  }

  getDataFromBackend() {
    this.accountSyncService.getPullFailedAccountSync(this.tableSupportBase.searchFilterDto, this.systemId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = res.body.data;
          this.tableSupportBase.totalRecords = res.body.totalRecords;
          if (this.tableSupportBase.totalRecords === 0) {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
          } else {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
          }
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }


  /**
   * Set Values when action button clicked
   * @param val object
   */
  detailViewButtonClick(val) {
    this.activeAction = val;
  }


  /**
   * Set Values when action button clicked
   * @param val object
   */
  syncButtonClick(val) {
    // this.activeAction = val;
    this.accountSyncService.reSyncFailedPull(val.id, this.systemId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.tableSupportBase.rows = [];
        this.getDataFromBackend();
        this.notificationService.successMessage(HttpResponseMessage.P_RE_SYNC_SUCCESSFULLY);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_SYNC:
        this.syncBulk();
        break;
    }
  }

  syncBulk() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.accountSyncService.bulkReSyncFailedPull(ids, this.systemId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.rows = [];
          this.getDataFromBackend();
          this.notificationService.successMessage(HttpResponseMessage.P_BULK_RE_SYNC_SUCCESSFULLY);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


}
