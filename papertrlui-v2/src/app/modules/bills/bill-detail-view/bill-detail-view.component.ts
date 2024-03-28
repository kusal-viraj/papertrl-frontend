import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppIcons} from '../../../shared/enums/app-icons';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {ConfirmationService} from 'primeng/api';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {PoService} from '../../../shared/services/po/po.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {DataFormat} from '../../../shared/utility/data-format';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {BillUtility} from '../bill-utility';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {CreditNoteService} from '../../../shared/services/credit-note/credit-note.service';
import {DomSanitizer} from '@angular/platform-browser';
import {BillLineLevelPoReceiptDto} from '../../../shared/dto/bill/bill-line-level-po-receipt-dto';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';

@Component({
  selector: 'app-bill-detail-view',
  templateUrl: './bill-detail-view.component.html',
  styleUrls: ['./bill-detail-view.component.scss']
})
export class BillDetailViewComponent implements OnInit {


  @Input() billId;
  @Input() attachmentId: any;
  @Input() isSplitterSmall;
  @Input() extraSmallHorSplitter;
  @Input() isApproveView = false;
  @Input() isResponseDataReceived = false;
  @Output() closeBill = new EventEmitter();
  @Output() updatedBillObject = new EventEmitter();
  @Output() resetApproval = new EventEmitter();
  @Input() fromNotification = false;

  @ViewChild('op') notePopup: OverlayPanel;

  public approvalUserList: DropdownDto = new DropdownDto();
  public auditTrial: AuditTrialDto[];
  public billApproveForm: UntypedFormGroup;
  public appIcons = AppIcons;
  public distributionCostTotal: number;
  public appAuthorities = AppAuthorities;
  public appFieldType = AppFieldType;
  public enums = AppEnumConstants;
  public appConstant = new AppConstant();
  public appEnumConstants =  AppEnumConstants;
  public hasVerticalScrollbar = false;
  public receiptAttachments: any [] = [];
  public adHocWorkflowDetails: any [] = [];

  public dateFormatter: DataFormat = new DataFormat();
  public tableSupportBase = new TableSupportBase();

  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public additionalFieldForExpenseCostDistributions: AdditionalFieldDetailDto[] = new Array();
  public additionalFieldForItemCostDistributions: AdditionalFieldDetailDto[] = new Array();

  public auditTrialPanel: boolean;
  public billNo: any;

