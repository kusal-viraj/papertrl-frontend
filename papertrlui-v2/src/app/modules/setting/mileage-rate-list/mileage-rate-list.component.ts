import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {AppConstant} from '../../../shared/utility/app-constant';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {LazyLoadEvent} from 'primeng/api';
import {MileageRateService} from '../../../shared/services/settings/mileage-rate/mileage-rate.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';

@Component({
  selector: 'app-mileage-rate-list',
  templateUrl: './mileage-rate-list.component.html',
  styleUrls: ['./mileage-rate-list.component.scss']
})
export class MileageRateListComponent implements OnInit {

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  public isEditPONumberFormat = false;
  @Input() public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;

  public appConstant: AppConstant = new AppConstant();
  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;

  constructor(public gridService: GridService, public messageService: NotificationService,
              public mileageRateService: MileageRateService) {
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.EXPENSE_MILEAGE_RATE_LIST_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_EXPENSE_MILEAGE_RATE).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.EXPENSE_MILEAGE_RATE_LIST_TABLE_KEY, this.columnSelect);
    });
    this.mileageRateService.mileageRate.next(this.tableSupportBase);
  }

  /**
   * this method can be used for set table responsive according to the screen size
   */
  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.EXPENSE_MILEAGE_RATE_LIST_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_EXPENSE_MILEAGE_RATE;
            this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true){
          this.loadTableData();
        }
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        } else {
          this.messageService.errorMessage(res.body.message);
        }
      }, error => {
        this.messageService.errorMessage(error);
      });
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.mileageRateService.getMileageTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.tableSupportBase.dataSource = res.body.data;
      this.tableSupportBase.totalRecords = res.body.totalRecords;
      if (this.tableSupportBase.totalRecords === 0) {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
      } else {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
      }
    });
  }

}
