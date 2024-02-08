import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {PoNumberConfigureService} from '../../../shared/services/po-number-configuration/po-number-configure.service';
import {Table} from 'primeng/table';
import {AppConstant} from '../../../shared/utility/app-constant';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {PoNumberFormatDto} from '../../../shared/dto/po-number-configuration/po-number-format-dto';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {PoService} from '../../../shared/services/po/po.service';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-po-number-list',
  templateUrl: './po-number-list.component.html',
  styleUrls: ['./po-number-list.component.scss']
})
export class PoNumberListComponent implements OnInit {
  public poId: number;
  public appAuthorities = AppAuthorities;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant = new AppConstant();

  constructor(public poNumberConfigureService: PoNumberConfigureService, public gridService: GridService,
              public privilegeService: PrivilegeService, public poService: PoService, public billsService: BillsService,
              public messageService: NotificationService, public confirmationService: ConfirmationService) {
  }

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
  public activeAction: PoNumberFormatDto = new PoNumberFormatDto();

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
  }

  /**
   * change status to status
   * @param status status
   */
  getStatus(status: any) {
    switch (status) {
      case AppEnumConstants.STATUS_APPROVED: {
        return AppEnumConstants.LABEL_ACTIVE;
      }
      case AppEnumConstants.STATUS_DELETED: {
        return AppEnumConstants.LABEL_DELETED;
      }
    }
  }

  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.PO_NUMBER_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_PO_NUMBER_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PO_NUMBER_TABLE_KEY, this.columnSelect);
    });
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PO_NUMBER_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_PO_NUMBER_LIST;
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

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        authCode: true,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_COMMON,
        command: () => {
          this.isEditPONumberFormat = true;
          this.poId = this.activeAction.id;

        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        authCode: true,
        icon: AppIcons.ICON_DELETE,
        status: this.enums.STATUS_COMMON,
        command: () => {
          this.deletePONumberFormat();
        }
      },
    ];
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.poNumberConfigureService.getPoNumberTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
   * @param poNumberFormatDto object to poNumberFormatDto object
   */
  actionButtonClick(poNumberFormatDto: PoNumberFormatDto) {
    this.activeAction = poNumberFormatDto;
  }

  /**
   * this method can be used to delete PO number format
   */
  deletePONumberFormat() {
    this.confirmationService.confirm({
      message: 'You want to delete this Purchase Order Number format',
      key: 'poNumberKey',
      accept: () => {
        this.poNumberConfigureService.deletePoNumberFormat(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.messageService.successMessage(HttpResponseMessage.PO_NUMBER_FORMAT_DELETED_SUCCESSFULLY);
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.messageService.infoMessage(res.body.message);
          }
        }, error => {
          this.messageService.errorMessage(error);
        });
      }
    });
  }
}
