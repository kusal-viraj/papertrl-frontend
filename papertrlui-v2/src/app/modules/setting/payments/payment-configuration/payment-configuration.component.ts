import {Component, OnInit} from '@angular/core';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {PaymentConfigService} from '../../../../shared/services/settings/payment-config.service';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {PaymentProviderMst} from '../../../../shared/dto/payment/payment-provider-mst';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {PrivilegeService} from '../../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../../shared/enums/app-authorities';
import {PaymentTypeDto} from '../../../../shared/dto/payment/Payment-type-dto';
import {Configuration} from '../../../../shared/dto/payment/configuration';

@Component({
  selector: 'app-payment-configuration',
  templateUrl: './payment-configuration.component.html',
  styleUrls: ['./payment-configuration.component.scss']
})
export class PaymentConfigurationComponent implements OnInit {
  public appConstant: AppConstant = new AppConstant();
  paymentProviderConfigForm: UntypedFormGroup;
  public providerList: PaymentProviderMst [] = [];
  public provider: PaymentProviderMst = new PaymentProviderMst();
  public appAuthorities = AppAuthorities;
  isContactSupportTeam = false;
  isSetupProvider = false;
  providerMaster: any = {};


  constructor(public formBuilder: UntypedFormBuilder, public paymentConfigService: PaymentConfigService,
              public notificationService: NotificationService, public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.paymentProviderConfigForm = this.formBuilder.group({
      daysForCancel: [0],
      hoursForCancel: [0],
      minutesForCancel: [0],
      defaultProvider: [false],
      paymentProvider: [null],
      status: [null]
    });
    this.getTenantAvailableProviderList();
  }

  /**
   * this method can be used to get available all providers
   */
  getTenantAvailableProviderList() {
    this.paymentConfigService.getAvailableProviders().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.providerList = res.body;
        this.downloadProviderLogo();
        this.addRegExpObjectPaymentTypeField();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to add reg expression reference to payment type related fields
   */
  addRegExpObjectPaymentTypeField() {
    this.providerList.forEach((value, index) => {
      value.paymentTypeList.forEach((paymentType) => {
        paymentType.configurations.forEach((configuration: Configuration, i) => {
          configuration.pattern = new RegExp(configuration.dataType);
        });
      });
    });
  }

  /**
   * this method can be used to download logo image
   * @param providerId to provider id
   * @param index to index number
   */
  downloadItemImage(providerId, index) {
    if (!providerId) {
      return;
    } else {
      this.paymentConfigService.downloadLogoImage(providerId).subscribe((res: any) => {
          this.createLogoImageUrl(res, index);
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * Convert the Response Blob image to Image
   * @param image Blob to blob file
   * @param index to index
   */
  createLogoImageUrl(image: Blob, index) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.providerList[index].logoUrl = reader.result;
    }, false);
    if (image.size > 42) {
      reader.readAsDataURL(image);
    }
  }

  /**
   * this method can be used to iterate providers and download specific logo for provider
   */
  downloadProviderLogo() {
    if (this.providerList.length > 0) {
      this.providerList.forEach((value, index) => {
        this.downloadItemImage(value.id, index);
      });
    }
  }

  /**
   * contact support team
   * @param id to provider id
   * @param providerMst to provider
   */
  contactSupportTeam(id, providerMst) {
    providerMst.isProgressSendConfigurationAction = true;
    this.isContactSupportTeam = true;
    if (!id) {
      return;
    }
    this.paymentConfigService.contactSupportTeam(id).subscribe((res: any) => {
      this.isContactSupportTeam = false;
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.PAYMENT_PROVIDER_CONFIGURATION_MESSAGE);
        providerMst.isProgressSendConfigurationAction = false;
      } else {
        providerMst.isProgressSendConfigurationAction = false;
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      providerMst.isProgressSendConfigurationAction = false;
      this.isContactSupportTeam = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * remove field empty space
   * @param value to payment type
   * @param fieldConfig to configurations array object
   */
  clearSpace(value: PaymentTypeDto, fieldConfig: Configuration) {
    let enteredValue = value.configurationValue[fieldConfig.fieldName];
    enteredValue = enteredValue?.trim();
    if (enteredValue === AppConstant.EMPTY_SPACE || enteredValue === AppConstant.EMPTY_STRING) {
      value.configurationValue[fieldConfig.fieldName] = AppConstant.EMPTY_STRING;
    }
  }

  /**
   * this method can be used to provider values transfer to provider details
   * @param providerMst to provider master object
   */
  clickOnSetUpButton(providerMst: PaymentProviderMst) {
    this.providerMaster = providerMst;
    this.isSetupProvider = true;
  }
}
