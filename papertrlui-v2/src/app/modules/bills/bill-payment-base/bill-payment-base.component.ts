import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {BillUtility} from '../bill-utility';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {BillPaymentMasterDto} from '../../../shared/dto/bill-payment/bill-payment-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {CompareDate} from '../../../shared/utility/compare-date';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {DataFormat} from '../../../shared/utility/data-format';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {CreditNoteService} from "../../../shared/services/credit-note/credit-note.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ManageDrawerService} from "../../../shared/services/common/manage-drawer-status/manage-drawer.service";
import {AppAuthorities} from '../../../shared/enums/app-authorities';

@Component({
  selector: 'app-bill-payment-base',
  template: 'N/A'
})
export class BillPaymentBaseComponent implements OnInit {

  public billPaymentForm: UntypedFormGroup;
  public billPaymentDto: BillPaymentMasterDto = new BillPaymentMasterDto();
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public isValidPaymentDate = true;
  public dateFormat = new DataFormat();

  public additionalFieldResponse: AdditionalFieldDetailDto[];
  public headerAdditionalFieldDetails: AdditionalFieldDetailDto[] = new Array();
  public appFieldType = AppFieldType;
  public addNewDropDown = false;
  public appConstant: AppConstant = new AppConstant();
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public btnLoading = false;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public commonUtil = new CommonUtility();
  public vendorList: DropdownDto = new DropdownDto();


  public billPaymentUtility: BillUtility = new BillUtility(this.billPaymentService, this.notificationService,
    this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);

  @Output()
  public onProcessDone: EventEmitter<any> = new EventEmitter();
  @Output() emittedTabIndex = new EventEmitter();
  @Input() isPanel;
  @Input() vendorId;
  @Input() billId;
  @Input() billTableData;

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public billPaymentService: BillPaymentService, public privilegeService: PrivilegeService,
              public additionalFieldService: AdditionalFieldService, public creditNoteService: CreditNoteService,
              public billsService: BillsService, public sanitizer: DomSanitizer, public drawerService: ManageDrawerService) {

  }

  ngOnInit(): void {
    this.billPaymentForm = this.formBuilder.group({
      vendorId: [AppConstant.NULL_VALUE, Validators.required],
      vendorName: [AppConstant.NULL_VALUE],
      billNo: [AppConstant.NULL_VALUE],
      billId: [AppConstant.NULL_VALUE, Validators.required],
      paymentTypeId: [AppConstant.NULL_VALUE, Validators.required],
      paymentReferanceNo: [AppConstant.NULL_VALUE, Validators.required],
      billDateStr: [{value: AppConstant.NULL_VALUE, disabled: true}],
      paymentDate: [AppConstant.NULL_VALUE, Validators.required],
      balanceAmount: [{value: AppConstant.NULL_VALUE, disabled: true}],
      amount: [AppConstant.NULL_VALUE, Validators.required],
      billAmt: [AppConstant.NULL_VALUE],
      discountAmount: [{value: AppConstant.NULL_VALUE, disabled: true}],
      receipt: [AppConstant.NULL_VALUE],
    });
    // this.getModuleReheatedAdditionalField(AppDocumentType.BILL_PAYMENT, false);
    if (this.isPanel) {
      this.billPaymentForm.get('vendorId').patchValue(this.billTableData.vendorId);
      this.billPaymentForm.get('billId').patchValue(this.billTableData.id);
      this.billPaymentForm.get('billAmt').patchValue(this.billTableData['bill.billAmount']);
      this.billPaymentForm.get('vendorName').patchValue(this.billTableData['vendor.id']);
      this.billPaymentForm.get('billDateStr').patchValue(this.billTableData['bill.billDate']);
      this.billPaymentForm.get('billNo').patchValue(this.billTableData['bill.billNo']);
      this.onInvoiceNumberChange();
    }
  }

  get f() {
    return this.billPaymentForm.controls;
  }

  onInvoiceNumberChange() {
    const invNo = this.billPaymentForm.get('billId').value;
    this.billPaymentForm.get('balanceAmount').reset();
    if (invNo !== undefined && invNo !== null) {
      this.billPaymentService.getInvoice(invNo, false).subscribe((res: any) => {
          if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
            this.billPaymentForm.get('balanceAmount').setValue(res.body.balanceAmount);
            this.billPaymentForm.get('discountAmount').setValue(res.body.discountAmount);
            this.billPaymentDto = res.body;
            this.onDateChange();
          } else {
            this.notificationService.errorMessage(res.body.message);
          }
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    } else {
      this.billPaymentForm.get('billDateStr').reset();
      this.billPaymentForm.get('balanceAmount').reset();
    }
  }

  /**
   * this method validate invoice date
   */
  onDateChange() {
    if (undefined !== this.billPaymentForm.get('paymentDate').value && null !== this.billPaymentForm.get('paymentDate').value) {
      this.isValidPaymentDate =
        CompareDate.compare(this.billPaymentForm.get('billDateStr').value, this.billPaymentForm.get('paymentDate').value);
      if (null != this.billPaymentForm.get('amount').value && null != this.billPaymentForm.get('paymentDate').value
        && this.isValidPaymentDate) {
        this.getDiscountAmount();
      }
    }
  }

  /**
   * this method validate invoice date
   */
  onAmountChange() {
    if (undefined !== this.billPaymentForm.get('amount').value && null !== this.billPaymentForm.get('amount').value
      && null != this.billPaymentForm.get('paymentDate').value && this.isValidPaymentDate) {
      this.getDiscountAmount();
    }
  }


  /**
   * this method can be used to get discount amount of the invoice
   */
  async getDiscountAmount() {
    const payment = JSON.parse(JSON.stringify(this.billPaymentForm.value));
    payment.additionalData = [];
    const httpData: any = await this.billPaymentService.getDiscountAmountByPayment(payment);
    if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === httpData.status) {
      this.billPaymentForm.get('discountAmount').patchValue(httpData.body);
    } else {
      this.notificationService.infoMessage(httpData.body.message);
    }
  }

  /**
   * this method can be use to change file receipt
   * @param event to event
   */
  changeReceipt(event) {
    if (this.billPaymentUtility.isValidReceipt(event, this.billPaymentDto)) {
      if (event.target.files[0]) {
        const targetFile = event.target.files[0];
        this.billPaymentForm.patchValue({
          receipt: targetFile
        });
      }
    }
  }

  /**
   * THis method use for brows file
   * @param receiptID form Controller id
   */
  fileUploadClick(receiptID: string) {
    document.getElementById(receiptID).click();
  }

  /**
   * This method use for reset payment form
   */
  resetPaymentForm() {
    this.billPaymentForm.reset();
  }

  /**
   * This method use for create payment
   */
  createPayment() {
    this.btnLoading = true;
    if (this.billPaymentForm.valid) {
      const billPaymentDto: BillPaymentMasterDto = Object.assign({}, this.billPaymentForm.value);
      if (billPaymentDto.paymentDate) {
        try {
          billPaymentDto.paymentDate = billPaymentDto.paymentDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        } catch (e) {
        }
      }
      this.billPaymentService.createBillPayment(billPaymentDto).subscribe((res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(HttpResponseMessage.PAYMENT_CREATED_SUCCESSFULLY);
          this.resetPaymentForm();
          setTimeout(() => {
            this.emittedTabIndex.emit({visible: true});
          }, 100);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.btnLoading = false;
      }, error => {
        this.btnLoading = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.btnLoading = false;
      new CommonUtility().validateForm(this.billPaymentForm);
    }
  }

}
