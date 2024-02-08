import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CustomerInvoiceService} from '../../../shared/services/customer-invoice/customer-invoice.service';
import {CommonUtility} from '../../../shared/utility/common-utility';

@Component({
  selector: 'app-create-customer-invoice',
  templateUrl: './create-customer-invoice.component.html',
  styleUrls: ['./create-customer-invoice.component.scss']
})
export class CreateCustomerInvoiceComponent implements OnInit {

  @Output() emitAfterSuccess = new EventEmitter();
  @Input() isEditable = false;
  @Input() invoiceId: any;

  public isSubmit = false;
  public isUpdate = false;
  public removeSpace: RemoveSpace = new RemoveSpace();
  public formGroup: UntypedFormGroup;


  constructor(public formBuilder: FormBuilder, public notificationService: NotificationService,
              public customerInvoiceService: CustomerInvoiceService) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      customerName: [null, Validators.required],
      invoiceNumber: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      invoiceAmount: [null, Validators.required],
      invoiceDate: [null, Validators.required],
      additionalNote: [null],
      receipt1: [null],
      receipt: [null],
      id: [null]
    });
    if (this.invoiceId && this.isEditable) {
      this.getInvoiceData();
    }
  }

  /**
   * used for submit form data
   */
  submitInvoice() {
    this.isSubmit = true;
    this.formGroup.removeControl('receipt1');
    if (this.formGroup.invalid) {
      this.isSubmit = false;
      return new CommonUtility().validateForm(this.formGroup);
    }
    this.customerInvoiceService.createInvoice(this.formGroup.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.CUSTOMER_INVOICE_CREATED_SUCCESSFULLY);
        this.emitAfterSuccess.emit();
        this.isSubmit = false;
      } else {
        this.isSubmit = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isSubmit = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get invoice data
   */
  getInvoiceData() {
    this.customerInvoiceService.getInvoiceData(this.invoiceId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        res.body.id = this.invoiceId;
        const invoiceDate = new Date(res.body.invoiceDate);
        if (invoiceDate) {
          res.body.invoiceDate = invoiceDate.toLocaleDateString('en-US');
        }
        this.formGroup.patchValue(res.body);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * used for update invoice related data
   */
  updateInvoiceData() {
    this.isUpdate = true;
    this.formGroup.removeControl('receipt1');
    if (this.formGroup.invalid) {
      this.isUpdate = false;
      return new CommonUtility().validateForm(this.formGroup);
    }
    this.customerInvoiceService.updateInvoice(this.formGroup.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CUSTOMER_INVOICE_UPDATED_SUCCESSFULLY);
        this.emitAfterSuccess.emit();
        this.isUpdate = false;
      } else {
        this.isUpdate = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isUpdate = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * used for reset form data
   */
  resetInvoice() {
    this.formGroup.reset();
    if (this.isEditable) {
      this.getInvoiceData();
      return;
    }
  }

  // /**
  //  * trigger when change the file input
  //  * @param event to change event
  //  */
  //
  // /**
  //  * trigger when change the file input
  //  * @param event to change event
  //  */
  // onChangeInput(event: any): void {
  //   if (!event.target.files[0]) {
  //     return;
  //   }
  //   const targetFile = event.target.files[0];
  //   this.formGroup.patchValue({
  //     receipt: targetFile
  //   });
  // }
  //
  //
  //
  // /**
  //  * clear attachment
  //  */
  // clearAttachment(): void {
  //   const fileUploadElement = document.getElementById('fileUpload') as HTMLInputElement;
  //   fileUploadElement.value = ''; // clear the selected file
  //   const fileTextElement = document.getElementById('fileTextFromInbox') as HTMLInputElement;
  //   fileTextElement.value = ''; // clear the value of the input element
  //   this.formGroup.patchValue({receipt: null}); // reset the value of the form control
  // }

  /**
   * format date
   */

  formatDate(event) {
    this.formGroup.get('invoiceDate').patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
  }
}
