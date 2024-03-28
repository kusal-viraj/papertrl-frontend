import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormGroup, Validators} from '@angular/forms';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {formatDate} from '@angular/common';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PaymentService} from '../../../shared/services/payments/payment.service';
import {OverlayPanel} from 'primeng/overlaypanel';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";


@Component({
  selector: 'app-payment-approve',
  templateUrl: './payment-approve.component.html',
  styleUrls: ['./payment-approve.component.scss']
})
export class PaymentApproveComponent implements OnInit {

  @Input() id: any;
  @Input() tableSearch: any;
  @Output() onSuccess = new EventEmitter();

  public form: FormGroup;
  public commonUtil: CommonUtility = new CommonUtility();
  public approvalUserList: DropdownDto = new DropdownDto();
  public adHocWorkflowDetails: any [] = [];
  public schedule = false;
  public appAuthorities = AppAuthorities;
  @ViewChild('billOverlay') public billOverlay: OverlayPanel;
  @ViewChild('expenseOverlay') expenseOverlay: OverlayPanel;
  public overlayId: any;
  public loading = false;
  public loadingReject = false;
  public singleTransaction = false;
  public idList = [];
  public index;
  public today = new Date();

  constructor(public formBuilder: FormBuilder, public billPaymentService: BillPaymentService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public billsService: BillsService,public gaService: GoogleAnalyticsService,
              public paymentService: PaymentService, public detailViewService: DetailViewService) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      payeeName: [null],
      documentNo: [null],
      scheduledDate: [null],
      createdDateStr: [null],
      billAmount: [null],
      billDate: [null],
      txnAmount: [null],
      txnRef: [null],
      balanceAmount: [null],
      documentType: [null],
      paymentDate: [null],
      dueDate: [null],
      billDateStr: [null],
      dueDateStr: [null],
      noOfLevels: [null],
      workflowLevel: [null],
      paymentDateStr: [null],
      cmt: [null],
      id: [null],
      poNumber: [null],
      createdByName: [null],
      txnDiscount: [null],
      txnTypeName: [null],
      approvalUser: [null],
      remarks: [null],
      comment: [null],
      documentId: [null],
      date: [null],
      scheduledTimeStr: [null],
      scheduledTimeZone: [null],
      isOnline: [null],
      scheduledDateStr: [null],
      scheduledTime: [null],
      isScheduled: [null],
    });

    this.form.get('approvalUser').valueChanges.subscribe(value => this.approvalUserChanged(value));

    this.getPendingTransactionIdList();
    this.getApprovalUserList();
  }

  approvalUserChanged(value) {
    if (value) {
      this.schedule = false;
    }
  }

  get f() {
    return this.form.controls;
  }

  getBillPaymentDetails(id) {
    if (!id) {
      return;
    }
    this.billPaymentService.getBillTransactionDetailsForView(id).subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.adHocWorkflowDetails = res.body.adHocWorkflowDetails;
          res.body.approvalUser = null;
          this.form.patchValue(res.body);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error: (error) => {
        this.notificationService.errorMessage(error);
      }
    });
  }

  getApprovalUserList() {
    const authorities = [AppAuthorities.PAYMENT_APPROVE, AppAuthorities.PAYMENT_REJECT,
      AppAuthorities.PAYMENT_OVERRIDE_APPROVAL];
    this.billsService.getApprovalUserList(null, authorities, true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.approvalUserList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  reject() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.REJECT,
      AppAnalyticsConstants.MODULE_NAME_PAYMENT,
      AppAnalyticsConstants.REJECT,
      AppAnalyticsConstants.PAYMENT_APPROVE_SCREEN,
    );
    this.loadingReject = true;
    this.form.get('remarks').setValidators([Validators.required]);
    this.form.get('remarks').updateValueAndValidity();
    if (this.form.valid) {
      this.paymentService.rejectPayment(this.form.value).subscribe({
        next: (res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.PAYMENT_REJECTED_SUCCESSFULLY);
            this.loadingReject = false;
            this.onSuccess.emit();
          } else {
            this.loadingReject = false;
            this.notificationService.infoMessage(res.body.message);
          }
        }, error: err => {
          this.loadingReject = false;
          this.notificationService.errorMessage(err);
        }
      });

    } else {
      this.loadingReject = false;
      return new CommonUtility().validateForm(this.form);
    }

  }

  submit(isReassign) {
    let eventLabel;
    if (this.schedule) {
      eventLabel = AppAnalyticsConstants.SCHEDULE_BUTTON;
    } else if (this.appAuthorities.BILL_APPROVE) {
      eventLabel = AppAnalyticsConstants.APPROVE_FINALIZE;
    } else if (this.form.controls.noOfLevels.value === this.form.controls.workflowLevel.value) {
      eventLabel = AppAnalyticsConstants.APPROVE_REASSING;
    }else if (this.form.controls.noOfLevels.value !== this.form.controls.workflowLevel.value){
      eventLabel = AppAnalyticsConstants.APPROVE;
    }
    this.gaService.trackScreenButtonEvent(
      eventLabel,
      AppAnalyticsConstants.MODULE_NAME_PAYMENT,
      eventLabel,
      AppAnalyticsConstants.PAYMENT_APPROVE_SCREEN
    );

    this.loading = true;
    this.form.get('isScheduled').patchValue(this.schedule);
    if (this.form.get('scheduledTime').value) {
      this.form.get('scheduledTimeStr').patchValue(formatDate(this.form.get('scheduledTime').value, 'HH:mm', 'en-US'));
    }

    this.form.get('scheduledTimeZone').patchValue(Intl.DateTimeFormat().resolvedOptions().timeZone);

    if (this.form.get('scheduledDate').value) {
      this.form.get('scheduledDateStr').patchValue(
        this.form.get('scheduledDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    }

    if (isReassign) {
      this.reassign();
    } else {
      this.approve();
    }
  }

  approve() {
    this.paymentService.approveAndFinalizePayment(this.form.value).subscribe({
      next: (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (this.schedule) {
            this.notificationService.successMessage(HttpResponseMessage.TRANSACTION_SCHEDULED_SUCCESSFULLY);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.PAYMENT_CREATED_SUCCESSFULLY);
          }
          this.onSuccess.emit();
          this.loading = false;
        } else {
          this.loading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
        this.loading = false;
      }
    });
  }

  reassign() {
    this.paymentService.approveAndReassignPayment(this.form.value).subscribe({
      next: (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.PAYMENT_APPROVED_SUCCESSFULLY);
          this.onSuccess.emit();
          this.loading = false;
        } else {
          this.loading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error: err => {
        this.loading = false;
        this.notificationService.errorMessage(err);
      }
    });
  }

  /**
   * Check the privilege is eligible for the current user
   * @param privilege auth key
   */
  isValidApproveAccess(privilege) {
    if (this.privilegeService.isAuthorized(AppAuthorities.BILL_OVERRIDE_APPROVAL)) {
      return true;
    }
    return this.privilegeService.isAuthorized(privilege);
  }


  /**
   * A Single value hover from table
   * @param type doc type
   */
  tdHover(type: any) {
    if (type === AppDocumentType.BILL &&
      this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
      this.overlayId = this.f.documentId.value;
      showOverlay(this.billOverlay);
    }
    if (type === AppDocumentType.EXPENSE_REPORT &&
      this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW)) {
      this.overlayId = this.f.documentId.value;
      showOverlay(this.expenseOverlay);
    }

    function showOverlay(overlay) {
      if (overlay.target === null || overlay.target === undefined) {
        overlay.show(event);
      }
    }
  }

  /**
   * A Single value clicked from table
   * @param type doc type
   */
  tdClick(type: any) {
    if (type === AppDocumentType.BILL && this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW)) {
      this.detailViewService.openBillDetailView(this.f.documentId.value);
    }
    if (type === AppDocumentType.EXPENSE_REPORT && this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW)) {
      this.detailViewService.openExpenseDetailView(this.f.documentId.value);
    }
  }

  /**
   * Hide Overlays if Visible
   */
  hideOverlays() {
    if (this.billOverlay.overlayVisible) {
      this.billOverlay.hide();
    }
    if (this.expenseOverlay.overlayVisible) {
      this.expenseOverlay.hide();
    }
  }


  /**
   * Is the field is has data to show in overlay
   * @param field field namwe
   * @param obj data
   */
  isClassHover(type) {
    if (type === AppDocumentType.BILL) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW);
    }

    if (type === AppDocumentType.EXPENSE_REPORT) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW);
    }
  }


  getPendingTransactionIdList() {
    if (this.singleTransaction) {
      this.getBillPaymentDetails(this.id);
      return;
    }
    this.paymentService.getPendingIdList(this.tableSearch).subscribe({
      next: (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.idList = res.body;
          if (this.idList.length === 0) {
            this.onSuccess.emit();
          } else {
            if (this.idList.includes(this.id)) {
              this.index = this.idList.findIndex(x => x === this.id);
              this.getBillPaymentDetails(this.idList[this.index]);
            } else {
              this.getBillPaymentDetails(this.idList[0]);
            }
          }
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error: (error) => {
        this.notificationService.errorMessage(error);
      }
    });
  }

  /**
   * Get next Transactions Details
   */
  transactionsNext() {
    this.reset();
    this.id = null;
    this.index++;
    const currentbillId = this.idList[this.index];
    this.id = currentbillId;
    if (currentbillId !== undefined) {
      this.getBillPaymentDetails(currentbillId);
    }
  }

  /**
   * Get previous Transactions Details
   */
  transactionsPrev() {
    this.reset();
    this.id = null;
    this.index--;
    const currentbillId = this.idList[this.index];
    this.id = currentbillId;
    if (currentbillId !== undefined) {
      this.getBillPaymentDetails(currentbillId);
    }
  }

  /**
   * Next Button Enable
   */
  isNextTransactions() {
    if (this.singleTransaction) {
      return true;
    }
    if (this.idList === null || this.idList === undefined || this.idList.length === 0) {
      return true;
    }
    return (this.idList.length === (this.index + 1));
  }

  /**
   * Previous Button Enable
   */
  isPrevTransactions() {
    if (this.singleTransaction) {
      return true;
    }
    if (this.idList === null || this.idList === undefined || this.idList.length === 0) {
      return true;
    }
    return (this.idList.indexOf(Number(this.idList[(this.index)]))) === 0;
  }

  private reset() {
    this.form.reset();
    this.schedule = false;
  }

  getCurrentTime() {
    const now = new Date();
    this.form.controls.scheduledTime.setValue(now);
  }
}


