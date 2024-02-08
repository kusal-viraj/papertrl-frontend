import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {GridService} from '../../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {AppWindowResolution} from '../../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {LazyLoadEvent} from 'primeng/api';
import {ActiveLoginsService} from '../../../../shared/services/support/active-logins.service';
import {AppTableHeaderActions} from "../../../../shared/enums/app-table-header-actions";

@Component({
  selector: 'app-active-login-list',
  templateUrl: './active-login-list.component.html',
  styleUrls: ['./active-login-list.component.scss']
})
export class ActiveLoginListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;
  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: any;


  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();

  @Input() id: any;

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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  constructor(public gridService: GridService, public notificationService: NotificationService,
              public activeLoginsService: ActiveLoginsService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.ACTIVE_LOGINS_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.ACTIVE_LOGINS_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = AppConstant.GRID_NAME_ACTIVITY_LIST;
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
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

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
    sessionStorage.removeItem(AppTableKeysData.ACTIVE_LOGINS_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_ACTIVE_CURRENT_LOGIN_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.ACTIVE_LOGINS_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.activeLoginsService.getActiveLoginsTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.tableSupportBase.dataSource = res.body.data;
      this.tableSupportBase.totalRecords = res.body.totalRecords;
      if (this.tableSupportBase.totalRecords === 0) {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
      } else {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
      }
    });
  }


  protected readonly AppConstant = AppConstant;
}
