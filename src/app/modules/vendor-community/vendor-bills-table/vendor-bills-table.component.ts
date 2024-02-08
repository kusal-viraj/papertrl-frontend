import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {ExpenseTableDto} from '../../../shared/dto/expense/expense-table-dto';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {BillMasterDto} from "../../../shared/dto/bill/bill-master-dto";
import {AuditTrialDto} from "../../../shared/dto/common/audit-trial/audit-trial-dto";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {VendorInvoiceService} from "../../../shared/services/vendor-community/vendor-invoice.service";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {BulkNotificationDialogService} from "../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppConstant} from "../../../shared/utility/app-constant";
import {AppBulkButton} from "../../../shared/enums/app-bulk-button";
import {VendorBillTableDto} from "../../../shared/dto/vendor/vendor-bill-table-dto";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-vendor-bills-table',
  templateUrl: './vendor-bills-table.component.html',
  styleUrls: ['./vendor-bills-table.component.scss']
})
export class VendorBillsTableComponent implements OnInit, OnDestroy {
  public originalFileName: string;

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;

  public activeAction: any; // Selected Action Button
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public tableActionList: any [] = [];  // Action Button List

  public billPanel: boolean;
  public bulkButtonListResponsive: any;
  public id: any;
  public tenantId: any;
  public detailView = false;
  public auditTrialPanel: boolean;
  public auditTrial: AuditTrialDto[];
  public downloadActions: any [] = [];
  public downloadActionsOne: any [] = [];
  public exportActionsOne: any [] = [];
  public exportActions: any [] = [];

  public billNo: string;

  public poList: DropdownDto = new DropdownDto();
  public addNote = false;
  public termList: DropdownDto = new DropdownDto();
  public multiSelectDropDown: DropdownDto = new DropdownDto();

  public customers: DropdownDto = new DropdownDto();

  public reSubmit = false;
  public isEInvoiceType = false;
  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();

