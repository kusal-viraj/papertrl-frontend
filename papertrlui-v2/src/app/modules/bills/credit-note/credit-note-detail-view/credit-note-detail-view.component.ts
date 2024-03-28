import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CreditNoteService} from '../../../../shared/services/credit-note/credit-note.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {AdditionalFieldDetailDto} from '../../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {AppModuleSection} from '../../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../../shared/services/additional-field-service/additional-field-service.';
import {AppDocumentType} from '../../../../shared/enums/app-document-type';
import {BillUtility} from '../../bill-utility';
import {BillPaymentService} from '../../../../shared/services/bill-payment-service/bill-payment.service';
import {PrivilegeService} from '../../../../shared/services/privilege.service';
import {DynamicDialogConfig} from 'primeng/dynamicdialog';
import {DetailViewService} from '../../../../shared/helpers/detail-view.service';
import {BillsService} from '../../../../shared/services/bills/bills.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ManageDrawerService} from '../../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {AppAuthorities} from '../../../../shared/enums/app-authorities';

@Component({
  selector: 'app-credit-note-detail-view',
  templateUrl: './credit-note-detail-view.component.html',
  styleUrls: ['./credit-note-detail-view.component.scss']
})
export class CreditNoteDetailViewComponent implements OnInit, OnDestroy {

  @Input() creditNoteId;
  @Input() creditNoteStatus: any;
  @Output() closeEditView = new EventEmitter();
  @Output() deleteSuccessEmitter = new EventEmitter();
  @Input() fromVendor = false;

  public commonUtil = new CommonUtility();
  public creditNoteAttachments: any [] = [];
  public billDetails: any [] = [];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public lineItemAdditionalDetails: AdditionalFieldDetailDto[] = new Array();
  public accountAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public additionalFieldResponse: AdditionalFieldDetailDto[];

  public billPaymentUtility: BillUtility;
  public appAuthorities = AppAuthorities;

  public creditNoteDetail: any = {};
  public creditNoteDetailForm: UntypedFormGroup;
  public creditNoteDate: Date;
  public isEditView = false;
  public poId: any;


  constructor(public creditNoteService: CreditNoteService, public formBuilder: UntypedFormBuilder,
              public notificationService: NotificationService, public confirmationService: ConfirmationService,
              public additionalFieldService: AdditionalFieldService, public billPaymentService: BillPaymentService,
              public privilegeService: PrivilegeService, public config: DynamicDialogConfig,
              public detailViewService: DetailViewService, public billsService: BillsService,
              public sanitizer: DomSanitizer, public drawerService: ManageDrawerService) {
  }

  ngOnDestroy(): void {
    if (this.config?.data) {
      this.detailViewService.closeCreditNoteDetailView();
    }
  }

  ngOnInit(): void {
    this.billPaymentUtility = new BillUtility(this.billPaymentService, this.notificationService,
      this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);
    if (this.config?.data) {
      this.creditNoteId = this.config.data.id;
      this.fromVendor = true;
    }
    this.initializeFormGroup();
    this.getCreditNoteData(this.creditNoteId);
  }

  /**
   * this method can be used to initialize form group
   */
  initializeFormGroup() {
    this.creditNoteDetailForm = this.formBuilder.group({
      id: [null],
      creditNoteNo: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      creditNoteDate: [null, Validators.compose([Validators.required])],
      vendorId: [null, Validators.compose([Validators.required])],
      vendorEmail: [null],
      comment: [null],
      itemGrossAmount: [null],
      totalCredit: [null],
      tax: [null],
      total: [null],
      attachments: [null],
      poId: [null],
      vendorName: [null],
      poNumber: [null],
      creditTotal: [null],
      taxAmount: [null],
      creditBalance: [null],
      creditNoteDateStr: [null],
      creditNoteItemDetails: this.formBuilder.array([]),
      creditNoteAccountDetails: this.formBuilder.array([]),
      creditNoteRelations: this.formBuilder.array([]),
      additionalData: this.formBuilder.array([])
    });
  }

