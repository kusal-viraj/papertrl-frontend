import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Table} from 'primeng/table';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {VendorPaymentTableDto} from '../../../shared/dto/vendor/vendor-payment-table-dto';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {BillPaymentMasterDto} from '../../../shared/dto/bill-payment/bill-payment-master-dto';
import {BillPaymentDetailsComponent} from '../../bills/bill-payment-details/bill-payment-details.component';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillsService} from "../../../shared/services/bills/bills.service";
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {Menu} from "primeng/menu";
import {ConfirmDialog} from "primeng/confirmdialog";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-vendor-payment',
  templateUrl: './vendor-payment.component.html',
  styleUrls: ['./vendor-payment.component.scss']
})
export class VendorPaymentComponent implements OnInit, OnDestroy {

  @Input() fromVendor: boolean;
  @Input() vendorId: any;
  public isChangeExpense = false;

  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public activeAction: any; // Selected Action Button
  public tableActionList: any [] = [];  // Action Button List
  public billPaymentDto: BillPaymentMasterDto = new BillPaymentMasterDto();
  public downloadActions: any [] = [];
  public downloadActionsOne: any [] = [];
  public exportActionsOne: any [] = [];
  public exportActions: any [] = [];

  public bulkButtonListResponsive: any;
  public billId: any;
  public billPanel: boolean;

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;


  public paymentPanel: boolean;
  public isMarkAsMailed: boolean;
  public isChangeBill = false;
  public label: any;
  public ids: number [] = new Array();

