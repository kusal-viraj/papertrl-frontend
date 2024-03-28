import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppConstant} from '../../../shared/utility/app-constant';
import {Table} from 'primeng/table';
import {Menu} from 'primeng/menu';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {CustomerInvoiceService} from '../../../shared/services/customer-invoice/customer-invoice.service';
import {ItemTableDto} from '../../../shared/dto/item/item-table-dto';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Subscription} from 'rxjs';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';


@Component({
  selector: 'app-customer-invoice-list',
  templateUrl: './customer-invoice-list.component.html',
  styleUrls: ['./customer-invoice-list.component.scss']
})
export class CustomerInvoiceListComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();
  public tableKeyEnum = AppTableKeysData;
  public enums = AppEnumConstants;
  public appConstant: AppConstant = new AppConstant();
  public subscription = new Subscription();
  public activeAction: ItemTableDto;
  public tableActionList: any[];
  public availableHeaderActions = [];
  public showFilter = false;
  public showFilterColumns = false;
  public isEdit = false;
  public auditTrial: any;
  public auditTrialPanel = false;

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('customerInvoiceListComponent') customerInvoiceListComponent: CustomerInvoiceListComponent;
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;


  constructor(public gridService: GridService, public notificationService: NotificationService,
              public customerInvoiceService: CustomerInvoiceService, public confirmationService: ConfirmationService,
              public privilegeService: PrivilegeService, public bulkNotificationDialogService: BulkNotificationDialogService) {
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.CUSTOMER_INVOICE_GRID_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_CUSTOMER_INVOICE_LIST;
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
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.CUSTOMER_INVOICE_GRID_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_CUSTOMER_INVOICE_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.CUSTOMER_INVOICE_GRID_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.customerInvoiceService.getCustomerInvoiceData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);

  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }


  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);


    if (this.privilegeService.isAuthorized(AppAuthorities.EXPORT_INVOICE_CSV)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPORT);
    }

    if (this.privilegeService.isAuthorized(AppAuthorities.DELETE_INVOICE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }

    this.loadTableData();
    this.actionButtonInit();
    this.subscription = this.customerInvoiceService.updateTableData.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });

    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);
  }

  /**
   * this method can be used to get label according to status
   */

  getStatus(status) {
    switch (status) {
      case AppEnumConstants.PAYMENT_STATUS_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_PAID;
      }
      case AppEnumConstants.PAYMENT_STATUS_NOT_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_NOT_PAID;
      }
      case AppEnumConstants.PAYMENT_STATUS_PARTIALLY_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_PARTIALLY_PAID;
      }
      case AppEnumConstants.EXPORT_STATUS_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_EXPORT;
      }
      case AppEnumConstants.EXPORT_STATUS_NOT_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_NOT_EXPORT;
      }
      case AppEnumConstants.STATUS_PENDING: {
        return AppEnumConstants.LABEL_PENDING;
      }
      case AppEnumConstants.STATUS_REJECT: {
        return AppEnumConstants.LABEL_REJECT;
      }
      case AppEnumConstants.STATUS_APPROVED: {
        return AppEnumConstants.LABEL_APPROVED;
      }
    }
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: any) {
    this.activeAction = val;
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
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EDIT_INVOICE),
        command: () => {
          this.isEdit = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.DELETE_INVOICE),
        command: () => {
          this.deleteInvoice();
          this.isEdit = false;
        }
      },
      // {
      //   label: AppActionLabel.ACTION_LABEL_DETAIL_VIEW,
      //   icon: AppIcons.ICON_DETAIL_VIEW,
      //   status: this.enums.STATUS_COMMON,
      //   authCode: true,
      //   command: () => {
      //     this.isEdit = false;
      //   }
      // },
      {
        label: AppActionLabel.ACTION_LABEL_MARK_AS_PAID,
        icon: AppIcons.MARK_AS_PAID_ICON,
        status: this.enums.STATUS_UNPROCCCESSED,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.MARK_AS_INVOICE_PAID),
        command: () => {
          this.isEdit = false;
          this.invoiceMarkAsPaid();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_MARK_AS_UNPAID,
        icon: AppIcons.MARK_AS_UNPAID_ICON,
        status: this.enums.STATUS_DONE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.MARK_AS_INVOICE_UNPAID),
        command: () => {
          this.isEdit = false;
          this.invoiceMarkAsUnPaid();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_AUDIT_TRAIL,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.VIEW_INVOICE_AUDIT_TRAIL),
        command: () => {
          this.customerInvoiceService.getAuditTrial(this.activeAction.id).subscribe((res: any) => {
            this.auditTrial = res.body;
            this.auditTrialPanel = true;
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EXPORT,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_EXPORT,
        isApproveAction: false,
        isApplyCreditNote: false,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.EXPORT_INVOICE_CSV),
        command: () => {
          const id = this.activeAction.id;
          this.export(id);
        }
      },
    ];
  }

  // Singal Actions

  /**
   * export single/bulk data
   * @param id to id
   */
  export(id) {
    const tempArray = new Array();
    tempArray.push(id);
    this.customerInvoiceService.exportInvoice(tempArray).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Customer_Invoice.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.SINGEL_BILL_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.CUSTOMER_INVOICE_LIST);
    this.subscription.unsubscribe();
  }

  /**
   * deleteExpense invoice
   */
  deleteInvoice() {
    this.confirmationService.confirm({
      key: 'invoiceDelete',
      message: 'You want to delete this Invoice',
      accept: () => {
        this.customerInvoiceService.deleteInvoice(this.activeAction.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.CUSTOMER_INVOICE_DELETED_SUCCESSFULLY);
            this.tableSupportBase.rows = [];
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * mark invoice as paid
   */
  invoiceMarkAsPaid() {
    this.customerInvoiceService.markInvoiceAsPaid(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.MARK_CUSTOMER_INVOICE_AS_PAID_SUCCESSFULLY);
        this.tableSupportBase.rows = [];
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * mark invoice as unpaid
   * deleteExpense invoice
   */
  invoiceMarkAsUnPaid() {
    this.customerInvoiceService.markInvoiceAsUnPaid(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.MARK_CUSTOMER_INVOICE_AS_UNPAID_SUCCESSFULLY);
        this.tableSupportBase.rows = [];
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  //Bulk Actions

  /**
   * Delete bulk invoice data
   */
  bulkDelete() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected Invoice(s)',
        key: 'invoiceDeleteBulk',
        accept: () => {
          this.customerInvoiceService.bulkDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.SELECTED_C_INVOICES_DELETED_SUCCESSFULLY);
                this.loadData(this.tableSupportBase.searchFilterDto);
                this.tableSupportBase.rows = [];
              }
            } else {
              this.notificationService.errorMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  /**
   * Export Bulk Data
   */
  bulkExportSelected() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.customerInvoiceService.exportInvoice(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Customer_Invoice.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
          this.notificationService.successMessage(HttpResponseMessage.SELECTED_C_INVOICES_EXPORTED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * Export Bulk Data
   */
  bulkExportAll() {
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkExportSelected();
      return;
    }
    this.customerInvoiceService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'customer invoice');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.tableSupportBase.rows = [];
        this.notificationService.successMessage(HttpResponseMessage.ALL_C_INVOICES_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

}
