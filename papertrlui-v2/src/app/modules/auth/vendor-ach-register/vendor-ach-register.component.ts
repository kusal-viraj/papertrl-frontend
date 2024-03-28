import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators, FormGroup} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {VendorMasterDto} from '../../../shared/dto/vendor/vendor-master-dto';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {btoa} from 'btoa';
import {VendorAchDetailDto} from '../../../shared/dto/vendor/vendor-ach-detail-dto';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {flush} from '@angular/core/testing';

@Component({
  selector: 'app-vendor-ach-details',
  templateUrl: './vendor-ach-register.component.html',
  styleUrls: ['./vendor-ach-register.component.scss']
})


export class VendorAchRegisterComponent implements OnInit {

  public vendorACHDetailForm: UntypedFormGroup;
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public vendorAchDetailDto: VendorAchDetailDto = new VendorAchDetailDto();
  public vendorDto: VendorMasterDto = new VendorMasterDto();
  public queryParams;
  public queryUuid;
  public encryptedData;
  public isCommunityVendor = false;
  public loading = false;

  public showDetailForm = true;
  public alreadyCreated = false;
  public oldLinkExpired = false;
  public linkExpired = false;
  public registerSuccess = false;

  accountTypes: any[] = [
    {label: 'Checking', value: 'Checking'},
    {label: 'Savings', value: 'Savings'},
  ];

  recipientTypes: any[] = [
    {label: 'Individual', value: 'Individual'},
    {label: 'Business', value: 'Business'},
  ];

  constructor(public formBuilder: UntypedFormBuilder, public vendorService: VendorService, public activatedRoute: ActivatedRoute,
              public notificationService: NotificationService, public router: Router) {
    const queryParams = this.activatedRoute.snapshot.queryParams;
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.validateVendor();
  }

  initFormGroup() {
    this.vendorACHDetailForm = this.formBuilder.group({
      accountType: [null, Validators.compose([Validators.required])],
      recipientType: [null, Validators.compose([Validators.required])],
      companyName: [{value: null, disabled: true}, Validators.compose([Validators.required, Validators.maxLength(50)])],
      accountNumber: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      confirmAccountNumber: [null, Validators.compose([Validators.required, Validators.maxLength(50)])],
      accountRoutingNumber: [null, Validators.compose([Validators.required, Validators.maxLength(9)])],
      confirmRoutingNumber: [null, Validators.compose([Validators.required, Validators.maxLength(9)])],
      remittanceEmail: [AppConstant.NULL_VALUE, [Validators.maxLength(50), PatternValidator.patternValidator(this.expression, {emailValidate: true})]],
      uuid: [null],
    }, {
      validator: [
        this.matchingFields('accountNumber', 'confirmAccountNumber', 'matchingAccountNumber'),
        this.matchingFields('accountRoutingNumber', 'confirmRoutingNumber', 'mismatchedRoutingNumbers')
      ]
    });

    this.queryParams = this.activatedRoute.snapshot.queryParams;
    this.queryUuid = this.activatedRoute.snapshot.queryParams?.uuid;
    this.vendorACHDetailForm.get('uuid').setValue(this.queryUuid);

    if (this.queryParams && this.queryParams.tenantid) {
      this.vendorDto.requestedTenantId = this.queryParams.tenantid;
    }
  }


  /**
   * This method is to check if Confirm Bank Identification Number and Confirm Account Number is match
   */
  matchingFields(controlName: string, matchingControlName: string, errorKey: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({[errorKey]: true});
        return {[errorKey]: true};
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }

  /**
   * Validate the states code and navigate the pages
   */
  validateVendor() {
    if (!this.queryUuid) {
      return;
    }

    this.vendorService.validateACHDetailRequest(this.queryUuid, this.vendorDto.requestedTenantId).subscribe(
      (res: any) => {
        this.isCommunityVendor = res.body.communityVendor;
        const companyNameControl = this.vendorACHDetailForm.get('companyName');

        switch (res.status) {
          case AppConstant.HTTP_RESPONSE_STATUS_SUCCESS:
            companyNameControl.setValue(res.body.companyName);
            if (!res.body.companyName) {
              companyNameControl.enable();
            }
            break;

          case AppConstant.HTTP_RESPONSE_STATUS_CREATED:
            this.updateStatusFlags(false, true, false, false, false);
            break;

          case 226:
            this.updateStatusFlags(false, false, true, false, false);
            break;

          case 208:
            this.updateStatusFlags(false, false, false, true, false);
            break;
        }
      },
      (error) => {
        this.notificationService.errorMessage(error);
      }
    );
  }


