import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {PaymentTypeService} from '../../../../shared/services/support/payment-type.service';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {PaymentType} from '../../../../shared/dto/payment/PaymentType';

@Component({
  selector: 'app-create-payment-type',
  templateUrl: './create-payment-type.component.html',
  styleUrls: ['./create-payment-type.component.scss']
})
export class CreatePaymentTypeComponent implements OnInit {
  public payTypeForm: UntypedFormGroup;
  @Input() public isEditView = false;
  @Input() paymentTypeId: any;
  public isLoadingCreateAction = false;
  public isLoadingEditAction = false;
  @Output() refreshTable = new EventEmitter();

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public paymentTypeService: PaymentTypeService) {
  }

  ngOnInit(): void {
    this.payTypeForm = this.formBuilder.group({
      name: [AppConstant.NULL_VALUE, Validators.required],
      description: [AppConstant.NULL_VALUE],
    }, {
      validator: []
    });

    if (this.isEditView) {
      this.getPaymentTypeData();
    }
  }


  /**
   * this method can be used to submit the form
   * @param value to form value
   */
  onSubmitForm(value) {
    this.isLoadingCreateAction = true;
    if (this.payTypeForm.valid) {
      this.paymentTypeService.createPaymentType(this.payTypeForm.value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
          this.payTypeForm.reset();
          this.refreshTable.emit();
          this.isLoadingCreateAction = false;
          this.notificationService.successMessage(HttpResponseMessage.PAYMENT_TYPE_CREATED_SUCCESSFULLY);
        } else {
          this.isLoadingCreateAction = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isLoadingCreateAction = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.isLoadingCreateAction = false;
      new CommonUtility().validateForm(this.payTypeForm);
    }

  }

  /**
   * this method can be used to reset form
   */
  resetForm() {
    if (this.isEditView) {
      this.getPaymentTypeData();
    } else {
      this.payTypeForm.reset();
    }
  }

  /**
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    if (this.payTypeForm.get(fieldName).value) {
      if (this.payTypeForm.get(fieldName).value[0] === ' ') {
        this.payTypeForm.get(fieldName).patchValue('');
      }
    }
  }

  /**
   * This method can be used to get payment type data
   */
  getPaymentTypeData() {
    this.paymentTypeService.getPaymentTypeData(this.paymentTypeId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.payTypeForm.patchValue(res.body);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to update payment type
   */
  updatePaymentType() {
    this.isLoadingEditAction = true;
    const updatingObj = new PaymentType(this.payTypeForm.value);
    updatingObj.id = this.paymentTypeId;
    if (this.payTypeForm.valid) {
      this.paymentTypeService.updatePaymentType(updatingObj).subscribe((res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.refreshTable.emit(true);
          this.isLoadingEditAction = false;
          this.notificationService.successMessage(HttpResponseMessage.PAYMENT_TYPE_UPDATED_SUCCESSFULLY);
        } else {
          this.isLoadingEditAction = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error) => {
        this.isLoadingEditAction = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.isLoadingEditAction = false;
      new CommonUtility().validateForm(this.payTypeForm);

    }
  }
}
