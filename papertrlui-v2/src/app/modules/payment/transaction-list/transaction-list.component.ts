import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {VendorPaymentTableDto} from '../../../shared/dto/vendor/vendor-payment-table-dto';
import {BillPaymentMasterDto} from '../../../shared/dto/bill-payment/bill-payment-master-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {OverlayPanel} from 'primeng/overlaypanel';
import {BillPaymentDetailsComponent} from '../../bills/bill-payment-details/bill-payment-details.component';
import {Subscription} from 'rxjs';
import {ConfirmationService, LazyLoadEvent, MessageService} from 'primeng/api';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {PaymentService} from '../../../shared/services/payments/payment.service';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit, OnDestroy {

  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public activeAction: any; // Selected Action Button
  public tableActionList: any [] = [];  // Action Button List
  public billPaymentDto: BillPaymentMasterDto = new BillPaymentMasterDto();

  public bulkButtonListResponsive: any;
  public billId: any;
  public overlayId: any;
  public remarks: any;

  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public appDocumentType = AppDocumentType;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public tableKeyEnum = AppTableKeysData;


  public isMarkAsMailed: boolean;
  public isChangeBill = false;
  public isChangeExpense = false;
  public label: any;
  public ids: number [] = [];

  public originalFileName: string;
  public appConstant: AppConstant = new AppConstant();
  public availableHeaderActions = [];
  public paymentApprove = false;
  public auditTrialPanel = false;
  public auditTrial: AuditTrialDto[];

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);

  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('columnSelect')
  public columnSelect: any;
  @ViewChild('dt')
  public table: Table;
  @ViewChild('billOverlay') public billOverlay: OverlayPanel;
  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @ViewChild('expenseOverlay') expenseOverlay: OverlayPanel;
  @ViewChild('cardsOverlay') cardsOverlay: OverlayPanel;
  @ViewChild('reasonOverlay') reasonOverlay: OverlayPanel;
  @ViewChild('billPaymentDetailComponent')
  public billPaymentDetailComponent: BillPaymentDetailsComponent;
  public viewBill = false;
  public billIdToView = false;
  public subscription = new Subscription();
  showFilter = false;
  showFilterColumns = false;
  public formGroup: FormGroup;
  cancelLoading = false;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }


  constructor(public messageService: MessageService, public billPaymentService: BillPaymentService,
              public gridService: GridService, public confirmationService: ConfirmationService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public paymentService: PaymentService, public detailViewService: DetailViewService,
              private formBuilder: FormBuilder, public gaService: GoogleAnalyticsService) {
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
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_QUICK_APPROVE)) {
      this.availableHeaderActions.push(AppTableHeaderActions.QUICK_APPROVE);
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_REVOKE_PAYMENT)) {
      this.availableHeaderActions.push(AppTableHeaderActions.PAYMENT_CANCEL);
    }
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
    this.subscription = this.billPaymentService.offlinePayTableRefresh.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.loadData(this.tableSupportBase.searchFilterDto);
      }
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.billPaymentService.getBillPaymentTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      this.tableSupportBase.dataSource = res.body.data;
      this.tableSupportBase.totalRecords = res.body.totalRecords;
      this.tableSupportBase.rowSelected(null, null);
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
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.PAYMENT_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_BILL_PAYMENT_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PAYMENT_TABLE_KEY, this.columnSelect);
    });
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
        approvalStatus: this.enums.STATUS_PENDING,
        icon: AppIcons.ICON_APPROVE,
        isApproveAction: true,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.PAYMENT_APPROVE, AppAuthorities.PAYMENT_REJECT,
          AppAuthorities.PAYMENT_OVERRIDE_APPROVAL]),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
            AppAnalyticsConstants.MODULE_NAME_PAYMENT,
            AppActionLabel.ACTION_LABEL_APPROVE_REJECT,
            );
          this.paymentApprove = true;
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_MARK_AS_MAILED,
        approvalStatus: this.enums.STATUS_APPROVED,
        icon: this.iconEnum.ICON_MARK_AS_MAILED,
        isMailedAction: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_MARK_AS_MAILED),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_MARK_AS_MAILED,
            AppAnalyticsConstants.MODULE_NAME_PAYMENT,
            this.actionLabelEnum.ACTION_LABEL_MARK_AS_MAILED
          );
          this.isMarkAsMailed = true;
          this.isChangeBill = false;
        },
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_CHANGE_DOCUMENT,
        approvalStatus: this.enums.STATUS_APPROVED,
        icon: this.iconEnum.ICON_CHANGE_BILL,
        isDocAction: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_CHANGE_DOCUMENT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_CHANGE_DOCUMENT,
            AppAnalyticsConstants.MODULE_NAME_PAYMENT,
            this.actionLabelEnum.ACTION_LABEL_CHANGE_DOCUMENT,
          );
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
        payStatus: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_VOID_PAYMENT,
        isVoidAction: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_REVOKE_PAYMENT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_VOID_PAYMENT,
            AppAnalyticsConstants.MODULE_NAME_PAYMENT,
            this.actionLabelEnum.ACTION_LABEL_VOID_PAYMENT,
          );
          this.cancelPayment(true);
        },
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
        payStatus: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DETAIL_VIEW,
        isDetailAction: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DETAIL_VIEW),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
            AppAnalyticsConstants.MODULE_NAME_PAYMENT,
            this.actionLabelEnum.ACTION_LABEL_DETAIL_VIEW,
          );
          this.billPaymentDetailComponent.openDrawer(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
        payStatus: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_AUDIT_TRAIL,
        isAuditAction: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_VIEW_AUDIT_TRIAL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
            AppAnalyticsConstants.MODULE_NAME_PAYMENT,
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL
          );
          this.getAuditTrial(this.activeAction.id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_RECEIPT,
        isDownLoadAction: true,
        icon: this.iconEnum.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_DOWNLOAD_RECEIPT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_RECEIPT,
            AppAnalyticsConstants.MODULE_NAME_PAYMENT,
            this.actionLabelEnum.ACTION_LABEL_DOWNLOAD_RECEIPT,
          );
          this.downloadBillPayment(this.activeAction.offlinePaymentId);
        },
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_EXPORT,
        payStatus: this.enums.STATUS_COMMON,
        icon: this.iconEnum.ICON_EXPORT,
        isExportAction: true,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_CSV_EXPORT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_EXPORT,
            AppAnalyticsConstants.MODULE_NAME_PAYMENT,
            this.actionLabelEnum.ACTION_LABEL_EXPORT,
          );
          const id = this.activeAction.id;
          this.exportSingleRecord(id);
        }
      },
    ];
  }

  /**
   * Change action button array list according to status
   */
  actionButtonList(obj) {
    return this.tableActionList.filter(this.isActionMatch(obj['txn.status'], obj['txn.paymentStatus'],
      AppEnumConstants.STATUS_COMMON, obj.receiptFileName, this.isValidApproveAccess(obj), obj['txn.isOnline'],
      obj['txn.documentType'], obj.paymentTypeId));
  }

  /**
   * This method use for filter table action match by element status
   * @param approvalStatus approval status
   * @param payStatus payment status
   * @param common a common status
   * @param receiptFileName receipt file name if available
   * @param isAccessible is the approver at current
   * @param isOnline online status of the payment record
   * @param docType Document type
   * @param paymentTypeId Payment
   */
  isActionMatch(approvalStatus, payStatus, common, receiptFileName, isAccessible, isOnline, docType, paymentTypeId) {
    return function f(element) {
      return element.authCode && (
        (!element.isApproveAction || (element.isApproveAction && element.approvalStatus === approvalStatus
          && isAccessible)) &&
        (!element.isMailedAction || (element.isMailedAction && element.approvalStatus === approvalStatus
          && !isOnline && docType === AppDocumentType.BILL)) &&
        (!element.isDocAction || (element.isDocAction && element.approvalStatus === approvalStatus &&
          !isOnline && docType === AppDocumentType.BILL)) &&
        (!element.isVoidAction || (element.isVoidAction && payStatus !== AppEnumConstants.STATUS_TRANSACTION_CANCELED
          && approvalStatus !== AppEnumConstants.STATUS_REJECT && payStatus !== AppEnumConstants.STATUS_TRANSACTION_FAILED &&
          ((isOnline && paymentTypeId === AppConstant.PAYMENT_TYPE_ACH) || !isOnline))) &&
        (!element.isDetailAction || (element.isDetailAction && element.payStatus === common)) &&
        (!element.isAuditAction || (element.isAuditAction && element.payStatus === common)) &&
        (!element.isDownLoadAction || (element.isDownLoadAction && receiptFileName !== undefined)) &&
        (!element.isExportAction || (element.isExportAction && element.payStatus === common))
      );
    };
  }


  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PAYMENT_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_BILL_PAYMENT_LIST;
      this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true) {
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
    if (field === 'vi.vendorId' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.overlayId = obj.vendorId;
      showOverlay(this.vendorOverlay);
    }

    if (field === 'txn.documentNo') {
      if (obj['txn.documentType'] === AppDocumentType.BILL &&
        this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
        this.overlayId = obj.documentId;
        showOverlay(this.billOverlay);
      }
      if (obj['txn.documentType'] === AppDocumentType.EXPENSE_REPORT &&
        this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW)) {
        this.overlayId = obj.documentId;
        showOverlay(this.expenseOverlay);
      }
    }

    if (field === 'txn.txnType' && obj.paymentTypeId === AppConstant.PAYMENT_TYPE_VIRTUAL_CARD && obj['txn.isOnline']
      && this.privilegeService.isAuthorized(AppAuthorities.V_CARD_DETAIL_VIEW) && obj.cardId) {
      this.overlayId = obj.cardId;
      showOverlay(this.cardsOverlay);
    }

    if (field === 'txn.paymentStatus' && (obj['txn.paymentStatus'] === 'TC' || obj['txn.paymentStatus'] === 'TF') && obj.remarks) {
      this.remarks = obj.remarks;
      showOverlay(this.reasonOverlay);
    }

    if (field === 'txn.reason' && (obj['txn.reason'])) {
      this.remarks = obj.remarks;
      showOverlay(this.reasonOverlay);
    }

    function showOverlay(overlay) {
      if (overlay.target === null || overlay.target === undefined) {
        overlay.show(event);
      }
    }
  }

  /**
   * Is the field is has data to show in overlay
   * @param field field namwe
   * @param obj data
   */
  isClassHover(field, obj) {
    switch (field) {
      case 'vi.vendorId':
        return !!this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW);
      case 'txn.documentNo':
        if (obj['txn.documentType'] === AppDocumentType.BILL) {
          return !!this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW);
        }
        if (obj['txn.documentType'] === AppDocumentType.EXPENSE_REPORT) {
          return !!this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW);
        }
        break;
      case 'txn.txnType':
        if (obj.paymentTypeId === AppConstant.PAYMENT_TYPE_VIRTUAL_CARD && obj['txn.isOnline'] && obj.cardId) {
          return !!this.privilegeService.isAuthorized(AppAuthorities.V_CARD_DETAIL_VIEW);
        }
        break;
      case 'txn.paymentStatus':
        return !!(field === 'txn.paymentStatus' && (obj['txn.paymentStatus'] === 'TC' || obj['txn.paymentStatus'] === 'TF') && obj.remarks);
      case 'txn.reason':
        return !!(obj['txn.reason']);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any) {
    if (field === 'txn.documentNo') {
      if (obj['txn.documentType'] === AppDocumentType.BILL && this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
        this.detailViewService.openBillDetailView(obj.documentId);
      }
      if (obj['txn.documentType'] === AppDocumentType.EXPENSE_REPORT && this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW)) {
        this.detailViewService.openExpenseDetailView(obj.documentId);
      }
    }
    if (field === 'vi.vendorId' && this.privilegeService.isAuthorized(AppAuthorities.VENDORS_DETAIL_VIEW)) {
      this.detailViewService.openVendorDetailView(obj.vendorId);
    }
    if (field === 'txn.txnType' && obj.paymentTypeId === AppConstant.PAYMENT_TYPE_VIRTUAL_CARD && obj['txn.isOnline']
      && this.privilegeService.isAuthorized(AppAuthorities.V_CARD_DETAIL_VIEW) && obj.cardId) {
      this.detailViewService.openCardsDetailView(obj.cardId);
    }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.vendorOverlay.overlayVisible) {
      this.vendorOverlay.hide();
    }
    if (this.billOverlay.overlayVisible) {
      this.billOverlay.hide();
    }
    if (this.expenseOverlay.overlayVisible) {
      this.expenseOverlay.hide();
    }
    if (this.cardsOverlay.overlayVisible) {
      this.cardsOverlay.hide();
    }
    if (this.reasonOverlay.overlayVisible) {
      this.reasonOverlay.hide();
    }
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: VendorPaymentTableDto) {
    this.originalFileName = JSON.parse(JSON.stringify(val))['chk.paymentReferanceNo'];
    this.activeAction = val;
  }

  /**
   * Cancel Transaction
   */
  cancelPayment(isOnline) {
    this.confirmationService.confirm({
      key: 'tCancel',
      message: 'You want to cancel this transaction (Ref- ' + this.activeAction['txn.txnRef'] + ')',
    });
  }

  submitCancelVCard(cd: ConfirmDialog) {
    if (!this.formGroup.valid) {
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
   * this method use for get audit trial data
   * @param id id
   */
  getAuditTrial(id) {
    this.paymentService.getAuditTrial(id).subscribe((res: any) => {
      this.auditTrial = res.body;
      this.auditTrialPanel = true;
    });
  }

  /**
   * Cancel Bulk Transaction
   */
  bulkCancel() {
    this.confirmationService.confirm({
      key: 'btCancel',
      message: 'You want to cancel the selected transaction(s)',
    });
  }

  submitBulkCancel(cd: ConfirmDialog) {
    if (!this.formGroup.valid) {
      new CommonUtility().validateForm(this.formGroup);
      return;
    }
    this.cancelLoading = true;
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      const obj = {transactionIdList: ids, cancelReason: this.formGroup.get('cancelReason').value};
      this.billPaymentService.cancelBulkTransaction(obj).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.PAYMENTS_ROVOKE_SUCCESSFULLY);
          }
          this.formGroup.reset();
          cd.hide();
          this.tableSupportBase.rows = [];
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
  }

  bulkApprove() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.billPaymentService.approveBulkTransaction(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.tableSupportBase.rows = [];
            this.loadData(this.tableSupportBase.searchFilterDto);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.PAYMENTS_APPROVED_SUCCESSFULLY);
            this.tableSupportBase.rows = [];
            this.loadData(this.tableSupportBase.searchFilterDto);
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * Is User Authorized to approve
   */
  isValidApproveAccess(billObj) {
    const user = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
    if (this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_OVERRIDE_APPROVAL)) {
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
   * Download Bill
   */
  downloadBillPayment(id) {
    if (id != null) {
      this.billPaymentService.downloadBillPaymentReceipt(id).subscribe((res: any) => {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', this.activeAction.receiptFileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
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
          link.setAttribute('download', 'Transactions.csv');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.notificationService.successMessage(HttpResponseMessage.PAYMENTS_EXPORTED_SUCCESSFULLY);
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
    if (this.tableSupportBase.rows.length > 0) {
      this.bulkExportSelected();
      return;
    }
    this.billPaymentService.bulkExportAll(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Transactions.csv');
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

  /**
   * export single data
   * @param id to id
   */
  exportSingleRecord(id) {
    const tempArray = new Array();
    tempArray.push(id);
    this.billPaymentService.bulkExportSelected(tempArray).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Transaction.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loadData(this.tableSupportBase.searchFilterDto);
        this.notificationService.successMessage(HttpResponseMessage.PAYMENTS_EXPORTED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getComment(input: any) {
    if (!input) { return [input]; } // If input is null or undefined, return it as is.
    if (input.includes('~')) {
      return input.split('~').map(s => s.trim()); // Split by ~ and remove leading/trailing spaces.
    } else {
      return [input]; // If no ~ in the input, return the string in an array.
    }
  }
}
