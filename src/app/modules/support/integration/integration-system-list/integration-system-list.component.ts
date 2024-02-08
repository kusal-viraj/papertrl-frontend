import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {GridService} from '../../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppWindowResolution} from '../../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {AppActionLabel} from '../../../../shared/enums/app-action-label';
import {AppIcons} from '../../../../shared/enums/app-icons';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {IntegrationService} from '../../../../shared/services/support/integration.service';
import {IntegrationUiUtility} from '../integration-ui-utility';
import {AppTableHeaderActions} from "../../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-integration-system-list',
  templateUrl: './integration-system-list.component.html',
  styleUrls: ['./integration-system-list.component.scss']
})
export class IntegrationSystemListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();

  public bulkButtonList: ButtonPropertiesDto[] = [];
  public bulkButtonListResponsive: any;
  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: any;
  public editSystem = false;
  public systemPanel = false;
  public systemId: any;
  public integrationUiUtility: IntegrationUiUtility = new IntegrationUiUtility(this.integrationService, this.notificationService);

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
              public integrationService: IntegrationService, public confirmationService: ConfirmationService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.INTEGRATION_SYSTEM_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.INTEGRATION_SYSTEM_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_SYSTEM_LIST;
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
          this.deleteTenant(id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_EDIT,
        authCode: true,
        command: () => {
          this.systemId = this.activeAction.id;
          this.editSystem = true;
          this.systemPanel = true;
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
    sessionStorage.removeItem(AppTableKeysData.INTEGRATION_SYSTEM_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_SYSTEM_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.INTEGRATION_SYSTEM_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.integrationService.getSystemTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  }

  public deleteTenant(id) {
    this.confirmationService.confirm({
      message: 'You want to delete this system!',
      key: 'system',
      accept: () => {
        this.integrationService.deleteSystem(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.notificationService.successMessage(HttpResponseMessage.INTEGRATION_SYSTEM_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.errorMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  getDropDowns(col) {
    switch (col.field) {
      case 'atype.id' : {
        return this.integrationUiUtility.authTypeList.data;
      }
      case 'gtype.id' : {
        return this.integrationUiUtility.grantTypes.data;
      }
      case 'systype.id' : {
        return this.integrationUiUtility.types.data;
      }
      default : {
        return col.dropdownValues;
      }
    }
  }

  refreshList() {
    this.loadData(this.tableSupportBase.searchFilterDto);
    this.editSystem = false;
    this.systemPanel = false;
  }
  createSystem(){
    this.editSystem = false;
    this.systemPanel = true;
  }
}
