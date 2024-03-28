import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {GridService} from '../../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {AppWindowResolution} from '../../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {AppActionLabel} from '../../../../shared/enums/app-action-label';
import {AppIcons} from '../../../../shared/enums/app-icons';
import {PaymentTypeService} from '../../../../shared/services/support/payment-type.service';
import {AppAuthorities} from '../../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../../shared/services/privilege.service';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {PaymentType} from '../../../../shared/dto/payment/PaymentType';
import {LazyLoadEvent} from 'primeng/api';
import {AppTableHeaderActions} from "../../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-payment-type-list',
  templateUrl: './payment-type-list.component.html',
  styleUrls: ['./payment-type-list.component.scss']
})
export class PaymentTypeListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();
  public enums = AppEnumConstants;
  public activeAction: PaymentType;
  public tableKeyEnum = AppTableKeysData;
  public id: any;
  public editPaymentType: boolean;
  public viewPaymentType: boolean;

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
              public paymentTypeService: PaymentTypeService, public privilegeService: PrivilegeService) {
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
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.PAYMENT_TYPE_TABLE_KEY
    );
  }

  /**
   * this method used when resizing the table
   */
  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PAYMENT_TYPE_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_PAYMENT_TYPE_LIST;
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

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        icon: AppIcons.ICON_EDIT,
        status: this.enums.STATUS_COMMON,
        readOnly: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_TYPES_EDIT),
        command: () => {
          this.editPaymentType = true;
          this.viewPaymentType = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        readOnly: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_TYPES_ACTIVATE),
        command: () => {
          this.editPaymentType = false;
          this.viewPaymentType = false;
          this.activePaymentType();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        readOnly: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_TYPES_INACTIVATE),
        command: () => {
          this.editPaymentType = false;
          this.viewPaymentType = false;
          this.inactivePaymentType();
        }
      },
    ];
  }

  /**
   * Loads Table Data
   */
    loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.PAYMENT_TYPE_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_PAYMENT_TYPE_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PAYMENT_TYPE_TABLE_KEY, this.columnSelect);
    });
  }


  /**
   * get refreshTable data
   * @param value to emitted value
   */
  isRefreshTable(value) {
    if (value) {
      this.loadData(this.tableSupportBase.searchFilterDto);
    }
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.paymentTypeService.getPaymentTypeList(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
  actionButtonClick(val) {
    this.activeAction = val;
    this.id = val.id;
  }


  /**
   * activate Payment Types
   */
  activePaymentType() {
    this.paymentTypeService.changePaymentTypeStatus(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.PAYMENT_TYPE_ACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * inactivate Payment Types
   */
  inactivePaymentType() {
    this.paymentTypeService.changePaymentTypeStatus(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.PAYMENT_TYPE_INACTIVATED_SUCCESSFULLY);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method can be used to return dropdown list
   * @param col to object
   */
  getDropDowns(col) {
    switch (col.field) {
      case 'pay.status': {
        return col.dropdownValues;
      }
    }
  }

  /**
   * Change action button array list according to status
   * @param approvalStatus to approval status
   * @param paymentStatus to payment status
   */
  actionButtonList(status, readOnly) {
    return this.tableSupportBase.tableActionList.filter(this.isActionMatch(status, readOnly,
      AppEnumConstants.STATUS_COMMON));
  }

  /**
   * This method use for filter table action match by element status
   * @param approvalStatus to approval status
   * @param paymentStatus to payment status
   * @param common to status common
   */
  isActionMatch(status, readOnly, common) {
    return function f(element) {
      return ((element.status === status || element.status === common) && element.authCode
        && (element.readOnly || element.readOnly === readOnly));
    };
  }
}