  /**
   * this method load credit note data
   * @param creditNoteId to credit note master id
   */
  getCreditNoteData(creditNoteId) {
    if (!creditNoteId) {
      return;
    } else {
      this.creditNoteService.getCreditNoteDetail(creditNoteId, true).subscribe(async (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.poId = res.body.poId;
          this.creditNoteDetail = await res.body;
          this.lineItemMainTable.controls = [];
          this.accountDetails.controls = [];
          if (res.body.creditNoteItemDetails.length > 0) {
            for (let i = 0; i < this.creditNoteDetail.creditNoteItemDetails.length; i++) {
              this.addLine();
            }
          }

          if (res.body.creditNoteAccountDetails.length > 0) {
            for (let i = 0; i < this.creditNoteDetail.creditNoteAccountDetails.length; i++) {
              this.addAccount();
            }
          }

          this.billDetail.controls = [];
          if (res.body.creditNoteRelations.length > 0) {
            for (let i = 0; i < this.creditNoteDetail.creditNoteRelations.length; i++) {
              this.addBillRecord();
            }
          }
          await this.getModuleReheatedAdditionalField(AppDocumentType.CREDIT_NOTE, true);
          this.creditNoteAttachments = res.body.creditNoteAttachments;
          res.body.additionalFieldAttachments?.forEach(attachment => {
            this.creditNoteAttachments.push(attachment);
          });
          this.creditNoteDetailForm.get('creditBalance').patchValue(res.body.creditBalance);
          res.body.additionalData = this.commonUtil.alignHeadingAdditionalData(this.headerAdditionalFieldDetails, res.body.additionalData);
          this.commonUtil.alignLineAdditionalData(res.body.creditNoteItemDetails, this.lineItemAdditionalDetails);
          this.commonUtil.alignLineAdditionalData(res.body.creditNoteAccountDetails, this.accountAdditionalFieldDetails);
          this.creditNoteDetailForm.patchValue(res.body);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to add line item on click
   */
  addLine() {
    const itemInfo = this.formBuilder.group({
      id: [null],
      productId: [null],
      vendorItemNumber: [null],
      itemName: [null],
      qty: [null],
      itemNumber: [null],
      accountId: [null],
      accountName: [null],
      uomId: [null],
      unitPrice: [null],
      departmentId: [],
      description: [],
      discountAmount: [null],
      amount: [null],
      departmentName: [null],
      uomName: [null],
      additionalData: this.formBuilder.array([])
    });
    this.lineItemMainTable.push(itemInfo);
  }

  /**
   * This method can use for get controllers in form array
   */
  public get lineItemMainTable() {
    return this.creditNoteDetailForm.get('creditNoteItemDetails') as UntypedFormArray;
  }

  /**
   * Adds additional field items to a specific account.
   * @param field - The index of the account.
   */
  addLineAccountAdditionalField(field) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.creditNoteDetail.creditNoteAccountDetails, field, true, false)) {
      return;
    }
    this.accountAdditionalFieldDetails.push(field);
    this.accountDetails.controls.forEach((value, index) => {
      this.accountAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, true));
    });
  }

  /**
   * Retrieves the account details controllers as a form array.
   */
  public get accountDetails() {
    return this.creditNoteDetailForm.get('creditNoteAccountDetails') as UntypedFormArray;
  }

  /**
   * Retrieves the additional detail controllers of a specific account as a form array.
   * @param index - The index of the account.
   */
  public accountAdditionalField(index) {
    return this.accountDetails.controls[index].get('additionalData') as UntypedFormArray;
  }

  /**
   * Adds a new account to the form controller group for automation condition.
   */
  addAccount() {
    const accountInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      accountNumber: [null],
      description: [null],
      amount: [null],
      outstandingAmount: [null],
      additionalData: this.formBuilder.array([])
    });
    this.accountDetails.push(accountInfo);
  }

  /**
   * This method can use for get controllers in form array
   */
  public get billDetail() {
    return this.creditNoteDetailForm.get('creditNoteRelations') as UntypedFormArray;
  }

  /**
   * this method return credit note form controllers
   */
  get f() {
    return this.creditNoteDetailForm.controls;
  }

  /**
   * this method can be used to download credit note attachment
   * @param attachment to attachment
   */
  downloadAttachment(attachment) {
    if (attachment.fieldId) {
      this.downloadAdditionalAttachment(attachment);
    } else {
      this.downloadCreditNoteAttachment(attachment);
    }
  }

  /**
   * download additional field attachment
   * @param val to additional field object
   */
  downloadAdditionalAttachment(val) {
    this.creditNoteService.downloadAdditionalFieldAttachment(val.id).subscribe((res: any) => {
      this.downloadActionProperty(val, res);
    }, error => {
      val.isLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to download credit note attachment
   * @param attachment to attachment
   */
  downloadCreditNoteAttachment(attachment) {
    attachment.loading = true;
    this.creditNoteService.downloadAdditionalAttachment(attachment.id).subscribe((res: any) => {
      this.downloadActionProperty(attachment, res);
    }, error => {
      attachment.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * common download property
   * @param attachment to attachment
   * @param res to response
   */
  downloadActionProperty(attachment, res) {
    console.log('start download:', res);
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', attachment.fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    attachment.loading = false;
    this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    attachment.isLoading = false;
  }

  /**
   * additional field related functions
   */

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    return new Promise<void>(resolve => {
      this.additionalFieldService.getAdditionalField(id, isDetailView, this.isEditView).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {

          this.additionalFieldResponse = res.body;

          this.additionalFieldResponse.forEach(((field) => {
            this.commonUtil.manageDropDownData(field, true);

            if (field.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID) {
              this.addHeadingField(field);
            }

            if (field.sectionId === AppModuleSection.LINE_ITEM_SECTION_ID) {
              this.addLineItemAdditionalField(field);
            }

            if (field.sectionId === AppModuleSection.PURCHASING_ACCOUNT_INFO) {
              this.addLineAccountAdditionalField(field);
            }
          }));

        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });

  }


  /**
   * return form array data
   */
  get headingSectionArray() {
    return this.creditNoteDetailForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method returns the line item section additional detail controllers as an array
   */
  lineItemAdditionalField(index) {
    return this.lineItemMainTable.controls[index].get('additionalData') as UntypedFormArray;
  }


  /**
   * This method use for add line item data additional field and field validations
   * @param field
   * @private
   */
  addLineItemAdditionalField(field: AdditionalFieldDetailDto) {
    if (!this.commonUtil.checkUndefinedLineItemsValues(this.creditNoteDetail.creditNoteItemDetails, field, true, false)) {
      return;
    }
    this.lineItemAdditionalDetails.push(field);
    this.lineItemMainTable.controls.forEach((value, index) => {
      this.lineItemAdditionalField(index).push(this.commonUtil.getAdditionalFieldValidations(field, true));
    });
  }

  /**
   * This method use for add master data additional field and field validations
   * @param field AdditionalFieldDetailDto
   */
  addHeadingField(field: AdditionalFieldDetailDto) {
    this.headerAdditionalFieldDetails.push(field);
    this.headingSectionArray.push(this.commonUtil.getAdditionalFieldValidations(field, true));
  }

  addBillRecord() {
    const bill = this.formBuilder.group({
      id: [null],
      billId: [null],
      billNo: [null],
      appliedCreditAmount: [null],
      billRemainingBalance: [null]
    });
    this.billDetail.push(bill);
  }

  /**
   * close detail view
   */
  closeModal() {
    if (this.config?.data) {
      this.detailViewService.closeCreditNoteDetailView();
    } else {
      this.closeEditView.emit();
    }
  }

  /**
   * this method can be used to delete credit note
   */
  deleteCreditNote() {
    this.confirmationService.confirm({
      key: 'creditNoteDeleteKeyFromDetailView',
      message: 'You want to delete this Credit Note',
      accept: () => {
        this.creditNoteService.deleteCreditNote(this.creditNoteId).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.deleteSuccessEmitter.emit();
            this.notificationService.successMessage(HttpResponseMessage.CREDIT_NOTE_DELETED_SUCCESSFULLY);
            this.closeModal();
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
   * this method can be used to edit credit note
   */
  editCreditNote() {
      this.creditNoteService.canEdit(this.creditNoteId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.clear();
          this.isEditView = true;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
  }
}
