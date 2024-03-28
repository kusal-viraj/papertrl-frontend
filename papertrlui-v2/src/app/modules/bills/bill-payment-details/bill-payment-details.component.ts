import {Component, OnInit, ViewChild} from '@angular/core';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {BillPaymentMasterDto} from '../../../shared/dto/bill-payment/bill-payment-master-dto';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ɵTypedOrUntyped} from '@angular/forms';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {OverlayPanel} from 'primeng/overlaypanel';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {PaymentService} from "../../../shared/services/payments/payment.service";
import {AuditTrialDto} from "../../../shared/dto/common/audit-trial/audit-trial-dto";
import {DataFormat} from "../../../shared/utility/data-format";
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";

@Component({
  selector: 'app-bill-payment-details',
  templateUrl: './bill-payment-details.component.html',
  styleUrls: ['./bill-payment-details.component.scss']
})
export class BillPaymentDetailsComponent implements OnInit {

  public isVisible = false;
  public appFieldType = AppFieldType;
  public appConstant = new AppConstant();
  public appEnumConstants =  AppEnumConstants;
  public paymentDetailForm: UntypedFormGroup;
  public additionalData: any [];
  public receipt: any[] = [];
  public adHocWorkflowDetails: any [] = [];
  public auditTrial: AuditTrialDto[] = [];
  public dateFormatter: DataFormat = new DataFormat();
  public tableSupportBase = new TableSupportBase();
  public commonUtil: CommonUtility = new CommonUtility();
  overlayId: any;

  @ViewChild('billOverlay') public billOverlay: OverlayPanel;
  @ViewChild('expenseOverlay') expenseOverlay: OverlayPanel;
  @ViewChild('cardsOverlay') cardsOverlay: OverlayPanel;


  constructor(public billPaymentService: BillPaymentService, public paymentService: PaymentService, public messageService: MessageService,
              public notificationService: NotificationService, public privilegeService: PrivilegeService,
              public formBuilder: UntypedFormBuilder, public additionalFieldService: AdditionalFieldService,
              public detailViewService: DetailViewService) {
  }

  ngOnInit(): void {
    this.paymentDetailForm = this.formBuilder.group({
      payeeName: [null],
      documentNo: [null],
      billAmount: [null],
      createdDateStr: [null],
      billDate: [null],
      amount: [null],
      txnRef: [null],
      balanceAmount: [null],
      documentType: [null],
      paymentDate: [null],
      dueDate: [null],
      billDateStr: [null],
      paymentStatus: [null],
      dueDateStr: [null],
      txnDate: [null],
      vcardNumber: [null],
      status: [null],
      noOfLevels: [null],
      workflowLevel: [null],
      paymentDateStr: [null],
      cmt: [null],
      id: [null],
      txnAmount: [null],
      createdByName: [null],
      txnDiscount: [null],
      txnTypeName: [null],
      approvalUser: [null],
      txnType: [null],
      remarks: [null],
      comment: [null],
      documentId: [null],
      tpTxnId: [null],
      date: [null],
      time: [null],
      isOnline: [null],
      vcardId: [null],
      reason: [null],
      scheduledDateStr: [null],
      scheduledTime: [null],
      scheduledPayment: [null],
    });
  }

  get f() {
    return this.paymentDetailForm.controls;
  }

  /**
   * This method use for open bill payment detail drawer
   * @param paymentId number
   */
  openDrawer(paymentId: number) {
    this.getBillPaymentDetails(paymentId);
    this.getAuditTrial(paymentId);
  }

