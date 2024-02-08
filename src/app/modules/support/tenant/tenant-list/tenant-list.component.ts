import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../../shared/enums/app-table-keys-data';
import {ExpenseTableDto} from '../../../../shared/dto/expense/expense-table-dto';
import {AuditTrialDto} from '../../../../shared/dto/common/audit-trial/audit-trial-dto';
import {Table} from 'primeng/table';
import {ExpenseService} from '../../../../shared/services/expense/expense.service';
import {GridService} from '../../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {AppWindowResolution} from '../../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppBulkButton} from '../../../../shared/enums/app-bulk-button';
import {TenantService} from '../../../../shared/services/support/tenant.service';
import {AppActionLabel} from '../../../../shared/enums/app-action-label';
import {AppIcons} from '../../../../shared/enums/app-icons';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {AppTableHeaderActions} from "../../../../shared/enums/app-table-header-actions";
import {AppAuthorities} from "../../../../shared/enums/app-authorities";
import {PrivilegeService} from "../../../../shared/services/privilege.service";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss']
})
export class TenantListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;
  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: any;
  public id: any;
  public userActivityLogs = false;
  public showUtilizationReport =false;

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

  constructor(public gridService: GridService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService,
              public tenantService: TenantService, public confirmationService: ConfirmationService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.TENANT_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.TENANT_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_TENANT_LIST;
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
    this.availableHeaderActions.push(AppTableHeaderActions.UTILIZATION_REPORTS);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        icon: AppIcons.ICON_DELETE,
        status: this.enums.STATUS_COMMON,
        authCode: true,
        command: () => {
          const id = this.activeAction.id;
          const tenantId = this.activeAction.tenantId;
          this.deleteTenant(id);
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
    sessionStorage.removeItem(AppTableKeysData.TENANT_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_TENANT_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.TENANT_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.tenantService.getTenantTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val) {
    this.activeAction = val;
    this.id = val;
  }

  public deleteTenant(id) {
    this.confirmationService.confirm({
      message: 'You want to delete this Tenant!',
      key: 'tenant',
      accept: () => {
        this.tenantService.deleteTenant(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.notificationService.successMessage(HttpResponseMessage.TENANT_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  getDropDowns(col: any) {

  }
}