  /**
   * This method can be used to submit the form
   */
  onSubmit(value) {
    this.loading = true;
    const accountTypeControl = this.vendorACHDetailForm.get('accountType');
    const recipientTypeControl = this.vendorACHDetailForm.get('recipientType');
    const companyNameControl = this.vendorACHDetailForm.get('companyName');
    const accountNumberControl = this.vendorACHDetailForm.get('accountNumber');
    const confirmAccountNumberControl = this.vendorACHDetailForm.get('accountNumber');
    const accountRoutingNumberControl = this.vendorACHDetailForm.get('accountRoutingNumber');
    const confirmRoutingNumberControl = this.vendorACHDetailForm.get('accountRoutingNumber');


    if (!accountTypeControl || !recipientTypeControl || !companyNameControl || !accountNumberControl || !confirmAccountNumberControl ||
      !accountRoutingNumberControl || !confirmRoutingNumberControl) {
      return;
    }

    if (!accountTypeControl.value || !recipientTypeControl.value || !companyNameControl.value || !accountNumberControl.value ||
      !confirmAccountNumberControl.value || !accountRoutingNumberControl || !confirmRoutingNumberControl.value) {
      accountTypeControl.markAsDirty();
      recipientTypeControl.markAsDirty();
      companyNameControl.markAsDirty();
      accountNumberControl.markAsDirty();
      confirmAccountNumberControl.markAsDirty();
      accountRoutingNumberControl.markAsDirty();
      confirmRoutingNumberControl.markAsDirty();
    } else if (this.vendorACHDetailForm.valid) {
      this.vendorAchDetailDto.accountType = accountTypeControl.value;
      this.vendorAchDetailDto.recipientType = recipientTypeControl.value;
      this.vendorAchDetailDto.companyName = this.vendorACHDetailForm.get('companyName').value;
      this.vendorAchDetailDto.accountNumber = this.vendorACHDetailForm.get('accountNumber').value;
      this.vendorAchDetailDto.accountRoutingNumber = this.vendorACHDetailForm.get('accountRoutingNumber').value;
      this.vendorAchDetailDto.remittanceEmail = this.vendorACHDetailForm.get('remittanceEmail').value;
      this.vendorDto.uuid = this.vendorACHDetailForm.get('uuid').value;

      if (undefined === this.queryParams.uuid) {
        this.vendorDto.requestedTenantId = null;
      } else {
        this.vendorDto.requestedTenantId = this.queryParams.tenantid;
      }

      this.encryptedData = window.btoa(JSON.stringify(this.vendorAchDetailDto));

      if (this.isCommunityVendor == true){
        this.CommunityVendor();
      } else {
        this.nonCommunityVendor();
      }

    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.vendorACHDetailForm);
    }
  }

  nonCommunityVendor() {
    this.vendorService.registerNotACHVendorCommunity(this.encryptedData, this.vendorDto.uuid, this.vendorDto.requestedTenantId)
      .subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.loading = false;
          this.vendorACHDetailForm.reset();
          this.notificationService.successMessage(HttpResponseMessage.VENDOR_ACH_REGISTERED_SUCCESSFULLY);

          setTimeout(() =>
            this.updateStatusFlags(false, false, false, false, true),
            800);
        } else {
          this.loading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.loading = false;
        this.notificationService.errorMessage(error);
      })
    );

  }

  CommunityVendor() {
    this.vendorService.registerACHVendorCommunity(this.encryptedData, this.vendorDto.uuid, this.vendorDto.requestedTenantId)
      .subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.loading = false;
          this.vendorACHDetailForm.reset();
          this.notificationService.successMessage(HttpResponseMessage.VENDOR_ACH_REGISTERED_SUCCESSFULLY);

          setTimeout(() =>
              this.updateStatusFlags(false, false, false, false, true),
            800);
        } else {
          this.loading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.loading = false;
        this.notificationService.errorMessage(error);
      })
    );
  }


  /**
   * This method can be used to reset the form
   */
  resetForm() {
    this.vendorACHDetailForm.reset();
    this.validateVendor();
  }


  private updateStatusFlags(detailForm: boolean, created: boolean, oldLinkExpired: boolean, linkExpired: boolean, success: boolean): void {
    this.showDetailForm = detailForm;
    this.alreadyCreated = created;
    this.oldLinkExpired = oldLinkExpired;
    this.linkExpired = linkExpired;
    this.registerSuccess = success;
  }
}
