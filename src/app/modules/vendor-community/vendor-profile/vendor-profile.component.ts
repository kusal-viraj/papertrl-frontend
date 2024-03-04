import {Component, HostListener, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {VendorMasterDto} from '../../../shared/dto/vendor/vendor-master-dto';
import {VendorSuggestionDto} from '../../../shared/dto/vendor/vendor-suggestion-dto';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {AppConstant} from '../../../shared/utility/app-constant';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {VendorCommunityService} from '../../../shared/services/vendor-community/vendor-community.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {VendorAdditionalFieldAttachments} from '../../../shared/dto/vendor/vendor-additional-field-attachments';

@Component({
  selector: 'app-vendor-profile',
  templateUrl: './vendor-profile.component.html',
  styleUrls: ['./vendor-profile.component.scss']
})
export class VendorProfileComponent implements OnInit {

  public vendorCreateForm: UntypedFormGroup;
  public vendorDto: VendorMasterDto = new VendorMasterDto();
  public paymentTypes: DropdownDto = new DropdownDto();
  public classification: DropdownDto = new DropdownDto();
  public allPaymentTypeList: DropdownDto = new DropdownDto();
  public selectedPaymentTypes: DropdownDto = new DropdownDto();
  public postalAddress = false;
  public showAddress = false;
  public showMarket = false;
  public w9Information = true;
  public marketingPlaceInfo = true;
  public countries = [];
  public states = [];
  public cities = [];
  public taxClassifications = [];
  public vendorName;
  public btnLoading = false;
  public showRemitEmail = false;

  public suggestions: VendorSuggestionDto[] = [];
  public vendorId;

  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public isEmailAvailable = false;
  public isVendorSsnAvailable = false;
  public isVendorEmpNoAvailable = false;

  public filteredGroups: any[];


  public isVendorSelectedFromSuggestions = false;
  public isSocialNoDisabled = false;
  public isEmployeeIdDisabled = false;
  public isSocialEmailDisabled = false;
  public isSelectedPaymentTypeAsCheckAndVirtualCard = false;
  public sicCode = [];
  public naicsCode = [];
  public vendorAttachments: VendorAdditionalFieldAttachments [] = [];
  public appConstant = new AppConstant();
  public recipientType: DropdownDto = new DropdownDto();
  public accountType: DropdownDto = new DropdownDto();
  public commonUtil = new CommonUtility();

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public vendorService: VendorService, public vendorCommunityService: VendorCommunityService,
              public messageService: MessageService, public confirmationService: ConfirmationService) {
    this.postalAddress = false;
    this.w9Information = false;
    this.marketingPlaceInfo = false;

    this.vendorCreateForm = this.formBuilder.group({
      id: [null],
      name: [null, Validators.compose([Validators.required, Validators.maxLength(150)])],
      contactPerson: [null, Validators.compose([Validators.maxLength(150)])],
      contactNumber: [null],
      fax: [null, Validators.compose([Validators.maxLength(50)])],
      email: [AppConstant.NULL_VALUE, [Validators.required, Validators.compose([Validators.maxLength(150),
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      ccEmail: [AppConstant.NULL_VALUE, [Validators.compose([Validators.maxLength(150),
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      address_line_1: [null],
      address_line_2: [null],
      country: [AppEnumConstants.DEFAULT_COUNTRY, Validators.required],
      zipcode: [null, Validators.compose([Validators.maxLength(30)])],
      city: [null],
      state: [null],
      r_address_line_1: [null],
      r_address_line_2: [null],
      r_country: [null],
      r_zipcode: [null, Validators.compose([Validators.maxLength(30)])],
      r_city: [null],
      r_state: [null],
      w9Form: [null],
      w9FormName: [null],
      businessName: [null],
      tenNinetyNine: [null],
      socialSecNo: [null],
      empIdNo: [null],
      exemptPayeeCode: [null, Validators.compose([Validators.maxLength(40)])],
      fatcaReportingCode: [null, Validators.compose([Validators.maxLength(40)])],
      taxClassification: [null],
      classificationIdList: [null],
      diverseSupplier: [false],
      classificationAttachmentList: [null],
      classificationAttachmentListNames: [null],
      w9AttachmentId: [null],
      naicsCode: [null],
      sicCode: [null],
      companyName: [null],
      recipientType: [null],
      accountType: [null],
      accountNumber: [null],
      accountRoutingNumber: [null],
      businessDescription: [null],
      webUrl: [null],
      paymentOptionId: [null],
      acceptedPaymentTypes: [null],
      preferredPaymentTypeId: [null],
      remittanceEmail: [null],
      remitEmailSwitchEnable: [false],
    });
    this.getPaymentType(this.allPaymentTypeList);

    this.vendorCreateForm.get('diverseSupplier').valueChanges.subscribe(value => {
      if (this.vendorCreateForm.get('diverseSupplier').value){
        this.vendorCreateForm.get('classificationIdList').setValidators(Validators.required);
      } else {
        this.vendorCreateForm.get('classificationIdList').setValidators(null);
      }
      this.vendorCreateForm.get('classificationIdList').updateValueAndValidity();
    });

    this.vendorCreateForm.get('remitEmailSwitchEnable').valueChanges.subscribe(value => {
      if (this.vendorCreateForm.get('remitEmailSwitchEnable').value) {
        this.vendorCreateForm.get('remittanceEmail').setValidators([Validators.required, Validators.compose([Validators.maxLength(150),
          PatternValidator.patternValidator(this.expression, {emailValidate: true})])]);
      } else {
        this.vendorCreateForm.get('remittanceEmail').clearValidators();
        this.vendorCreateForm.get('remittanceEmail').reset();
      }
      this.vendorCreateForm.get('remittanceEmail').updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.vendorService.getCountries().subscribe((res) => {
      this.countries = (res.body);
    });
    this.vendorService.getCities().subscribe((res) => {
      this.cities = (res.body);
    });
    this.vendorService.getStates().subscribe((res) => {
      this.states = (res.body);
    });
    this.vendorService.getTaxClassifications().subscribe((res) => {
      this.taxClassifications = (res.body);
    });
    this.vendorService.getSicCode().subscribe((res) => {
      this.sicCode = (res.body);
    });
    this.vendorService.getNaicsCode().subscribe((res) => {
      this.naicsCode = (res.body);
    });
    this.accountType.data = AppConstant.PAYMENT_ACCOUNT_TYPES;
    this.recipientType.data = AppConstant.PAYMENT_RECIPIENT_TYPES;

    let json: any;
    json = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
    this.vendorId = json.vendorId;
    this.getClassificationList(this.classification);
    this.getVendorData(this.vendorId);
  }

  onSubmit(value: any) {
    this.btnLoading = true;
    this.setVendorDataToDto();
    this.vendorDto.contactNumber = this.commonUtil.getTelNo(this.vendorCreateForm, 'contactNumber');
    if (this.vendorCreateForm.valid && !this.isEmailAvailable
      && !this.isVendorEmpNoAvailable && !this.isVendorSsnAvailable) {

      if (!this.vendorDto.diverseSupplier) {
        this.vendorDto.classificationIdList = [];
        this.vendorDto.classificationAttachmentList = null;
      }

      this.vendorCommunityService.updateVendor(this.vendorDto).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.vendorCreateForm.reset();
            this.btnLoading = false;
            this.vendorAttachments = [];
            this.getVendorData(this.vendorId);
            this.notificationService.successMessage(HttpResponseMessage.PROFILE_UPDATED_SUCCESSFULLY);
          } else {
            this.btnLoading = false;
            this.notificationService.infoMessage(res.body.message);
          }
        }, (error => {
          this.btnLoading = false;
          this.notificationService.errorMessage(error);
        })
      );
    } else {
      this.btnLoading = false;
      new CommonUtility().validateForm(this.vendorCreateForm);
    }
  }

  /**
   * This method can be used to get vendor data
   */
  getVendorData(id) {
    this.vendorCommunityService.getVendor(id).subscribe((res: any) => {
      if (res.body.fatcaReportingCode || res.body.exemptPayeeCode || res.body.empIdNo ||
        res.body.socialSecNo || res.body.taxClassification) {
        this.w9Information = true;
      }
      if (res.body.naicsCode || res.body.businessDescription || res.body.sicCode ||
        res.body.webUrl) {
        this.marketingPlaceInfo = true;
      }
      if (res.body.classificationAttachment.length > 0) {
        res.body.classificationAttachment.forEach((value) => {
          const vpAttachment = new VendorAdditionalFieldAttachments();
          vpAttachment.id = value.id;
          vpAttachment.fileName = value.fileName;
          vpAttachment.fieldName = this.appConstant.CLASSIFICATION_FIELD_NAME;
          this.vendorAttachments.push(vpAttachment);
        });
      }
      if (res.body.w9Attachment) {
        res.body.w9Attachment.forEach((value) => {
          const vpAttachment = new VendorAdditionalFieldAttachments();
          vpAttachment.id = value.id;
          vpAttachment.fileName = value.fileName;
          vpAttachment.fieldName = this.appConstant.VENDOR_W9_FORM_STRING_NAME;
          this.vendorAttachments.push(vpAttachment);
        });
      }
      if (res.body.remittanceEmail) {
        this.vendorCreateForm.get('remitEmailSwitchEnable').patchValue(true);
      }
      this.commonUtil.onAcceptedPaymentTypesChange(res.body?.acceptedPaymentTypes);
      this.setPreferredPaymentType(res.body?.acceptedPaymentTypes);
      this.vendorCreateForm.patchValue(res.body);
      this.commonUtil.isValidPaymentInfoUsBank(this.vendorCreateForm);
      this.patchVendorData(res);
    });
  }

  /**
   * Set network response to form for map data
   */
  patchVendorData(res) {
    this.isEmployeeIdDisabled = this.isVendorSelectedFromSuggestions === true && res.body.empIdNo !== null
      && res.body.empIdNo !== '' && res.body.empIdNo !== undefined;
    this.isSocialNoDisabled = this.isVendorSelectedFromSuggestions === true && res.body.socialSecNo !== null
      && res.body.socialSecNo !== '' && res.body.socialSecNo !== undefined;
    this.isSocialEmailDisabled = this.isVendorSelectedFromSuggestions === true && res.body.email !== null
      && res.body.email !== '';

    if (res.body.permenantAddress) {
      this.vendorCreateForm.get('address_line_1').patchValue(res.body.permenantAddress.addressLine1);
      this.vendorCreateForm.get('address_line_2').patchValue(res.body.permenantAddress.addressLine2);
      this.vendorCreateForm.get('country').patchValue(res.body.permenantAddress.country);
      this.vendorCreateForm.get('zipcode').patchValue(res.body.permenantAddress.zipcode);
      this.vendorCreateForm.get('city').patchValue(res.body.permenantAddress.city);
      this.vendorCreateForm.get('state').patchValue(res.body.permenantAddress.addressState);
    }
    if (res.body.remitAddress) {
      this.vendorCreateForm.get('r_address_line_1').patchValue(res.body.remitAddress.addressLine1);
      this.vendorCreateForm.get('r_address_line_2').patchValue(res.body.remitAddress.addressLine2);
      this.vendorCreateForm.get('r_country').patchValue(res.body.remitAddress.country);
      this.vendorCreateForm.get('r_zipcode').patchValue(res.body.remitAddress.zipcode);
      this.vendorCreateForm.get('r_city').patchValue(res.body.remitAddress.city);
      this.vendorCreateForm.get('r_state').patchValue(res.body.remitAddress.addressState);
      if (res.body.remitAddress.addressLine1 || res.body.remitAddress.addressLine2 || res.body.remitAddress.country ||
        res.body.remitAddress.zipcode || res.body.remitAddress.city || res.body.remitAddress.addressState) {
        this.showAddress = true;
      }
    }
  }

  /**
   * Set form data to dto
   */
  setVendorDataToDto() {
    this.vendorDto.id = this.vendorCreateForm.get('id').value;
    this.vendorDto.name = this.vendorCreateForm.get('name').value;
    this.vendorDto.contactPerson = this.vendorCreateForm.get('contactPerson').value;
    this.vendorDto.contactNumber = this.vendorCreateForm.get('contactNumber').value;
    this.vendorDto.fax = this.vendorCreateForm.get('fax').value;
    this.vendorDto.email = this.vendorCreateForm.get('email').value;
    this.vendorDto.ccEmail = this.vendorCreateForm.get('ccEmail').value;
    this.vendorDto.w9Form = this.vendorCreateForm.get('w9Form').value;
    this.vendorDto.paymentOptionId = this.vendorCreateForm.get('paymentOptionId').value;
    this.vendorDto.socialSecNo = this.vendorCreateForm.get('socialSecNo').value;
    this.vendorDto.empIdNo = this.vendorCreateForm.get('empIdNo').value;
    this.vendorDto.exemptPayeeCode = this.vendorCreateForm.get('exemptPayeeCode').value;
    this.vendorDto.fatcaReportingCode = this.vendorCreateForm.get('fatcaReportingCode').value;
    this.vendorDto.taxClassification = this.vendorCreateForm.get('taxClassification').value;
    this.vendorDto.naicsCode = this.vendorCreateForm.get('naicsCode').value;
    this.vendorDto.businessDescription = this.vendorCreateForm.get('businessDescription').value;
    this.vendorDto.sicCode = this.vendorCreateForm.get('sicCode').value;
    this.vendorDto.webUrl = this.vendorCreateForm.get('webUrl').value;
    this.vendorDto.tenNinetyNine = this.vendorCreateForm.get('tenNinetyNine').value;
    this.vendorDto.remitEmailSwitchEnable = this.vendorCreateForm.get('remitEmailSwitchEnable').value;

    this.vendorDto.acceptedPaymentTypes = this.vendorCreateForm.get('acceptedPaymentTypes').value;
    this.vendorDto.preferredPaymentTypeId = this.vendorCreateForm.get('preferredPaymentTypeId').value;
    this.vendorDto.companyName = this.vendorCreateForm.get('companyName').value;
    this.vendorDto.recipientType = this.vendorCreateForm.get('recipientType').value;
    this.vendorDto.accountType = this.vendorCreateForm.get('accountType').value;
    this.vendorDto.accountNumber = this.vendorCreateForm.get('accountNumber').value;
    this.vendorDto.accountRoutingNumber = this.vendorCreateForm.get('accountRoutingNumber').value;
    this.vendorDto.remittanceEmail = this.vendorCreateForm.get('remittanceEmail').value;

    this.vendorDto.diverseSupplier = this.vendorCreateForm.get('diverseSupplier').value;
    this.vendorDto.classificationIdList = this.vendorCreateForm.get('classificationIdList').value;
    this.vendorDto.classificationAttachmentList = this.vendorCreateForm.get('classificationAttachmentList').value;

    this.vendorDto.permenantAddress.addressLine1 = this.vendorCreateForm.get('address_line_1').value;
    this.vendorDto.permenantAddress.addressLine2 = this.vendorCreateForm.get('address_line_2').value;
    this.vendorDto.permenantAddress.country = this.vendorCreateForm.get('country').value;
    this.vendorDto.permenantAddress.zipcode = this.vendorCreateForm.get('zipcode').value;
    this.vendorDto.permenantAddress.city = this.vendorCreateForm.get('city').value;
    this.vendorDto.permenantAddress.addressState = this.vendorCreateForm.get('state').value;

    this.vendorDto.remitAddress.addressLine1 = this.vendorCreateForm.get('r_address_line_1').value;
    this.vendorDto.remitAddress.addressLine2 = this.vendorCreateForm.get('r_address_line_2').value;
    this.vendorDto.remitAddress.country = this.vendorCreateForm.get('r_country').value;
    this.vendorDto.remitAddress.zipcode = this.vendorCreateForm.get('r_zipcode').value;
    this.vendorDto.remitAddress.city = this.vendorCreateForm.get('r_city').value;
    this.vendorDto.remitAddress.addressState = this.vendorCreateForm.get('r_state').value;

  }

  /**
   * This method can be used to show hide remit address and there validations
   * @param event to change event
   */
  showRemitAddress(event) {
    this.showAddress = event.checked;
  }

  /**
   * This method can be used to show hide remit address and there validations
   * @param event to change event
   */
  showMarketPlace(event) {
    this.showMarket = event.checked;
  }

  /**
   * patch w9 form
   */
  fileUpload1(event: any) {
    // this.w9Form.nativeElement.innerText = event.target.files[0].name;
    if (event.target.files[0]) {
      if (event.target.files[0]) {
        const targetFile = event.target.files[0];
        this.vendorCreateForm.patchValue({
          w9Form: targetFile
        });
      }
    } else {
      this.vendorCreateForm.get('w9Form').patchValue(null);
    }
  }

  clearW9Attachment(){
    this.vendorCreateForm.get('w9Form').patchValue(null);
  }

  /**
   * This method can be used to reset vendor creation page
   */
  resetVendorCreateForm() {
    this.vendorCreateForm.reset();
    this.vendorAttachments = [];
    this.getVendorData(this.vendorId);
    this.isVendorEmpNoAvailable = false;
    this.isVendorSsnAvailable = false;
    this.isEmailAvailable = false;
  }

  /**
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    if (this.vendorCreateForm.get(fieldName).value) {
      if (this.vendorCreateForm.get(fieldName).value[1] === ' ') {
        this.vendorCreateForm.get(fieldName).patchValue('');
      }
    }
    if (this.vendorCreateForm.get(fieldName).value === ' ' && !this.vendorCreateForm.get(fieldName).value.replace(/\s/g, '').length) {
      this.vendorCreateForm.get(fieldName).patchValue('');
    }
  }

  /**
   * Auto Complete States
   */
  filterStates(event) {
    const query = event.query;
    const filtered = [];
    this.states.forEach(state => {
      if (state.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(state);
      }
    });
    this.filteredGroups = filtered;
  }

  /**
   * Auto Complete Cities
   */
  filterCities(event) {
    const query = event.query;
    const filtered = [];
    this.cities.forEach(city => {
      if (city.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(city);
      }
    });
    this.filteredGroups = filtered;
  }


  /**
   * Check Email is available
   */
  checkEmailAvailability() {
    const emailLetters = this.vendorCreateForm.get('email').value;
    if (emailLetters !== null && emailLetters !== '') {
      this.vendorCommunityService.checkEmailAvailability(emailLetters, this.vendorCreateForm.get('id').value).subscribe((res: any) => {
          this.isEmailAvailable = res.body;
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }


  /**
   * Check ssn availability
   */
  checkVendorSsnAvailability() {
    const socialSecNo = this.vendorCreateForm.get('socialSecNo').value;
    if (socialSecNo !== null && socialSecNo !== '') {
      this.vendorCommunityService.checkSsnAvailability(socialSecNo, this.vendorCreateForm.get('id').value).subscribe((res: any) => {
          this.isVendorSsnAvailable = res.body;
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * Check Employee id availability
   */
  checkVendorEmployeeAvailability() {
    const empIdNo = this.vendorCreateForm.get('empIdNo').value;
    if (empIdNo !== null && empIdNo !== '') {
      this.vendorCommunityService.checkEmployeeNoAvailability(empIdNo, this.vendorCreateForm.get('id').value).subscribe((res: any) => {
          this.isVendorEmpNoAvailable = res.body;
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }


  downloadW9Form(val) {
    this.vendorCommunityService.downloadW9Form(val.id).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', val.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
      val.loading = false;
    }, error => {
      val.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get payment type list
   */
  getPaymentType(instance: DropdownDto) {
    this.vendorService.getPaymentTypeList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        instance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get classification list for dropdown
   */
  getClassificationList(instance: DropdownDto) {
    this.vendorService.getClassificationList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        instance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getClassificationAttachmentNames(diversity: HTMLInputElement) {
    if (diversity.files.length > 1) {
      return `${diversity.files[0].name} and ${diversity.files.length - 1} more file(s)`;
    } else if (diversity.files.length === 1) {
      return diversity.files[0].name;
    } else {
      return null;
    }
  }

  /**
   * patch classification attachments list
   */
  classificationUpload(event: any) {
    if (event.target.files[0]) {
      const targetFile = [];
      for (var index in event.target.files) {
        if (isNaN(event.target.files[index])) {
          targetFile.push(event.target.files[index]);
        }
      }
      this.vendorCreateForm.patchValue({
        classificationAttachmentList: targetFile
      });
    } else {
      this.vendorCreateForm.get('classificationAttachmentList').patchValue(null);
    }
  }

  /**
   * this method can be used to download attachment
   * @param val to attachment object
   */
  downloadVendorAttachment(val) {
    val.loading = true;
    if (val.fieldName === this.appConstant.CLASSIFICATION_FIELD_NAME) {
      this.downloadClassificationAttachment(val);
    }else{
       this.downloadW9Form(val);
     }
  }

  deleteVendorAttachments(val, i) {
    if (val.fieldName === this.appConstant.CLASSIFICATION_FIELD_NAME) {
      this.deleteClassificationAttachments(val, i);
    } else {
      this.deleteW9Attachments(val, i);
    }
  }

  /**
   * delete classification attachment
   * @param val to attachment object
   * @param i to index
   */
  deleteClassificationAttachments(val: any, i: any) {
    this.confirmationService.confirm({
      key: AppConstant.VENDOR_ATTACHMENT_DELETE_KEY,
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.vendorService.deleteClassificationAttachmentFromVendorCommunity(val.id).subscribe((res: any) => {
          if (res.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.infoMessage(res.body.message);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.ATTACHMENT_DELETED_SUCCESSFULLY);
            this.vendorAttachments.splice(i, 1);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * delete w9 form attachment
   * @param val to attachment object
   * @param i to index
   */
  deleteW9Attachments(val: any, i: any) {
    this.confirmationService.confirm({
      key: AppConstant.VENDOR_ATTACHMENT_DELETE_KEY,
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.vendorService.deleteW9AttachmentFromVendorCommunity(val.id).subscribe((res: any) => {
          if (res.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.infoMessage(res.body.message);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.ATTACHMENT_DELETED_SUCCESSFULLY);
            this.vendorAttachments.splice(i, 1);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  downloadClassificationAttachment(val: any) {
    this.vendorService.downloadClassificationFromVendorCommunity(val.id).subscribe((res: any) => {
      if (res.result.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      } else {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', val.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.btnLoading = false;
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      }
      val.loading = false;
    }, error => {
      this.btnLoading = false;
      val.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to set selected type list
   */

  setPreferredPaymentType(accPaymentTypes: any) {
    if (accPaymentTypes) {
      this.selectedPaymentTypes.data = this.allPaymentTypeList.data.filter(item => accPaymentTypes?.includes(item.id));
    }
    this.validatePostalAddress(accPaymentTypes);
  }

  /**
   * This method can be used to validate postal address according to the check payment
   */
  validatePostalAddress(accPaymentTypes) {
    this.isSelectedPaymentTypeAsCheckAndVirtualCard = !!(
      accPaymentTypes &&
      (accPaymentTypes.includes(2) || accPaymentTypes.includes(3))
    );
  }
}


