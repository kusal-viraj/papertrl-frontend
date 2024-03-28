import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {PaymentTypeService} from '../../../../shared/services/support/payment-type.service';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {CommonMessage} from '../../../../shared/utility/common-message';
import {PaymentProvider} from '../../../../shared/dto/payment/PaymentProvider';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {PaymentProviderService} from '../../../../shared/services/support/payment-provider.service';

@Component({
  selector: 'app-payment-provider-create',
  templateUrl: './payment-provider-create.component.html',
  styleUrls: ['./payment-provider-create.component.scss']
})
export class PaymentProviderCreateComponent implements OnInit {
  public payProviderForm: UntypedFormGroup;
  @Input() public isEditView = false;
  @Input() paymentTypeId: any;
  public isLoadingCreateAction = false;
  public isLoadingEditAction = false;
  @Output() refreshTable = new EventEmitter();
  imageUrl: any;
  public imageChanged: boolean;
  public image: File;
  paymentTypeList: DropdownDto = new DropdownDto();
  providerDto: PaymentProvider = new PaymentProvider();

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public paymentTypeService: PaymentTypeService, public paymentProviderService: PaymentProviderService) {
  }

  ngOnInit(): void {
    this.getPaymentDropDownList(this.paymentTypeList);
    this.payProviderForm = this.formBuilder.group({
      id: [AppConstant.NULL_VALUE],
      name: [AppConstant.NULL_VALUE, Validators.required],
      description: [AppConstant.NULL_VALUE],
      logoImage: [AppConstant.NULL_VALUE],
      isLogoDeleted: [false],
      img: [],
      paymentTypeList: [AppConstant.NULL_VALUE, Validators.required],
    }, {
      validator: []
    });

    if (this.isEditView) {
      this.getPaymentProviderData();
    }
  }

  /**
   * this method can be used to get the payment type
   * dropdown data
   * @param instance DropdownDto
   */
  getPaymentDropDownList(instance: DropdownDto) {
    this.paymentTypeService.getPaymentDropDownList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        instance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * this method can be used to submit the form
   * @param value to form value
   */
  onSubmitForm(value) {
    this.isLoadingCreateAction = true;
    if (this.payProviderForm.valid) {
      this.paymentProviderService.createPaymentProvider(this.payProviderForm.value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
          this.payProviderForm.reset();
          this.refreshTable.emit();
          this.notificationService.successMessage(HttpResponseMessage.PAYMENT_PROVIDER_CREATED_SUCCESSFULLY);
          this.isLoadingCreateAction = false;
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
      new CommonUtility().validateForm(this.payProviderForm);
    }

  }

  /**
   * this method can be used to reset form
   */
  resetForm() {
    if (this.isEditView) {
      this.getPaymentProviderData();
    } else {
      this.payProviderForm.reset();
    }
  }

  /**
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    if (this.payProviderForm.get(fieldName).value) {
      if (this.payProviderForm.get(fieldName).value[0] === ' ') {
        this.payProviderForm.get(fieldName).patchValue('');
      }
    }
  }

  /**
   * This method can be used to get payment provider data
   * when updating
   */
  getPaymentProviderData() {
    this.paymentProviderService.getPaymentProviderData(this.paymentTypeId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.payProviderForm.patchValue(res.body);
        this.payProviderForm.get('isLogoDeleted').patchValue(false);
        this.downloadItemImage(this.paymentTypeId);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to update payment provider
   */
  updatePaymentProvider() {
    this.isLoadingEditAction = true;
    this.payProviderForm.get('id').setValue(this.paymentTypeId);
    if (this.payProviderForm.valid) {
      this.paymentProviderService.updatePaymentProvider(this.payProviderForm.value).subscribe((res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.refreshTable.emit(true);
          this.isLoadingEditAction = false;
          this.notificationService.successMessage(HttpResponseMessage.PAYMENT_PROVIDER_UPDATED_SUCCESSFULLY);
        } else {
          this.isLoadingEditAction = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error) => {
        this.isLoadingEditAction = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.isLoadingCreateAction = false;
      new CommonUtility().validateForm(this.payProviderForm);
    }
  }

  // ---------------------------- Image Related Methods ---------------------------

  /**
   * Delete Image
   */
  deleteFile() {
    this.image = null;
    this.imageUrl = null;
    this.payProviderForm.get('logoImage').patchValue(null);
    this.payProviderForm.get('isLogoDeleted').patchValue(true);
  }

  /**
   * this method can be used to download item image
   */
  downloadItemImage(providerId: any) {
    this.paymentProviderService.downloadItemImage(providerId).subscribe((res: any) => {
        this.createImageFromBlob(res);
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * Convert the Response Blob image to Image
   * @param image Blob to blob file
   */
  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.imageUrl = reader.result;
    }, false);
    if (image.size > 42) {
      reader.readAsDataURL(image);
    }
  }

  /**
   * this method can be used to upload image
   * @param event to change event
   */
  uploadFile(event) {
    this.payProviderForm.get('isLogoDeleted').patchValue(false);
    const img: File = (event.target.files[0] as File);
    if ((img.size / 1024 / 1024) > AppConstant.MAX_LOGO_SIZE) {
      this.notificationService.infoMessage(CommonMessage.INVALID_LOGO_SIZE);
    } else {
      this.imageChanged = true;
      const reader = new FileReader();
      const file = event.target.files[0];
      if (event.target.files[0]) {
        const targetFile = event.target.files[0];
        this.payProviderForm.patchValue({
          logoImage: targetFile
        });
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.imageUrl = reader.result;
        };
      }
    }
  }

  // ----------------------------- end of image related methods ------------------------
}
