import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppConstant} from "../../../shared/utility/app-constant";
import {AppWindowResolution} from "../../../shared/enums/app-window-resolution";
import {Table} from "primeng/table";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {DashboardService} from "../../../shared/services/dashboard/dashboard.service";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {PortalDashboardService} from "../../../shared/services/portal/portal-dashboard.service";
import {TableSupportBase} from "../../../shared/utility/table-support-base";

@Component({
  selector: 'app-expense-summary-table',
  templateUrl: './expense-summary-table.component.html',
  styleUrls: ['./expense-summary-table.component.scss']
})
export class ExpenseSummaryTableComponent implements OnInit, OnDestroy {
  toDate: any = '';
  fromDate: any = '';

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  public tableSupportBase = new TableSupportBase();

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;

  public subAccountList: DropdownDto = new DropdownDto();
  public dataSource: any;

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  constructor(public portalDashboardService: PortalDashboardService, public gridService: GridService, public notificationService: NotificationService,
              public dashboardService: DashboardService, public privilegeService: PrivilegeService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.EXPENSE_TABLE_KEY);
  }

  ngOnInit() {
    this.loadTableData();
    this.getSubAccountList();
    this.getDataFromBackend('', '');
  }


  /**
   * This method use for get sub account list
   */
  getSubAccountList() {
    this.portalDashboardService.getSubAccountList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.subAccountList.data = res.body;
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
    sessionStorage.removeItem(AppTableKeysData.EXPENSE_TABLE_KEY);
    this.gridService.getTableStructure(AppConstant.GRID_PORTAL_EXPENSE_DASHBOARD).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.EXPENSE_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  dateSelected(dates) {
    const dateStr = [];
    dateStr[0] = dates[0].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    if (dates[1] != null) {
      dateStr[1] = dates[1].toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
    } else {
      dateStr[1] = '';
    }
    this.fromDate = dateStr[0];
    this.toDate = dateStr[1];
    this.getDataFromBackend(dateStr[0], dateStr[1]);
  }

  dateCleared() {
    this.fromDate = '';
    this.toDate = '';
    this.getDataFromBackend('', '');
  }

  getDataFromBackend(fromDate, toDate) {
    this.portalDashboardService.getExpenseTableData(fromDate, toDate).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = res.body.data;
          this.dataSource = res.body.data;


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

  onMultiSelectChange(event: any, field: any) {
    this.dataSource = [];
    if (event.value.length === 0) {
      this.dataSource = this.tableSupportBase.dataSource;
      return;
    }
    this.tableSupportBase.dataSource.forEach((value) => {
      event.value.forEach((value1) => {
        if (value['pEx.subAccount'] === value1) {
          this.dataSource.push(value);
        }
      });
    });
  }
}
