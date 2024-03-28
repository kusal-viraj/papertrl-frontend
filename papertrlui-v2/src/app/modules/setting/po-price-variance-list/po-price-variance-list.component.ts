import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PoNumberConfigureService} from '../../../shared/services/po-number-configuration/po-number-configure.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {PoService} from '../../../shared/services/po/po.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {PoNumberFormatDto} from '../../../shared/dto/po-number-configuration/po-number-format-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {Table} from 'primeng/table';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PoPriceVarianceService} from '../../../shared/services/settings/po-price-variance/po-price-variance.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-po-price-variance-list',
  templateUrl: './po-price-variance-list.component.html',
  styleUrls: ['./po-price-variance-list.component.scss']
})
export class PoPriceVarianceListComponent implements OnInit {

  public poVendorPriceId: number;
  public appAuthorities = AppAuthorities;
  public vendorList: DropdownDto = new DropdownDto();
  public appConstant = new AppConstant();
  public overlayId: any;
  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @ViewChild('menu') menu: Menu;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];

  constructor(public poNumberConfigureService: PoNumberConfigureService, public gridService: GridService, public billsService: BillsService,
              public privilegeService: PrivilegeService, public poService: PoService, public poPriceVarianceService: PoPriceVarianceService,
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

  @Output() deptAddedFromEdit = new EventEmitter();
  @Input() public tableSupportBase = new TableSupportBase();

  public isEditPoPriceConfiguration = false;
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;
  public activeAction: PoNumberFormatDto = new PoNumberFormatDto();
  public departments: DropdownDto = new DropdownDto();

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
    this.getVendorList();
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorList.data = res.body;
        this.vendorList.addAll();
      }
    }, error => {
      this.messageService.errorMessage(error);
    });
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
    sessionStorage.removeItem(AppTableKeysData.PO_PRICE_VARIANCE_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_PO_PRICE_VARIANCE_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PO_PRICE_VARIANCE_TABLE_KEY, this.columnSelect);
    });
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PO_PRICE_VARIANCE_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_PO_PRICE_VARIANCE_LIST;
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
          this.isEditPoPriceConfiguration = true;
          this.poVendorPriceId = this.activeAction.id;

        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        authCode: true,
        icon: AppIcons.ICON_DELETE,
        status: this.enums.STATUS_COMMON,
        command: () => {
          this.deletePoPriceVariance();
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
    this.poPriceVarianceService.getPoPriceVarianceTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  deletePoPriceVariance() {
    this.confirmationService.confirm({
      message: 'You want to delete this Purchase Order Variance Allowance',
      key: AppConstant.PO_PRICE_VARIANCE_KEY_FOR_DELETE,
      accept: () => {
        this.poPriceVarianceService.deletePoPriceVariance(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.messageService.successMessage(HttpResponseMessage.PO_PRICE_VARIANCE_DELETED_SUCCESSFULLY);
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

  /**
   * get filter dropdown
   * @param col to column object
   */
  getDropDowns(col: any) {
    switch (col.field) {
      case 'variance.vendorId':
        return this.vendorList.data;
      default :
        return col.dropdownValues;
    }
  }

  departmentAdded() {
    this.deptAddedFromEdit.emit();
  }

  /**
   * A Single value hover from table
   * @param field to filed
   * @param obj to customer obj
   * @param event to click event
   */
  tdHover(field, obj: any, event) {
    if (obj.vendorId !== 0 && field === 'variance.vendorId' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.overlayId = obj.vendorId;
      showOverlay(this.vendorOverlay);
    }

    function showOverlay(overlay) {
      if (overlay.target === null || overlay.target === undefined) {
        overlay.show(event);
      }
    }
  }

  /**
   * Is the field is has data to show in overlay
   * @param field
   * @param obj
   */
  isClassHover(field, obj) {
    if (obj.vendorId === 0) {
      return false;
    }
    switch (field) {
      case 'variance.vendorId':
        return !!this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any, event) {
    // if (field === 'po.id') {
    //   this.detailViewService.openBillDetailView(obj.id);
    // }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.vendorOverlay.overlayVisible) {
      this.vendorOverlay.hide();
    }
  }

}