  public vendorList: DropdownDto = new DropdownDto();
  public poList: DropdownDto = new DropdownDto();

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();
  public formGroup: FormGroup;


  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('columnSelect') public columnSelect: any;
  @ViewChild('dt') public table: Table;
  @ViewChild('billPaymentDetailComponent') public billPaymentDetailComponent: BillPaymentDetailsComponent;
  @ViewChild('billOverlay') public billOverlay: OverlayPanel;
  @ViewChild('poOverlay') poOverlay: OverlayPanel;
  @ViewChild('menu') menu: Menu;
  public viewBill = false;
  public billIdToView = false;
  public overlayId: any;
  cancelLoading = false;


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }


  constructor(public messageService: MessageService, public billPaymentService: BillPaymentService,
              public gridService: GridService, public confirmationService: ConfirmationService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public billsService: BillsService, public detailViewService: DetailViewService,
              private formBuilder: FormBuilder) {
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.PAYMENT_TABLE_KEY);
    this.detailViewService.closeBillDetailView();
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_CSV_EXPORT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPORT);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);


    this.formGroup = this.formBuilder.group({
      cancelReason: [null, Validators.required]
    });

    this.loadTableData();
    this.actionButtonInit();
    this.actionData();
    this.getVendorList();
    this.getPoList();
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.billPaymentService.getVendorBillPaymentTableData(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
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
   * Loads Table Data (Settings)
   */
  loadTableData() {
    return new Promise(resolve => {
      this.selectedColumns = [];
      // Check for Responsiveness
      this.onTableResize();
      // Removes table Storage on load if present
      sessionStorage.removeItem(AppTableKeysData.PAYMENT_TABLE_KEY);
      this.gridService.getTableStructure(this.appConstant.GRID_VENDOR_BILL_PAYMENT_LIST).subscribe((res: any) => {
        this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PAYMENT_TABLE_KEY, this.columnSelect);
        resolve(true);
      });
    });
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableActionList = [
      {
        label: this.actionLabelEnum.ACTION_LABEL_MARK_AS_MAILED,
        status: this.enums.STATUS_PAID,
        icon: this.iconEnum.ICON_MARK_AS_MAILED,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_MARK_AS_MAILED),
        command: () => {
          this.isMarkAsMailed = true;
          this.isChangeBill = false;
        },
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_CHANGE_DOCUMENT,
        payStatus: this.enums.STATUS_TRANSACTION_SUCCESS,
        icon: this.iconEnum.ICON_CHANGE_BILL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_CHANGE_DOCUMENT),
        command: () => {
          if (this.activeAction['txn.documentType'] === AppDocumentType.BILL) {
            this.isChangeExpense = false;
            this.isMarkAsMailed = false;
            this.isChangeBill = true;
          } else {
            this.isChangeExpense = true;
            this.isMarkAsMailed = false;
            this.isChangeBill = false;
          }
        },
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_VOID_PAYMENT,
        status: this.enums.STATUS_PAID,
        icon: this.iconEnum.ICON_VOID_PAYMENT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_REVOKE_PAYMENT),
        command: () => {
          this.voidPayment();
        },
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DETAIL_VIEW),
        command: () => {
          this.billPaymentDetailComponent.openDrawer(this.activeAction.id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_VIEW_BILL,
        status: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_VIEW_BILL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.BILL_PAYMENT_VIEW_BILLS),
        command: () => {
          this.billIdToView = this.activeAction.billId;
          this.viewBill = true;
        },
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_RECEIPT,
        status: 'receipt',
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DOWNLOAD_RECEIPT),
        command: () => {
          this.downloadBillPayment(this.activeAction.id);
        },
      },
    ];
  }


  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PAYMENT_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_VENDOR_BILL_PAYMENT_LIST;
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
  actionButtonClick(val: VendorPaymentTableDto) {
    this.activeAction = val;
  }

  /**
   * inactive user method
   */
  voidPayment() {
    this.confirmationService.confirm({
      message: 'You want to void this Bill Payment',
    });
  }

  submitCancelVCard(cd: ConfirmDialog){
    if (!this.formGroup.valid){
      new CommonUtility().validateForm(this.formGroup);
      return;
    }
    this.cancelLoading = true;
    this.billPaymentService.cancelTransaction(this.activeAction.id, this.formGroup.get('cancelReason').value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.PAYMENT_ROVOKE_SUCCESSFULLY);
        this.ids = [];
        this.formGroup.reset();
        cd.hide();
        this.loadData(this.tableSupportBase.searchFilterDto);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.cancelLoading = false;
    }, error => {
      this.cancelLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Change action button array list according to status
   * @param status statua
   * @param isReceiptInList to receipt name
   */
  actionButtonList(status, receiptFileName) {
    return this.tableActionList.filter(this.isActionMatch(status, AppEnumConstants.STATUS_COMMON, receiptFileName));
  }

  /**
   * This method use for filter table action match by element status
   * @param status string
   * @param common to common status
   * @param isReceiptInList to receipt name
   */
  isActionMatch(status, common, receiptFileName) {
    return function f(element) {
      return ((element.status === status || element.status === common) || (element.status === 'receipt' && receiptFileName !== undefined))
        && element.authCode;
    };
  }

  /**
   * get refreshTable data
   * @param value to emitted value
   */
  isRefreshTable(value) {
    if (value === 'PAYMENT_UPDATE') {
      this.loadData(this.tableSupportBase.searchFilterDto);
      this.actionButtonInit();
    }
  }

  /**
   * this method can used to get actions
   */

  actionData() {
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
   * Download Bill
   */
  downloadBillPayment(id) {
    if (id != null) {
      this.billPaymentService.downloadBillPaymentReceipt(id).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          console.log('start download:', res);
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Receipts.pdf');
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
   * Export Bulk Data
   */
  bulkExportSelected() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.billPaymentService.bulkExportSelected(ids).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', 'Receipts.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.notificationService.successMessage(HttpResponseMessage.BILL_PAYMENTS_EXPORTED_SUCCESSFULLY);
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
    this.billPaymentService.vendorPaymentBulkExportAll(this.tableSupportBase.searchFilterDto, this.vendorId).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Receipts.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.ALL_BILL_PAYMENTS_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
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
   * This method can be use for get dropdown value
   * @param col col name
   */
  getDropdownData(col: any) {
    switch (col.field) {
      case 'vi.vendorId':
        return this.vendorList.data;

      case 'chk.status':
        return col.dropdownValues;

      case 'vi.poId':
        return this.poList.data;

      case 'chk.exportStatus':
        return col.dropdownValues;
    }
  }

  /**
   * A Single value hover from table
   * @param field to filed
   * @param obj to customer obj
   * @param event to click event
   */
  tdHover(field, obj: any, event) {
    if (field === 'vi.poId' && this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW)) {
      this.overlayId = obj.poId;
      showOverlay(this.poOverlay);
    }

    if (field === 'vi.billNo' && this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
      this.overlayId = obj.billId;
      showOverlay(this.billOverlay);
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
      case 'vi.poId':
        return !!this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_DETAIL_VIEW);
      case 'vi.billNo':
        return !!this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any) {
    if (field === 'vi.billNo' && this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
      this.detailViewService.openBillDetailView(obj.billId);
    }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.poOverlay.overlayVisible) {
      this.poOverlay.hide();
    }
    if (this.billOverlay.overlayVisible) {
      this.billOverlay.hide();
    }
  }
}
