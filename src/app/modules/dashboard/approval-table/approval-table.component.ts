import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {ExpenseTableDto} from '../../../shared/dto/expense/expense-table-dto';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {LazyLoadEvent} from 'primeng/api';
import {DashboardService} from '../../../shared/services/dashboard/dashboard.service';

@Component({
  selector: 'app-approval-table',
  templateUrl: './approval-table.component.html',
  styleUrls: ['./approval-table.component.scss']
})
export class ApprovalTableComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;
  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: ExpenseTableDto;
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

  constructor(private dashboardService: DashboardService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.DASHBOARD_APPROVAL_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  ngOnInit() {
    this.loadTableData();
    this.actionButtonInit();
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_APPROVE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_APPROVE,
        command: () => {
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_REJECT,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_REJECT,
        command: () => {
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
    sessionStorage.removeItem(AppTableKeysData.DASHBOARD_APPROVAL_TABLE_KEY);
    this.dashboardService.getApprovalTableColumns().subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.DASHBOARD_APPROVAL_TABLE_KEY, this.columnSelect);
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.dashboardService.getApprovalTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val: ExpenseTableDto) {
    this.activeAction = val;
  }
}
