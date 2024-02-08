import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../../shared/utility/table-support-base';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {PaymentType} from '../../../../shared/dto/payment/PaymentType';
import {AppTableKeysData} from '../../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {GridService} from '../../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {PaymentTypeService} from '../../../../shared/services/support/payment-type.service';
import {PrivilegeService} from '../../../../shared/services/privilege.service';
import {AppWindowResolution} from '../../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {AppActionLabel} from '../../../../shared/enums/app-action-label';
import {AppIcons} from '../../../../shared/enums/app-icons';
import {AppAuthorities} from '../../../../shared/enums/app-authorities';
import {LazyLoadEvent} from 'primeng/api';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {PaymentProviderService} from '../../../../shared/services/support/payment-provider.service';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {AppTableHeaderActions} from "../../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";

@Component({
  selector: 'app-payment-provider-list',
  templateUrl: './payment-provider-list.component.html',
  styleUrls: ['./payment-provider-list.component.scss']
})
export class PaymentProviderListComponent implements OnInit, OnDestroy {
  public tableSupportBase = new TableSupportBase();
  public enums = AppEnumConstants;
  public activeAction: PaymentType;
  public tableKeyEnum = AppTableKeysData;
  public id: any;
  public editPaymentProvider: boolean;
  public viewPaymentType: boolean;
  paymentTypeList: DropdownDto = new DropdownDto();

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
              public paymentTypeService: PaymentTypeService, public privilegeService: PrivilegeService,
              public paymentProviderService: PaymentProviderService) {
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
    this.getPaymentDropDownList(this.paymentTypeList);
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.PAYMENT_PROVIDER_TABLE_KEY);
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
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PAYMENT_PROVIDER_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_PAYMENT_PROVIDER_LIST;
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
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_PROVIDER_EDIT),
        command: () => {
          this.editPaymentProvider = true;
          this.viewPaymentType = false;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: this.enums.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_PROVIDER_ACTIVATE),
        command: () => {
          this.editPaymentProvider = false;
          this.viewPaymentType = false;
          this.changePaymentProviderStatus(HttpResponseMessage.PAYMENT_PROVIDER_ACTIVATED_SUCCESSFULLY);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_PROVIDER_INACTIVATE),
        command: () => {
          this.editPaymentProvider = false;
          this.viewPaymentType = false;
          this.changePaymentProviderStatus(HttpResponseMessage.PAYMENT_PROVIDER_INACTIVATED_SUCCESSFULLY);
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
    sessionStorage.removeItem(AppTableKeysData.PAYMENT_PROVIDER_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_PAYMENT_PROVIDER_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PAYMENT_PROVIDER_TABLE_KEY, this.columnSelect);
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
    this.paymentProviderService.getPaymentProviderList(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
   * inactivate Payment Types
   */
  changePaymentProviderStatus(successMsg: string) {
    this.paymentProviderService.changePaymentProviderStatus(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(successMsg);
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getPaymentDropDownList(instance: DropdownDto) {
    this.paymentTypeService.getPaymentDropDownList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        instance.data = res.body;
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
}
