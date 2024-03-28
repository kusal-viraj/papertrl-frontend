import {Component, Input, OnDestroy, OnInit, ViewChild, HostListener, Output, EventEmitter} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {OverlayPanel} from 'primeng/overlaypanel';
import {VendorBillsService} from '../../../shared/services/bills/vendor-bills.service';
import {Subscription} from 'rxjs';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {VendorBillTableDto} from '../../../shared/dto/vendor/vendor-bill-table-dto';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";


@Component({
  selector: 'app-vendor-invoice',
  templateUrl: './vendor-invoice.component.html',
  styleUrls: ['./vendor-invoice.component.scss']
})
export class VendorInvoiceComponent implements OnInit, OnDestroy {

  @Input() fromVendor: boolean;
  @Input() vendorId: any;
  @ViewChild('menu') menu: Menu;

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }


  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  public originalFileName: string;

  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];

  public enums = AppEnumConstants;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;
  public appAuthorities = AppAuthorities;

  public activeAction: VendorBillTableDto; // Selected Action Button
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public tableActionList: any [] = [];  // Action Button List
  public subscription: Subscription;

  public billPanel: boolean;
  public poPanel: boolean;
  public poReceiptPanel: boolean;
  public bulkButtonListResponsive: any;
  public id: any;
  public detailView = false;
  public approveBillView: boolean;
  public auditTrialPanel: boolean;
  public auditTrial: AuditTrialDto[];
  public downloadActions: any [] = [];
  public downloadActionsOne: any [] = [];
  public exportActionsOne: any [] = [];
  public exportActions: any [] = [];
  public tableActiveVendor;
  public tableActiveBillId;

  public billNo: string;

  public vendorList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();
  public poReceiptList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();


  public overlayId: any;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();

  @Output() isViewContent = new EventEmitter();

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: Table;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;
  @ViewChild('paymentOverlay') paymentOverlay: OverlayPanel;
  @ViewChild('poReceiptOverlay') poReceiptOverlay: OverlayPanel;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  constructor(public billsService: BillsService, public gridService: GridService, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public privilegeService: PrivilegeService) {
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.BILL_TABLE_KEY);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_QUICK_APPROVE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.QUICK_APPROVE);
    }
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_REJECT])) {
      this.availableHeaderActions.push(AppTableHeaderActions.REJECT);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_DELETE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_CSV_EXPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPORT);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_DOWNLOAD_BILL)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DOWNLOAD);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.loadTableData();
    this.actionButtonInit();
    this.getPaymentTerms();
    this.getVendorList();
    this.getPoList();
    this.actionData();
  }

  /**
   * this method can be used to get payment terms
   */
  getPaymentTerms() {
    this.billsService.getTermsList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.termList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get vendor related po list
   */
  getPoList() {
    this.billsService.getTablePoList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get date formats
   */
  getPoReceiptList() {
    this.billsService.getTablePoReceiptList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.poReceiptList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList(true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Loads Table Data (Settings)
   */
  loadTableData() {
    return new Promise(resolve => {
      this.selectedColumns = [];
      // Check for Responsiveness
      this.onTableResize();
      // Removes table Storage on load if present
      sessionStorage.removeItem(AppTableKeysData.BILL_TABLE_KEY);
      this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_BILL_LIST).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.BILL_TABLE_KEY, this.columnSelect);
          } else {
            this.notificationService.errorMessage(res.body.message);
          }
          resolve(true);
        }, (error => {
          this.notificationService.errorMessage(error);
        })
      );
    })
  }


  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableActionList = [
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW),
        command: () => {
          this.id = this.activeAction.id;
          this.detailView = true;
          this.approveBillView = true;
        }
      },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_APPROVE_REJECT,
      //   status: this.enums.STATUS_PENDING,
      //   icon: this.iconEnum.ICON_APPROVE_REJECT,
      //   authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT]),
      //   command: () => {
      //     this.id = this.activeAction.id;
      //     this.detailView = false;
      //     this.approveBillView = true;
      //   }
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_UNDO_APPROVAL,
      //   status: this.enums.STATUS_APPROVED,
      //   icon: this.iconEnum.ICON_UNDO_STATUS,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_UNDO_ACTION),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.undoApproval(id);
      //   }
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL,
      //   status: this.enums.STATUS_PENDING,
      //   icon: this.iconEnum.ICON_SKIP_APPROVAL,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_SKIP_APPROVAL),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.skipApproval(id);
      //   }
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_EDIT_RESUBMIT,
      //   status: this.enums.STATUS_REJECT,
      //   icon: this.iconEnum.ICON_EDIT_RESUBMIT,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_EDIT),
      //   command: () => {
      //     this.id = this.activeAction.id;
      //     this.reSubmit = true;
      //   }
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_AUDIT_TRAIL,
      //   status: this.enums.STATUS_COMMON,
      //   icon: this.iconEnum.ICON_AUDIT_TRAIL,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_VIEW_AUDIT_TRAIL),
      //   command: () => {
      //     this.billsService.getAuditTrial(this.activeAction.id).subscribe((res: any) => {
      //       this.billNo = JSON.parse(JSON.stringify(this.activeAction))['bill.billNo'];
      //       this.auditTrial = res.body;
      //       this.auditTrialPanel = true;
      //     });
      //   }
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_GENERATE_DETAILED_REPORT,
      //   status: this.enums.STATUS_APPROVED,
      //   icon: this.iconEnum.ICON_DETAIL_REPORT,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_CSV_EXPORT),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.generateDetailReport(id);
      //   },
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_BILL,
      //   status: this.enums.STATUS_COMMON,
      //   icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_DOWNLOAD_BILL),
      //   command: () => {
      //     const id = this.activeAction.attachmentId;
      //     this.downloadBill(id);
      //   }
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_EXPORT,
      //   status: this.enums.STATUS_COMMON,
      //   icon: this.iconEnum.ICON_EXPORT,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_CSV_EXPORT),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.export(id);
      //   }
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_DELETE,
      //   status: this.enums.STATUS_REJECT,
      //   icon: this.iconEnum.ICON_DELETE,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_DELETE),
      //   command: () => {
      //     const id = this.activeAction.id;
      //     this.deleteBill(id);
      //   }
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_APPLIED_PAYMENTS,
      //   status: this.enums.STATUS_APPROVED,
      //   icon: this.iconEnum.ICON_APPLIED_PAYMENTS,
      //   isApproveAction: false,
      //   isEdit: false,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_APPLY_PAYMENT),
      //   command: () => {
      //     this.tableActiveBillId = this.activeAction.id;
      //     this.tableActiveVendor = this.activeAction.vendorId;
      //     this.isBillPayment = true;
      //   }
      // },
      // {
      //   label: this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE,
      //   status: this.enums.STATUS_COMMON,
      //   icon: this.iconEnum.ICON_CHANGE_ASSIGNEE,
      //   authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_CHANGE_ASSIGNEE),
      //   command: () => {
      //
      //   }
      // },
    ];
  }

  /**
   * Change action button array list according to status
   * @param status statua
   */
  actionButtonList(status, poObj) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON, this.isValidApproveAccess(poObj)));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   */
  isActionMatch(status, common, isAccessible) {
    return function f(element) {
      return ((element.status === status || element.status === common)) && element.authCode && (!element.isApproveAction || isAccessible);
    };
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
      case AppBulkButton.BUTTON_QUICK_APPROVE:
        this.bulkQuickApprove();
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
    this.billsService.getVendorBillTableData(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
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
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_BILL_LIST;
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
   * A Single value hover from table
   * @param field to filed
   * @param obj to customer obj
   * @param event to click event
   */
  tdHover(field, obj: any, event) {
    if (field === 'po.id' && this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW)) {
      this.overlayId = obj.poId;
      showOverlay(this.poOverlay);
    }

    if (field === 'bill.paidAmount' && this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DETAIL_VIEW)) {
      this.overlayId = obj.id;
      showOverlay(this.paymentOverlay);
    }

    if (field === 'receipt.id' && this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DETAIL_VIEW)) {
      this.overlayId = obj.poReceiptId;
      showOverlay(this.poReceiptOverlay);
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
   */
  isClassHover(field) {
    switch (field) {
      case 'po.id':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW);
      case 'bill.paidAmount':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DETAIL_VIEW);
      case 'receipt.id':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PO_RECEIPT_DETAIL_VIEW);

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
    if (this.poOverlay.overlayVisible) {
      this.poOverlay.hide();
    }
    if (this.paymentOverlay.overlayVisible) {
      this.paymentOverlay.hide();
    }
    if (this.poReceiptOverlay.overlayVisible) {
      this.poReceiptOverlay.hide();
    }
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: VendorBillTableDto) {
    this.originalFileName = JSON.parse(JSON.stringify(val))['bill.billNo'];
    this.activeAction = val;
  }

  /**
   * Undo Approval
   */
  undoApproval(id) {
    this.confirmationService.confirm({
      key: 'poUA',
      message: 'You want to undo the Approval',
      accept: () => {
        this.billsService.undoApprove(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.getDataFromBackend();
            this.notificationService.successMessage(HttpResponseMessage.BILL_UNDO_APPROVAL_SUCCESSFULLY);
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
   * Skip Approval
   */
  skipApproval(id) {
    this.billsService.skipApproval(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.notificationService.successMessage(HttpResponseMessage.BILLS_SKIPPED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Generate a Detail Report
   */
  generateDetailReport(id) {
    this.billsService.generateDetailReport(id).subscribe((res: any) => {
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
  downloadBill(id) {
    if (id != null) {
      this.billsService.downloadBill(id).subscribe((res: any) => {
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
  export(id) {
    const tempArray = new Array();
    tempArray.push(id);
    this.billsService.exportBill(tempArray).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Bill');
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
  deleteBill(id) {
    this.confirmationService.confirm({
      key: 'bill',
      message: 'You want to delete this Bill!',
      accept: () => {
        this.billsService.deleteBill(id, false).subscribe((res: any) => {
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
        message: 'You want to delete the selected Bill(s)!',
        key: 'bill',
        accept: () => {
          this.billsService.bulkDelete(ids, false).subscribe((res: any) => {
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
      this.billsService.bulkReject(ids).subscribe((res: any) => {
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
      this.billsService.bulkDownloadSelected(ids).subscribe((res: any) => {
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
    if (this.tableSupportBase.rows.length !== 0) {
      this.bulkDownloadSelected();
      return;
    }
    this.billsService.vendorBulkDownloadAll(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', res.filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.ALL_BILLS_DOWNLODED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Approve Bulk Data
   */
  bulkQuickApprove() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.billsService.bulkApprove(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.BILLS_APPROVED_SUCCESSFULLY);
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
  bulkExportSelected() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.billsService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'invoice');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.notificationService.successMessage(HttpResponseMessage.BILLS_EXPORTED_SUCCESSFULLY);
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
    this.billsService.vendorBillBulkExportAll(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'bill.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.ALL_BILLS_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Applied Payments
   */
  appliedPayments(id: any) {
    this.billsService.appliedPayments(id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        // this.notificationService.successMessage(HttpResponseMessage);
      } else {
        this.notificationService.infoMessage(res.body.message);
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
      case AppEnumConstants.EXPORT_STATUS_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_EXPORT;
      }
      case AppEnumConstants.EXPORT_STATUS_NOT_EXPORT: {
        return AppEnumConstants.EXPORT_LABEL_NOT_EXPORT;
      }
    }
  }

  /**
   * Is User Authorized to approve
   */
  isValidApproveAccess(billObj) {

    const user = JSON.parse(localStorage.getItem('user'));

    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_OVERRIDE_APPROVAL)) {
      return true;
    }

    return this.isApprovalGroupExist(user.approvalGroups, billObj) || this.isApprovalGroupUserExist(user.username, billObj);

  }

  /**
   * Approval Group equals to logged user
   */
  isApprovalGroupExist(approvalGroup, billObj) {
    if (!billObj.approvalGroup) {
      return false;
    }

    return approvalGroup.includes(billObj.approvalGroup);
  }

  /**
   * User equals to logged user
   */
  isApprovalGroupUserExist(approvalUser, billObj) {
    if (!billObj.approvalUser) {
      return false;
    }

    return approvalUser === billObj.approvalUser;
  }


}
