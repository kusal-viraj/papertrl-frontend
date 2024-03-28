import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PaymentProviderMst} from '../../../../shared/dto/payment/payment-provider-mst';
import {PaymentConfigService} from '../../../../shared/services/settings/payment-config.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {Configuration} from '../../../../shared/dto/payment/configuration';

@Component({
  selector: 'app-payment-provider-detail',
  templateUrl: './payment-provider-detail.component.html',
  styleUrls: ['./payment-provider-detail.component.scss']
})
export class PaymentProviderDetailComponent implements OnInit, AfterViewInit {

  @Input() providerMaster: PaymentProviderMst = new PaymentProviderMst();
  @Output() updatedSuccess = new EventEmitter();
  public checkedTypeArray: any [] = [];
  public appConstant = new AppConstant();
  btnLoading = false;
  selectedType: any;
  public configs: any [] = [];

  constructor(public paymentConfigService: PaymentConfigService, public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.downloadItemImage(this.providerMaster.id);
    this.addRegExpObjectPaymentTypeField();
    this.validateCancellationTime();
  }

  /**
   * this method can be used to download logo image
   * @param providerId to provider id
   */
  downloadItemImage(providerId) {
    if (!providerId) {
      return;
    }
    this.paymentConfigService.downloadLogoImage(providerId).subscribe((res: any) => {
        this.createLogoImageUrl(res);
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * Convert the Response Blob image to Image
   * @param image Blob to blob file
   */
  createLogoImageUrl(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.providerMaster.logoUrl = reader.result;
    }, false);
    if (image.size > 42) {
      reader.readAsDataURL(image);
    }
  }

  /**
   * this method can be used to reset payment provider configurations details
   */
  resetProviderData() {
    if (!this.providerMaster.id) {
      return;
    }
    this.paymentConfigService.getProviderSpecificData(this.providerMaster.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res.body) {
          this.checkedTypeArray = [];
          this.providerMaster = res.body;
          this.providerMaster.supportedTypeList.forEach(item => {
            if (item && item.enabled !== undefined && item.id !== undefined) {
              if (item.enabled){
                this.checkedTypeArray.push(item.id);
              }
            }
          });
          this.addRegExpObjectPaymentTypeField();
          this.downloadItemImage(this.providerMaster.id);
          this.updatedSuccess.emit();
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to save payment provider configurations details
   */
  saveProviderConfigurations() {
    this.validateCancellationTime();
    let paymentTypeList: any[] = [];
    paymentTypeList =
      this.providerMaster.paymentTypeList?.filter(paymentType => this.checkedTypeArray.includes(paymentType.id));
    if (paymentTypeList) {
      for (const paymentType of paymentTypeList) {
        if (paymentType.configurations.length > AppConstant.ZERO) {
          for (const fieldConfig of paymentType.configurations) {
            if (fieldConfig && fieldConfig?.fieldName) {
              const value = paymentType.configurationValue[fieldConfig?.fieldName];
              if (!value) {
                this.notificationService.infoMessage(`${fieldConfig?.fieldCaption} is required`);
                this.btnLoading = false;
                return;
              }
              if (value.length > fieldConfig?.maxLength) {
                this.notificationService.infoMessage(`${fieldConfig?.fieldCaption}
           field cannot exceed ${fieldConfig?.maxLength} characters`);
                this.btnLoading = false;
                return;
              }
              if (!fieldConfig.pattern.test(value)) {
                this.notificationService.infoMessage(
                  `Field require (${this.appConstant.DATA_TYPE_PATTERN_MAP.get(fieldConfig?.dataType)}) type`);
                this.btnLoading = false;
                return;
              }
            }

          }
        }
      }
    }
    if (paymentTypeList.length > 0){
      this.paymentConfigService.saveProviderData(this.providerMaster).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.PAYMENT_PROVIDER_CONFIG_SUCCESSFULLY);
        this.updatedSuccess.emit();
        this.btnLoading = false;
      } else {
        this.btnLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.btnLoading = false;
      this.notificationService.errorMessage(error);
    });
    }else{
      this.btnLoading = false;
      return this.notificationService.infoMessage(HttpResponseMessage.PLEASE_SELECT_AT_LEAST_ONE_SUPPORTED_PAYMENT_TYPE_TO_SAVE_YOUR_INFORMATION);
    }
  }

  /**
   * validate empty spaces in configuring field
   * @param singlePaymentType to payment type
   * @param fieldConfig to configuration of payment type field
   */

  validateField(singlePaymentType, fieldConfig) {
    const fieldValue = singlePaymentType?.configurationValue[fieldConfig?.fieldName];
    const trimmedValue = fieldValue?.replace(/\s+/g, '');
    if (!fieldValue || trimmedValue === '') {
      singlePaymentType.configurationValue[fieldConfig.fieldName] = '';
      return;
    }
  }

  /**
   * this method can be used to validate cancellation time
   */
  validateCancellationTime() {
    if (!this.providerMaster.daysForCancel) {
      this.providerMaster.daysForCancel = 0;
    }
    if (!this.providerMaster.hoursForCancel) {
      this.providerMaster.hoursForCancel = 0;
    }
    if (!this.providerMaster.minutesForCancel) {
      this.providerMaster.minutesForCancel = 0;
    }
  }

  /**
   * this method can be used to add reg expression reference to payment type related fields
   */
  addRegExpObjectPaymentTypeField() {
    if (!this.providerMaster) {
      return;
    } else {
      this.providerMaster?.paymentTypeList?.forEach((paymentType) => {
        paymentType?.configurations?.forEach((configuration: Configuration, i) => {
          configuration.pattern = new RegExp(configuration.dataType);
        });
      });
    }
  }

  /**
   * this method can be used to update value of supported payment types list
   * @param checked to check status
   * @param id to payment type id
   */
  updateVisibleConfigurationField(checked, id) {
    if (!id) {
      return;
    }
    if (checked) {
      if (!this.checkedTypeArray.includes(id)) {
        this.checkedTypeArray.push(id);
      }
    } else {
      this.checkedTypeArray.splice(this.checkedTypeArray.findIndex(x => x === id), 1);
    }
    this.providerMaster.supportedTypeList[this.providerMaster.supportedTypeList.findIndex(x => x.id === id)].enabled = checked;
    this.checkIfAvailableConfigurationForPaymentType();
  }

  /**
   * this method can be used to show hide field
   * @param paymentTypeId to payment type id
   */
  isShowField(paymentTypeId) {
    return this.checkedTypeArray.includes(paymentTypeId);
  }

  ngAfterViewInit(): void {
    this.providerMaster?.supportedTypeList?.forEach(val => {
      if (val.enabled) {
        this.checkedTypeArray.push(val.id);
      }
      if (val.preferred) {
        this.selectedType = val.name;
      }
    });
  }

  /**
   * this method can be used to check whether is available configurations for provider's payment types
   */
  checkIfAvailableConfigurationForPaymentType() {
    const filterList: any [] = this.providerMaster?.paymentTypeList?.filter(obj => this.checkedTypeArray.includes(obj.id));
    this.configs = [];
    if (!filterList || filterList?.length === 0) {
      return false;
    }
    if (filterList?.length > 0) {
      filterList?.forEach(value => {
        if (value.configurations.length > 0) {
          this.configs.push(value);
        }
      });
    }
    return this.configs.length > 0;
  }


  filterArray() {
    const filteredPaymentTypeList = this.providerMaster.paymentTypeList.filter((paymentType) => {
      return this.checkedTypeArray.includes(paymentType.id);
    });
    return filteredPaymentTypeList;

  }

}


