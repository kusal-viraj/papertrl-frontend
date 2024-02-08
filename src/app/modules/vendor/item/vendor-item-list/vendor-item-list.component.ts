import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {AppTableKeysData} from '../../../../shared/enums/app-table-keys-data';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {ItemService} from '../../../../shared/services/items/item.service';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {GridService} from '../../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {Table} from 'primeng/table';
import {Menu} from 'primeng/menu';
import {AppWindowResolution} from '../../../../shared/enums/app-window-resolution';
import {ItemTableDto} from '../../../../shared/dto/item/item-table-dto';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {AppTableHeaderActions} from '../../../../shared/enums/app-table-header-actions';

@Component({
  selector: 'app-vendor-item-list',
  templateUrl: './vendor-item-list.component.html',
  styleUrls: ['./vendor-item-list.component.scss']
})
export class VendorItemListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();
  public tableKeyEnum = AppTableKeysData;
  public appConstant: AppConstant = new AppConstant();
  public activeAction: ItemTableDto;
  public enums = AppEnumConstants;
  public availableHeaderActions: any[] = [];

  @Input() vendorId: any;

  public showFilter = false;
  public showFilterColumns = false;

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

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public itemService: ItemService, public messageService: MessageService, public gridService: GridService,
              public confirmationService: ConfirmationService, public notificationService: NotificationService) {
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.VENDOR_ITEM_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_ITEM_LIST;
      this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true) {
          this.loadTableData();
        }
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    });
  }

  /**
   * Loads Table Data (Settings)
   */
  loadTableData() {
    return new Promise(resolve => {
      // Check for Responsiveness
      this.onTableResize();
      // Removes table Storage on load if present
      sessionStorage.removeItem(AppTableKeysData.VENDOR_ITEM_TABLE_KEY);
      this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_ITEM_LIST).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.tableSupportBase.tableDataProcess(this.table, res, this.appConstant.GRID_VENDOR_ITEM_LIST, this.columnSelect);
          } else {
            this.notificationService.errorMessage(res.body.message);
          }
          resolve(true);
        }, (error => {
          this.notificationService.errorMessage(error);
        })
      );
    });

  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.itemService.successfullyMappedVendorItem.subscribe(value => {
      if (value != null && value) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: ItemTableDto) {
    this.activeAction = val;
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
    this.itemService.getVendorItemTableData(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = res.body.data;
          this.tableSupportBase.totalRecords = res.body.totalRecords;
          if (this.tableSupportBase.totalRecords === 0) {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
          } else {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  ngOnDestroy(): void {
    this.itemService.successfullyMappedVendorItem.next(false);
    sessionStorage.removeItem(AppTableKeysData.VENDOR_ITEM_TABLE_KEY);
  }

}