  public commonUtil = new CommonUtility();
  public appFormConstants = AppFormConstants;
  public billUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);
  public billDetails: BillMasterDto = new BillMasterDto();

  public auditHeight = false;
  public note = '';
  public noteValidation = false;
  public isViewReceiptView = false;

  constructor(public formBuilder: UntypedFormBuilder, public billApprovalsService: BillApprovalsService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public billSubmitService: BillSubmitService, public ref: ChangeDetectorRef,
              public confirmationService: ConfirmationService, public billsService: BillsService, public poService: PoService,
              public additionalFieldService: AdditionalFieldService, public billPaymentService: BillPaymentService,
              public creditNoteService: CreditNoteService, public sanitizer: DomSanitizer, public drawerService: ManageDrawerService) {

    this.billApproveForm = this.formBuilder.group({
      billNo: [null],
      billDate: [null],
      vendorId: [null],
      billAmount: [null],
      distributionCostTotal: [null],
      poId: [null],
      poNumber: [null],
      receiptId: [null],
      poReceiptNumber: [null],
      remainingCeling: [null],
      poRemainingCeiling: [null],
      remark: [null],
      additionalData: this.formBuilder.array([]),
      adHocWorkflowDetails: this.formBuilder.array([]),
      billExpenseCostDistributions: this.formBuilder.array([]),
      billItemCostDistributions: this.formBuilder.array([]),
      existingVpPaymentTransaction: this.formBuilder.array([]),
      vendorName: [null, {disabled: true}],
      approvalUser: [],
      netDaysDue: [],
      billDateFormat: [],
      accountPeriodMonth: [null],
      accountPeriodYear: [null],
      templateName: [],
      discountPercentage: [],
      discountDaysDue: [],
      billType: [],
      event: [],
      id: [],
      departmentName: [null],
      departmentId: [null],
      payWhenCustomerPayStr: [null],
      customerInvoiceNumber: [null],
      approveComment: [],
      billAttachmentId: [],
      submittedOn: [],
      additionalNotes: [],
      billDateStr: [],
      dueDateStr: [],
      term: [],
      termName: [],
      projectCode: [null]
    });
  }

  get f() {
    return this.billApproveForm.controls;
  }


  ngOnInit(): void {

    this.getBillDetails(this.billId);

  }

  /**
   * this method can be used to get bill details
   */
  getBillDetails(billId) {
    this.billApprovalsService.getBillDetail(billId, true).subscribe(async (res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.billDetails = await res.body;
        this.updatedBillObject.emit(this.billDetails);
        this.adHocWorkflowDetails = res.body.adHocWorkflowDetails;
        this.adHocWorkflowDetails = this.adHocWorkflowDetails.sort((ap1, ap2) =>
          (ap2.approvalOrder > ap1.approvalOrder) ? -1 : ((ap2.approvalOrder > ap1.approvalOrder) ? 1 : 0));

        if (this.billDetails.billExpenseCostDistributions.length > 0) {
          for (let i = 0; i < this.billDetails.billExpenseCostDistributions.length; i++) {
            this.addExpense();
          }
        }

        if (this.billDetails.billItemCostDistributions.length > 0) {
          for (let i = 0; i < this.billDetails.billItemCostDistributions.length; i++) {
            this.addItem();
          }
        }

        if (this.billDetails.existingVpPaymentTransaction.length > 0) {
          for (let i = 0; i < this.billDetails.existingVpPaymentTransaction.length; i++) {
            this.addPaymentInfo();
          }
        }

        await this.getModuleReheatedAdditionalField(AppDocumentType.BILL, true);

        this.billDetails.billDate = new Date(this.billDetails.billDate);

        this.billDetails.additionalFieldAttachments.forEach((value, index) => {
          if (value.id === this.billApproveForm.get('billAttachmentId').value) {
            this.billDetails.additionalFieldAttachments.splice(index, 1);
          }
        });

        this.billDetails.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, this.billDetails.additionalData);
        this.commonUtil.alignLineAdditionalData(this.billDetails.billExpenseCostDistributions, this.additionalFieldForExpenseCostDistributions);
        this.commonUtil.alignLineAdditionalData(this.billDetails.billItemCostDistributions, this.additionalFieldForItemCostDistributions);
        // this.getTableRowValues();

        this.billApproveForm.patchValue(this.billDetails);
        this.getTotalCostDistribution();
        this.billUtility.getMatchingTableData(this.billApproveForm, this.expenseFields, this.itemForm);
        this.getAuditTrail();

      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can use for get controllers in form array
   */
  public get itemForm() {
    return this.billApproveForm.get('billItemCostDistributions') as UntypedFormArray;
  }

  addItem() {
    const itemForm = this.formBuilder.group({
      id: [null],
      itemId: [null],
      description: [],
      departmentId: [null],
      departmentName: [null],
      vendorItemNumber: [null],
      qty: [''],
      rate: [''],
      amount: [null],
      projectId: [null],
      accountId: [null],
      accountName: [null],
      accountNumber: [null],
      projectCode: [null],
      itemNumber: [null],
      itemName: [null],
      poReceiptId: [null],
      poReceiptIdList: [null],
      billableStr: [false],
      taxableStr: [false],
      poReceiptNumber: [null],
      additionalData: this.formBuilder.array([])
    });
    const itemLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.itemPoReceiptLineLevelAttachments.push(itemLevelAttachment);
    this.itemForm.push(itemForm);
  }

  /**
   * this method can be used to add new line additional field item
   * @param index to index
   */
  addExpenseFields(index) {
    this.additionalFieldForExpenseCostDistributions.forEach((value) => {
      this.expenseAdditionalField(index + 1).push(this.commonUtil.getAdditionalFieldValidations(value, true));
    });
  }


  /**
   * This method use for add new form controller group for automation condition
   */
  addExpense() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      accountId: [null],
      accountName: [null],
      description: [null],
      accountNumber: [null],
      departmentId: [null],
      departmentName: [null],
      amount: [null],
      projectId: [null],
      billableStr: [null],
      poReceiptId: [null],
      poReceiptIdList: [null],
      projectCode: [null],
      poReceiptNumber: [null],
      taxableStr: [false],
      additionalData: this.formBuilder.array([])
    });
    const expenseLevelAttachment: BillLineLevelPoReceiptDto = new BillLineLevelPoReceiptDto();
    this.billUtility.expensePoReceiptLineLevelAttachments.push(expenseLevelAttachment);
    this.expenseFields.push(itemInfo);
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addPaymentInfo() {
    const paymentInfo = this.formBuilder.group({
      id: [null],
      txnAmount: [null],
      txnTypeName: [null],
      txnRef: [null],
      paymentStatus: [null],
      paymentDateStr: [null],
    });
    this.paymentDetailsArray.push(paymentInfo);
  }

  /**
   * This method can use for get controllers in form array
   */
  public get expenseFields() {
    return this.billApproveForm.get('billExpenseCostDistributions') as UntypedFormArray;
  }

  /**
   * this method can be used to view audit trial
   */
  viewAuditTrial() {
    this.auditTrialPanel = true;
  }


  /**
   * This method use for calculate total of cost distributions
   */
  getTotalCostDistribution() {

    let invoiceCostDistributionAmount = 0.00;

    for (const expenseCost of this.expenseFields.controls) {
      if (expenseCost.value.amount) {
        const amt = this.commonUtil.roundNum(expenseCost.value.amount);
        invoiceCostDistributionAmount += amt;
      }
    }
    for (const itemCost of this.itemForm.controls) {
      if (itemCost.value.qty && itemCost.value.rate) {
        let amt = itemCost.value.qty * itemCost.value.rate;
        amt = this.commonUtil.roundNum(amt);
        invoiceCostDistributionAmount += amt;
      }
    }
    this.billApproveForm.get('distributionCostTotal').patchValue(invoiceCostDistributionAmount);
  }

  /**
   * This method use for  download attachment
   */
  downloadAttachment() {
    this.billSubmitService.getBillAttachment(this.attachmentId).subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', this.billNo.replace('.', '_'));
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
   * this method can be used to get item name
   * @param id to selected item id
   * * @param index to formGroup index
   */
  getItemName(id, index) {
    if (!id) {
      return;
    } else {
      this.billApprovalsService.getItemName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.itemForm.controls[index].get('itemName').patchValue(res.body.name);
          this.itemForm.controls[index].get('itemNumber').patchValue(res.body.itemNumber);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to get account name
   * @param id to account id
   * @param i to index number
   */
  getAccountName(id, i) {
    if (!id) {
      return;
    } else {
      this.billApprovalsService.getAccountName(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.expenseFields.controls[i].get('accountName').patchValue(res.body.name);
          this.expenseFields.controls[i].get('accountNumber').patchValue(res.body.number);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * this method can be used to get selected item/account names
   */
  getTableRowValues() {
    if (this.billDetails.billExpenseCostDistributions.length > 0) {
      this.billDetails.billExpenseCostDistributions.forEach((value, index) => {
        this.getAccountName(value.accountId, index);
      });
    }
    if (this.billDetails.billItemCostDistributions.length > 0) {
      this.billDetails.billItemCostDistributions.forEach((value, index) => {
        this.getItemName(value.itemId, index);
      });
    }
  }


  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    return new Promise<void>(resolve => {
      this.additionalFieldService.getAdditionalField(id, isDetailView, false).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {

          this.additionalFieldResponse = res.body;

          this.additionalFieldResponse.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, true);

            if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
              this.addHeadingField(field);
            }

            if (field.sectionId === AppModuleSection.ITEM_COST_DISTRIBUTION_SECTION_ID) {
              this.addLineFieldForItem(field);
            }

            if (field.sectionId === AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
              this.addLineFieldForExpense(field);
            }
            resolve();
          }));
        } else {
          this.notificationService.infoMessage(res.body.message);
          resolve();
        }
        resolve();
      }, error => {
        this.notificationService.errorMessage(error);
        resolve();
      });
    });
  }

  /**
   * Get Audit Trail Details Details
   */
  getAuditTrail() {
    this.billApprovalsService.getAuditTrial(this.billId).subscribe((res: any) => {
      this.auditTrial = res.body;
      this.auditHeight = this.auditTrial.length > 2;
      this.billNo = this.billApproveForm.get(AppFormConstants.BILL_NO).value;
    });
  }

  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineFieldForItem(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billDetails.billItemCostDistributions, field, true, false)) {
      return;
    }
    this.additionalFieldForItemCostDistributions.push(field);
    this.itemForm.controls.forEach((value, index) => {
      this.itemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, true));
    });
  }


  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  public addLineFieldForExpense(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.billDetails.billExpenseCostDistributions, field, true, false)) {
      return;
    }
    this.additionalFieldForExpenseCostDistributions.push(field);
    this.expenseFields.controls.forEach((value, index) => {
      this.expenseAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, true));
    });
  }

  /**
   * This method use for add master data additional field and field validations
   * @param field AdditionalFieldDetailDto
   */
  public addHeadingField(field: AdditionalFieldDetailDto) {
    this.headerAdditionalFieldDetails.push(field);
    this.headingSectionArray.push(this.commonUtil.getAdditionalFieldValidations(field, true));
  }

  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.billApproveForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get paymentDetailsArray() {
    return this.billApproveForm.get('existingVpPaymentTransaction') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public itemAdditionalField(index) {
    return this.itemForm.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  public expenseAdditionalField(index) {
    return this.expenseFields.controls[index].get('additionalData') as UntypedFormArray;
  }


  /**
   * this method can be used to download attachment
   * @param attachment to attachment
   */
  downloadAttachments(attachment) {
    if (attachment.fieldId) {
      this.downloadAdditionalAttachments(attachment);
    } else {
      this.downloadAttachment();
    }
  }


  /**
   * this method can be used to download attachment
   * @param val to attachment obj
   */
  downloadAdditionalAttachments(val) {
    this.billApprovalsService.downloadBillAttachment(val.id).subscribe((res: any) => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', val.fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

////////////////////////// Add Note /////////////////////////////////////////////////////////
  addNote() {
    if (this.note === '' || this.note === null || this.note === undefined) {
      this.noteValidation = true;
      return;
    }

    const auditTrailObj = {comment: this.note, billId: this.billId};
    this.billSubmitService.addNote(auditTrailObj).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_CREATED === res.status) {
        this.notePopup.hide();
        this.getAuditTrail();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });

  }

///////////////////////////////// Add Note End /////////////////////////////////////////////

  /**
   * this method can be used to view receipt modal as conditionally
   * @param value to po receipt ids
   */
  viewPoReceiptAttachment(value) {
    this.receiptAttachments = [];
    if (this.billApproveForm.get('receiptId').value) {
      this.receiptAttachments.push(value);
    } else {
      this.receiptAttachments = value;
    }
    this.isViewReceiptView = this.receiptAttachments.length > AppConstant.ZERO;
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
}