  /**
   * This method use for get bill payment details
   */
  getBillPaymentDetails(paymentId) {
    this.billPaymentService.getBillPaymentDetailsForView(paymentId).subscribe(async (res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.adHocWorkflowDetails = res.body.adHocWorkflowDetails;
        if (res.body.receiptFileName) {
          const obj = {
            fileName: undefined,
            fieldName: undefined,
            id: undefined
          };
          obj.fileName = res.body.receiptFileName;
          obj.fieldName = this.appConstant.RECEIPT;
          obj.id = res.body.offlinePaymentId;
          this.receipt.push(obj);
        }
        this.paymentDetailForm.patchValue(res.body);
        this.isVisible = true;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * download attachment
   * @param item to attachment object
   */

  downloadAttachment(item) {
    if (item.fieldName === this.appConstant.RECEIPT) {
      this.downloadReceipt(item.id);
    }
  }

  /**
   * this method use for get audit trial data
   * @param id id
   */
  getAuditTrial(id) {
    this.paymentService.getAuditTrial(id).subscribe((res: any) => {
      this.auditTrial = res.body;
    });
  }

  /**
   *
   * @param status
   * @param type
   */
  getStatus(status: string): string {
        switch (status) {
          case this.appConstant.TRANSACTION_SUBMITTED:
            return this.appEnumConstants.LABEL_TRANSACTION_SUBMITTED;
          case this.appConstant.TRANSACTION_PENDING:
            return this.appEnumConstants.LABEL_TRANSACTION_PENDING;
          case this.appConstant.TRANSACTION_SUCCESS:
            return this.appEnumConstants.LABEL_TRANSACTION_SUCCESS;
          case this.appConstant.TRANSACTION_FAILED:
            return this.appEnumConstants.LABEL_TRANSACTION_FAILED;
          case this.appConstant.TRANSACTION_IN_PROGRESS:
            return this.appEnumConstants.LABEL_JIRA_IN_PROGRESS;
          case this.appConstant.TRANSACTION_UNPROCESSED:
            return this.appEnumConstants.LABEL_UNPROCESSED;
          case this.appConstant.TRANSACTION_CANCELED:
            return this.appEnumConstants.LABEL_TRANSACTION_CANCELED;
          case this.appConstant.TRANSACTION_CREATED:
            return this.appEnumConstants.LABEL_TRANSACTION_CREATED;
          case this.appConstant.TRANSACTION_ON_HOLD:
            return this.appEnumConstants.LABEL_TRANSACTION_ON_HOLD;
          default:
            return '-';
        }
  }


  /**
   * download receipt
   * @param paymentId to paymentId
   */
  downloadReceipt(paymentId) {
    this.billPaymentService.downloadBillPaymentReceipt(paymentId).subscribe((res: any) => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', this.receipt[0].fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * Triggers when drawer closed
   */
  whenCloseDrawer() {
    this.isVisible = false;
    this.additionalData = [];
    this.receipt = [];
    this.paymentDetailForm.reset();
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

    if (type === AppConstant.PAYMENT_TYPE_VIRTUAL_CARD
      && this.privilegeService.isAuthorized(AppAuthorities.V_CARD_DETAIL_VIEW)  && this.f.isOnline.value && this.f.vcardId.value) {
      this.overlayId = this.f.vcardId.value;
      showOverlay(this.cardsOverlay);
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
    if (type === AppConstant.PAYMENT_TYPE_VIRTUAL_CARD && this.privilegeService.isAuthorized(AppAuthorities.V_CARD_DETAIL_VIEW)
      && this.f.isOnline.value && this.f.vcardId.value) {
      this.detailViewService.openCardsDetailView(this.f.vcardId.value);
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
    if (this.cardsOverlay.overlayVisible) {
      this.cardsOverlay.hide();
    }
  }


  /**
   * Is the field is has data to show in overlay
   */
  isClassHover(type) {
    if (type === AppDocumentType.BILL) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.BILL_DETAIL_VIEW);
    }

    if (type === AppDocumentType.EXPENSE_REPORT) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW);
    }

    if (type === AppConstant.PAYMENT_TYPE_VIRTUAL_CARD) {
      return !!this.privilegeService.isAuthorized(AppAuthorities.V_CARD_DETAIL_VIEW);
    }

  }
}