  @Output() isViewContent = new EventEmitter();

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
   @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    // this.onTableResize();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  constructor(public vendorInvoiceService: VendorInvoiceService, public gridService: GridService,
              public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public privilegeService: PrivilegeService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.BILL_TABLE_KEY);
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.getCustomerList();
    this.loadTableData();
    this.actionButtonInit();
    this.actionData();
  }


  getCustomerList() {
    this.vendorInvoiceService.getCustomerList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.customers.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
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
    sessionStorage.removeItem(AppTableKeysData.BILL_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_COMMUNITY_INVOICE_SUMMARY_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.BILL_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * This method use for get bulk button list data
   */


  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableActionList = [

      {
        label: this.actionLabelEnum.ACTION_LABEL_EDIT_RESUBMIT,
        status: this.enums.STATUS_REJECT,
        icon: this.iconEnum.ICON_EDIT_RESUBMIT,
        isEdit: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INVOICE_EDIT),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.id = this.activeAction.id;
              this.tenantId = this.activeAction.tenantId;
              this.detailView = false;
              this.reSubmit = true;
            }
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INVOICE_DETAIL_VIEW),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              this.id = this.activeAction.id;
              this.tenantId = this.activeAction.tenantId;
              this.isEInvoiceType = this.activeAction.invType === 'E';
              this.reSubmit = false;
              this.detailView = true;
            }
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_INVOICE,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INVOICE_DOWNLOAD_INVOICE),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              const id = this.activeAction.attachmentId;
              const tenantId = this.activeAction.tenantId;
              this.downloadBill(id, tenantId);
            }
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EXPORT,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_EXPORT,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INVOICE_CSV_EXPORT),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              const id = this.activeAction.id;
              const tenantId = this.activeAction.tenantId;
              this.export(id, tenantId);
            }
          });
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_REJECT,
        icon: this.iconEnum.ICON_DELETE,
        isEdit: false,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INVOICE_DELETE),
        command: () => {
          this.isCheckTenantActive(this.activeAction.tenantId).then(value => {
            if (value){
              const id = this.activeAction.id;
              const tenantId = this.activeAction.tenantId;
              this.deleteBill(id, tenantId);
            }
          });
        }
      },

    ];
  }

  /**
   * this method can used to get actions
   */

  actionData() {
    this.downloadActions = [
      {
        label: this.actionLabelEnum.ACTION_DOWNLOAD_SELECTED,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        command: () => {
          this.bulkDownloadSelected();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_DOWNLOAD_All,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        command: () => {
          this.bulkDownloadAll();
        }
      },
    ];

    this.downloadActionsOne = [
      {
        label: this.actionLabelEnum.ACTION_DOWNLOAD_All,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        command: () => {
          this.bulkDownloadAll();
        }
      },
    ];

    this.exportActions = [
      {
        label: this.actionLabelEnum.ACTION_EXPORT_SELECTED,
        icon: this.iconEnum.ICON_EXPORT,
        command: () => {
          this.bulkExportSelected();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_EXPORT_All,
        icon: this.iconEnum.ICON_EXPORT,
        command: () => {
          this.bulkExportAll();
        }
      },
    ];
    this.exportActionsOne = [
      {
        label: this.actionLabelEnum.ACTION_EXPORT_All,
        icon: this.iconEnum.ICON_EXPORT,
        command: () => {
          this.bulkExportAll();
        }
      },
    ];
  }

  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status, invType) {
    return this.tableActionList.filter(this.isActionMatch(status, invType,
      AppEnumConstants.STATUS_COMMON));
  }

  isActionMatch(status, invType, common) {
    return function f(element) {
      return ((element.status === status || element.status === common) && element.authCode &&
        (!element.isEdit || ((invType === 'E' && status !== 'R') || invType === 'O')));
    };
  }

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_DELETE:
        this.bulkDelete();
        break;
      case AppBulkButton.BUTTON_REJECT:
        this.bulkReject();
        break;
    }
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
    this.vendorInvoiceService.getDashboardBillTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.BILL_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_COMMUNITY_INVOICE_SUMMARY_LIST;
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
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: VendorBillTableDto) {
    this.originalFileName = JSON.parse(JSON.stringify(val))['vdbill.invoiceNo'];
    this.activeAction = val;
  }

  /**
   * Generate a Detail Report
   */
  generateDetailReport(id) {
    this.vendorInvoiceService.generateDetailReport(id).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        console.log('start download:', res);
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', this.originalFileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Download Bill
   */
  downloadBill(id, tenantId) {
    if (id != null) {
      this.vendorInvoiceService.downloadBill(id, tenantId).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', this.originalFileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * Export Bill in CSV Format
   */
  export(id, tenantId) {
    const ids: any[] = [];
    ids[0] = id;
    this.vendorInvoiceService.exportBill(ids, tenantId).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Invoice.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.SINGEL_BILL_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Delete
   */
  deleteBill(id, tenantId) {
    this.confirmationService.confirm({
      key: 'bill',
      message: 'You want to delete this Invoice',
      accept: () => {
        this.vendorInvoiceService.deleteBill(id, tenantId).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.notificationService.successMessage(HttpResponseMessage.BILL_DELETED_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /*
  BULK ACTIONS ----------------------------------------------------------------------------------------------------------->
   */


  /**
   * Delete Bulk Data
   */
  bulkDelete() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected Invoice(s)',
        key: 'bill',
        accept: () => {
          this.vendorInvoiceService.bulkDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.BILLS_DELETED_SUCCESSFULLY);
                this.getDataFromBackend();
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
   * Reject Bulk Data
   */
  bulkReject() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.vendorInvoiceService.bulkReject(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.BILLS_REJECTED_SUCCESSFULLY);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          }
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * Download Bulk Selections
   */
  bulkDownloadSelected() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.vendorInvoiceService.bulkDownloadSelected(ids).subscribe((res: any) => {
        const blob = new Blob([res.data], {
          type: 'application/zip'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('download', 'Bills');
        window.open(url);
      }, error => {
        this.notificationService.errorMessage(error);
      }, () => {
        this.notificationService.successMessage(HttpResponseMessage.BILLS_DOWNLODED_SUCCESSFULLY);
      });
    }
  }


  /**
   * Download Bulk Selections
   */
  bulkDownloadAll() {
    this.vendorInvoiceService.bulkDownloadAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.notificationService.successMessage(HttpResponseMessage.ALL_BILLS_DOWNLODED_SUCCESSFULLY);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
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
      this.vendorInvoiceService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.BILLS_EXPORTED_SUCCESSFULLY);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          }
        } else {
          this.notificationService.errorMessage(res.body.message);
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
    this.vendorInvoiceService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
        } else {
          this.notificationService.successMessage(HttpResponseMessage.ALL_BILLS_EXPORTED_SUCCESSFULLY);
          this.getDataFromBackend();
          this.tableSupportBase.rows = [];
        }
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
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
   * This method is used to check whether the specified tenant is active or not
   *
   * @param tenantId
   */
  isCheckTenantActive(tenantId) {
    return new Promise(resolve => {
      this.vendorInvoiceService.isTenantActive(tenantId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          resolve(true);
        } else {
          this.notificationService.infoMessage(res.body.message);
          resolve(false);
        }
      }, error => {
        resolve(false);
        this.notificationService.errorMessage(error);
      });
    });
  }

}
