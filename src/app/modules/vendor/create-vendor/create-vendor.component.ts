import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {VendorHomeComponent} from '../vendor-home/vendor-home.component';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {VendorMasterDto} from '../../../shared/dto/vendor/vendor-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {OverlayPanel} from 'primeng/overlaypanel';
import {VendorSuggestionDto} from '../../../shared/dto/vendor/vendor-suggestion-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {ConfirmationService, MessageService} from 'primeng/api';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {CommonMessage} from '../../../shared/utility/common-message';
import {VendorAdditionalFieldAttachments} from '../../../shared/dto/vendor/vendor-additional-field-attachments';
import {AppFeatureId} from '../../../shared/enums/app-feature-id';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {Subscription} from 'rxjs';
import {PaymentTypeService} from '../../../shared/services/support/payment-type.service';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';

@Component({
  selector: 'app-create-vendor',
  templateUrl: './create-vendor.component.html',
  styleUrls: ['./create-vendor.component.scss']
})
export class CreateVendorComponent implements OnInit, OnDestroy {

  public vendorCreateForm: FormGroup;
  public vendorDto: VendorMasterDto = new VendorMasterDto();
  public additionalData: AdditionalFieldDetailDto[];
  public additionalDataBasicInfo: AdditionalFieldDetailDto[] = [];
  public additionalDataPaymentInfo: AdditionalFieldDetailDto[] = [];
  public additionalDataPostalAddress: AdditionalFieldDetailDto[] = [];
  public additionalDataRemitAddress: AdditionalFieldDetailDto[] = [];
  public additionalDataW9Info: AdditionalFieldDetailDto[] = [];
  public selectedAdditionalField: AdditionalFieldDetailDto = new AdditionalFieldDetailDto();
  public vendorAdditionalFieldAttachment: VendorAdditionalFieldAttachments [] = [];
  public appFieldType = AppFieldType;
  public paymentTypes: DropdownDto = new DropdownDto();
  public recipientType: DropdownDto = new DropdownDto();
  public accountType: DropdownDto = new DropdownDto();
  public classification: DropdownDto = new DropdownDto();
  public vendorsGroupList: DropdownDto = new DropdownDto();
  public allPaymentTypeList: DropdownDto = new DropdownDto();
  public selectedPaymentTypes: DropdownDto = new DropdownDto();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public appConstant = new AppConstant();
  public featureIdEnum = AppFeatureId;
  public commonUtil = new CommonUtility();
  public addNewDropDown = false;
  public isCreate = false;
  public isSendInvitation = false;
  public isUpdateVendor = false;

  @Input('vendorRequestDto') vendorRequestDto: VendorMasterDto = new VendorMasterDto();
  @ViewChild('createVendorComponent') createVendorComponent: CreateVendorComponent;
  @ViewChild('w9Form') w9Form: ElementRef;
  @ViewChild('vendorOverlay') vendorOverlay: OverlayPanel;
  @Input() isVendorEdit: boolean;
  @ViewChild('vendorNameInput') public vendorNameInput: ElementRef;
  public document = document;


  public postalAddress = false;
  public showAddress = false;
  public showRemitEmail = false;
  public w9Information = true;
  public showPaymentInformation = false;
  public countries = [];
  public states = [];
  public cities = [];
  public taxClassifications = [];
  public vendorName;
  public viewShowMoreContent = true;

  public suggestions: VendorSuggestionDto[] = [];
  public vendorDetail = false;
  public vendorId;

  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public isEmailAvailable = false;
  public isVendorCodeAvailable = false;
  public isVendorSsnAvailable = false;
  public isVendorEmpNoAvailable = false;
  public isConfidential = false;
  public createVendorGroup = false;

  public filteredGroups: any[];
  public communityVendorId: any;


  public isVendorSelectedFromSuggestions = false;
  public isSocialNoDisabled = false;
  public isEmployeeIdDisabled = false;
  public isSocialEmailDisabled = false;
  multiSelectValues: any;
  public appAuthorities = AppAuthorities;
  public termList: DropdownDto = new DropdownDto();
  public appFormConstants = AppFormConstants;
  public subscription: Subscription = new Subscription();
  public isSelectedPaymentTypeAsCheckAndVirtualCard = false;


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService, public vendorHome: VendorHomeComponent,
              public vendorService: VendorService, public messageService: MessageService, public confirmationService: ConfirmationService,
              public additionalFieldService: AdditionalFieldService, public privilegeService: PrivilegeService,
              public billsService: BillsService, public paymentTypeService: PaymentTypeService) {
    this.postalAddress = false;
    this.w9Information = false;

    this.vendorCreateForm = this.formBuilder.group({
      id: [null],
      vendorCode: [null, Validators.compose([Validators.maxLength(50)])],
      name: [null, Validators.compose([Validators.required, Validators.maxLength(150)])],
      companyName: [null, Validators.compose([Validators.maxLength(150)])],
      paymentOptionId: [null],
      accountRoutingNumber: [null],
      accountNumber: [null],
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
      vendorGroupIdList: [null],
      r_address_line_1: [null],
      r_address_line_2: [null],
      r_country: [null],
      r_zipcode: [null, Validators.compose([Validators.maxLength(30)])],
      r_city: [null],
      r_state: [null],
      w9Form: [null],
      w9FormName: [null],
      tenNinetyNine: [null],
      netDaysDue: [null],
      term: [null],
      discountDaysDue: [null],
      discountPercentage: [null],
      businessName: [null],
      socialSecNo: [null],
      empIdNo: [null],
      classificationIdList: [null],
      diverseSupplier: [false],
      classificationAttachmentList: [null],
      classificationAttachmentListNames: [null],
      exemptPayeeCode: [null, Validators.compose([Validators.maxLength(40)])],
      fatcaReportingCode: [null, Validators.compose([Validators.maxLength(40)])],
      taxClassification: [null],
      additionalDataBasicInfo: this.formBuilder.array([]),
      additionalDataPostalAddress: this.formBuilder.array([]),
      additionalDataRemitAddress: this.formBuilder.array([]),
      additionalDataW9Info: this.formBuilder.array([]),
      additionalDataPaymentInfo: this.formBuilder.array([]),
      attachment: [],
      w9AttachmentId: [],
      showRemit: [false],
      recipientType: [],
      accountType: [],
      acceptedPaymentTypes: [],
      preferredPaymentTypeId: [null],
      remittanceEmail: [null],
      remitEmailSwitchEnable: [false],
    });

    this.vendorCreateForm.get('diverseSupplier').valueChanges.subscribe(value => {
      if (this.vendorCreateForm.get('diverseSupplier').value) {
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

    this.vendorCreateForm.get('showRemit').valueChanges.subscribe(value => {
      if (this.vendorCreateForm.get('showRemit').value) {
        this.vendorCreateForm.get('r_country').setValidators([Validators.required]);
      } else {
        this.vendorCreateForm.get('r_country').clearValidators();
        this.vendorCreateForm.get('r_country').reset();
      }
      this.vendorCreateForm.get('r_country').updateValueAndValidity();
    });


    if (vendorHome.isOpenEditPage) {
      this.viewShowMoreContent = false;
      this.w9Information = true;
    }
    this.getPaymentType(this.paymentTypes);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.getModuleReheatedAdditionalField(AppDocumentType.VENDOR, false);
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

    this.subscription = this.vendorService.groupSubject.subscribe(
      (val: any) => {
        this.getVendorGroups();
      },
    );

    this.accountType.data = AppConstant.PAYMENT_ACCOUNT_TYPES;
    this.recipientType.data = AppConstant.PAYMENT_RECIPIENT_TYPES;

    let json: any;
    json = JSON.parse(sessionStorage.getItem('vendorState'));
    if (!this.vendorHome.vendorIdToEdit && json != null) {
      this.vendorHome.vendorName = json.vendorName;
    }
    this.getClassificationList(this.classification);
    this.getVendorGroups();
    this.isEnabledConfidentialFeatureForVendor();
    this.getPaymentTerms();
    this.getPaymentDropDownList();
    this.focusFirstElementAfterTabChange();
  }

  getPaymentTerms() {
    this.billsService.getTermsList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.termList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  onSubmit(actionToDo) {
    this.setVendorDataToDto();
    this.vendorDto.contactNumber = this.commonUtil.getTelNo(this.vendorCreateForm, 'contactNumber');
    if (this.vendorHome.vendorIdToEdit) {
      this.validateFileInput(this.vendorCreateForm.get('additionalDataBasicInfo'), this.vendorAdditionalFieldAttachment);
      this.validateFileInput(this.vendorCreateForm.get('additionalDataPostalAddress'), this.vendorAdditionalFieldAttachment);
      this.validateFileInput(this.vendorCreateForm.get('additionalDataRemitAddress'), this.vendorAdditionalFieldAttachment);
      this.validateFileInput(this.vendorCreateForm.get('additionalDataW9Info'), this.vendorAdditionalFieldAttachment);
      this.validateFileInput(this.vendorCreateForm.get('additionalDataPaymentInfo'), this.vendorAdditionalFieldAttachment);
    }

    if (this.vendorCreateForm.valid && !this.isVendorCodeAvailable && !this.isEmailAvailable
      && !this.isVendorEmpNoAvailable && !this.isVendorSsnAvailable) {

      if (!this.vendorDto.diverseSupplier) {
        this.vendorDto.classificationIdList = [];
        this.vendorDto.classificationAttachmentList = null;
      }

      if (actionToDo === 'C') {
        this.vendorDto.id = null;
        this.createVendor(false, actionToDo);
      }

      if (actionToDo === 'CS') {
        this.vendorDto.id = null;
        this.createVendor(true, actionToDo);
      }

      if (actionToDo === 'U') {
        this.updateVendor(actionToDo);
      }

    } else {
      new CommonUtility().validateForm(this.vendorCreateForm);
    }
  }

  createVendor(isSendInvitation, actionToDo) {
    this.isCreate = actionToDo === 'C';
    this.isSendInvitation = actionToDo === 'CS';
    this.vendorService.createVendor(this.vendorDto, isSendInvitation).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
          this.vendorHome.refreshVendorList();
          this.resetVendorCreateForm();
          this.isSocialNoDisabled = false;
          this.isEmployeeIdDisabled = false;
          this.isVendorSelectedFromSuggestions = false;
          this.notificationService.successMessage(HttpResponseMessage.VENDOR_CREATED_SUCCESSFULLY);
          this.vendorDto.confidential = false;
          this.isCreate = false;
          this.isSendInvitation = false;
          this.isUpdateVendor = false;
        } else {
          this.isCreate = false;
          this.isSendInvitation = false;
          this.isUpdateVendor = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.isCreate = false;
        this.isSendInvitation = false;
        this.isUpdateVendor = false;
        this.notificationService.errorMessage(error);
      })
    );
  }

  updateVendor(actionToDo) {
    this.isUpdateVendor = actionToDo === 'U';
    this.vendorService.updateVendor(this.vendorDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.vendorHome.refreshVendorList(null, true);
          this.vendorHome.isOpenEditPage = false;
          this.notificationService.successMessage(HttpResponseMessage.VENDOR_UPDATED_SUCCESSFULLY);
          this.isUpdateVendor = false;
        } else {
          this.isUpdateVendor = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.isUpdateVendor = false;
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   *this method can be used to format data as string
   */
  formatMultisetValue() {
    this.vendorDto.additionalDataBasicInfo.forEach(value => {
      if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple === AppConstant.STATUS_ACTIVE && value.fieldValue !== null) {
        value.fieldValue = value.fieldValue.toString();
      }
    });
    this.vendorDto.additionalDataPostalAddress.forEach(value => {
      if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple === AppConstant.STATUS_ACTIVE && value.fieldValue !== null) {
        value.fieldValue = value.fieldValue.toString();
      }
    });
    this.vendorDto.additionalDataRemitAddress.forEach(value => {
      if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple === AppConstant.STATUS_ACTIVE && value.fieldValue !== null) {
        value.fieldValue = value.fieldValue.toString();
      }
    });
    this.vendorDto.additionalDataW9Info.forEach(value => {
      if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple === AppConstant.STATUS_ACTIVE && value.fieldValue !== null) {
        value.fieldValue = value.fieldValue.toString();
      }
    });
    this.vendorDto.additionalDataPaymentInfo.forEach(value => {
      if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple === AppConstant.STATUS_ACTIVE && value.fieldValue !== null) {
        value.fieldValue = value.fieldValue.toString();
      }
    });
  }

  /**
   * This method can be used to get vendor data
   */
  getVendorData(id) {
    this.vendorService.getVendor(id, false).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.patchVendorData(res.body);
        this.vendorAdditionalFieldAttachment = [];

        if (res.body.additionalFieldAttachments.length > 0) {
          res.body.additionalFieldAttachments.forEach((value) => {
            this.vendorAdditionalFieldAttachment.push(value);
          });
        }
        if (res.body.classificationAttachment.length > 0) {
          res.body.classificationAttachment.forEach((value) => {
            const vpAttachment = new VendorAdditionalFieldAttachments();
            vpAttachment.id = value.id;
            vpAttachment.fileName = value.fileName;
            vpAttachment.fieldName = this.appConstant.CLASSIFICATION_FIELD_NAME;
            this.vendorAdditionalFieldAttachment.push(vpAttachment);
          });
        }
        if (res.body.w9Attachment) {
          res.body.w9Attachment.forEach((value) => {
            const vpAttachment = new VendorAdditionalFieldAttachments();
            vpAttachment.id = value.id;
            vpAttachment.fileName = value.fileName;
            vpAttachment.fieldName = this.appConstant.VENDOR_W9_FORM_STRING_NAME;
            this.vendorAdditionalFieldAttachment.push(vpAttachment);
          });
        }

        if (res.body.remitAddress) {
          this.vendorCreateForm.get('showRemit').patchValue(true);
        }
        if (res.body.remittanceEmail) {
          this.vendorCreateForm.get('remitEmailSwitchEnable').patchValue(true);
        }
        this.vendorDto.confidential = res.body.confidential;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Set response to form for map data
   * @param responseBody to response body
   */
  patchVendorData(responseBody) {
    this.showPaymentInformation = responseBody.showPaymentInformation;
    this.commonUtil.onAcceptedPaymentTypesChange(responseBody.acceptedPaymentTypes);
    this.isEmployeeIdDisabled = this.isVendorSelectedFromSuggestions === true && responseBody.empIdNo !== null
      && responseBody.empIdNo !== AppConstant.EMPTY_STRING && responseBody.empIdNo !== undefined;
    this.isSocialNoDisabled = this.isVendorSelectedFromSuggestions === true && responseBody.socialSecNo !== null
      && responseBody.socialSecNo !== AppConstant.EMPTY_STRING && responseBody.socialSecNo !== undefined;
    this.isSocialEmailDisabled = this.isVendorSelectedFromSuggestions === true && responseBody.email !== null
      && responseBody.email !== AppConstant.EMPTY_STRING;

    if (responseBody.permenantAddress) {
      this.vendorCreateForm.get('address_line_1').patchValue(responseBody.permenantAddress.addressLine1);
      this.vendorCreateForm.get('address_line_2').patchValue(responseBody.permenantAddress.addressLine2);
      this.vendorCreateForm.get('country').patchValue(responseBody.permenantAddress.country);
      this.vendorCreateForm.get('zipcode').patchValue(responseBody.permenantAddress.zipcode);
      this.vendorCreateForm.get('city').patchValue(responseBody.permenantAddress.city);
      this.vendorCreateForm.get('state').patchValue(responseBody.permenantAddress.addressState);
    }
    if (responseBody.remitAddress) {
      this.vendorCreateForm.get('r_address_line_1').patchValue(responseBody.remitAddress.addressLine1);
      this.vendorCreateForm.get('r_address_line_2').patchValue(responseBody.remitAddress.addressLine2);
      this.vendorCreateForm.get('r_country').patchValue(responseBody.remitAddress.country);
      this.vendorCreateForm.get('r_zipcode').patchValue(responseBody.remitAddress.zipcode);
      this.vendorCreateForm.get('r_city').patchValue(responseBody.remitAddress.city);
      this.vendorCreateForm.get('r_state').patchValue(responseBody.remitAddress.addressState);
    }
    responseBody.additionalDataBasicInfo = this.commonUtil.patchDropDownAdditionalData(responseBody.additionalDataBasicInfo);
    responseBody.additionalDataPostalAddress = this.commonUtil.patchDropDownAdditionalData(responseBody.additionalDataPostalAddress);
    responseBody.additionalDataPaymentInfo = this.commonUtil.patchDropDownAdditionalData(responseBody.additionalDataPaymentInfo);
    responseBody.additionalDataW9Info = this.commonUtil.patchDropDownAdditionalData(responseBody.additionalDataW9Info);
    responseBody.additionalDataRemitAddress = this.commonUtil.patchDropDownAdditionalData(responseBody.additionalDataRemitAddress);

    responseBody.additionalDataBasicInfo = this.commonUtil.alignHeadingAdditionalData(this.additionalDataBasicInfo, responseBody.additionalDataBasicInfo);
    responseBody.additionalDataPostalAddress = this.commonUtil.alignHeadingAdditionalData(this.additionalDataPostalAddress, responseBody.additionalDataPostalAddress);
    responseBody.additionalDataPaymentInfo = this.commonUtil.alignHeadingAdditionalData(this.additionalDataPaymentInfo, responseBody.additionalDataPaymentInfo);
    responseBody.additionalDataW9Info = this.commonUtil.alignHeadingAdditionalData(this.additionalDataW9Info, responseBody.additionalDataW9Info);
    responseBody.additionalDataRemitAddress = this.commonUtil.alignHeadingAdditionalData(this.additionalDataRemitAddress, responseBody.additionalDataRemitAddress);
    this.setPreferredPaymentType(responseBody?.acceptedPaymentTypes);
    this.vendorCreateForm.patchValue(responseBody);
    this.commonUtil.isValidPaymentInfo(this.vendorCreateForm);
  }

  /**
   * Set form data to dto
   */
  setVendorDataToDto() {
    this.vendorDto.id = this.vendorCreateForm.get('id').value;
    this.vendorDto.vendorCode = this.vendorCreateForm.get('vendorCode').value;
    this.vendorDto.name = this.vendorCreateForm.get('name').value;
    this.vendorDto.contactPerson = this.vendorCreateForm.get('contactPerson').value;
    this.vendorDto.contactNumber = this.vendorCreateForm.get('contactNumber').value;
    this.vendorDto.fax = this.vendorCreateForm.get('fax').value;
    this.vendorDto.email = this.vendorCreateForm.get('email').value;
    this.vendorDto.ccEmail = this.vendorCreateForm.get('ccEmail').value;
    this.vendorDto.w9Form = this.vendorCreateForm.get('w9Form').value;
    this.vendorDto.socialSecNo = this.vendorCreateForm.get('socialSecNo').value;
    this.vendorDto.empIdNo = this.vendorCreateForm.get('empIdNo').value;
    this.vendorDto.paymentOptionId = this.vendorCreateForm.get('paymentOptionId').value;
    this.vendorDto.exemptPayeeCode = this.vendorCreateForm.get('exemptPayeeCode').value;
    this.vendorDto.fatcaReportingCode = this.vendorCreateForm.get('fatcaReportingCode').value;
    this.vendorDto.taxClassification = this.vendorCreateForm.get('taxClassification').value;
    this.vendorDto.tenNinetyNine = this.vendorCreateForm.get('tenNinetyNine').value;
    this.vendorDto.showRemit = this.vendorCreateForm.get('showRemit').value;
    this.vendorDto.remitEmailSwitchEnable = this.vendorCreateForm.get('remitEmailSwitchEnable').value;

    this.vendorDto.vendorGroupIdList = this.vendorCreateForm.get('vendorGroupIdList').value;
    this.vendorDto.term = this.vendorCreateForm.get('term').value;
    this.vendorDto.netDaysDue = this.vendorCreateForm.get('netDaysDue').value;
    this.vendorDto.discountPercentage = this.vendorCreateForm.get('discountPercentage').value;

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
    this.vendorDto.additionalDataBasicInfo = this.vendorCreateForm.get('additionalDataBasicInfo').value;
    this.vendorDto.additionalDataPostalAddress = this.vendorCreateForm.get('additionalDataPostalAddress').value;
    this.vendorDto.additionalDataRemitAddress = this.vendorCreateForm.get('additionalDataRemitAddress').value;
    this.vendorDto.additionalDataW9Info = this.vendorCreateForm.get('additionalDataW9Info').value;
    this.vendorDto.additionalDataPaymentInfo = this.vendorCreateForm.get('additionalDataPaymentInfo').value;
    this.vendorDto.additionalFieldAttachments = this.vendorCreateForm.get('attachment').value;
    this.vendorDto.acceptedPaymentTypes = this.vendorCreateForm.get('acceptedPaymentTypes').value;
    this.vendorDto.preferredPaymentTypeId = this.vendorCreateForm.get('preferredPaymentTypeId').value;


    this.formatMultisetValue();

  }

  /**
   * patch classification attachments list
   */
  classificationUpload(event: any, file) {
    if (event.target.files[0]) {
      const targetFile = [];
      if (event.target.files.length > 10) {
        this.notificationService.infoMessage(HttpResponseMessage.VENDOR_CLASSIFICATION_ATTACHMENT_SIZE_EXCEED);
        file.value = null;
        this.vendorCreateForm.get('classificationAttachmentList').reset();
        return;
      }
      let size = 0;
      for (const index in event.target.files) {
        size = size + event.target.files[index].size;
        if ((size / 1024 / 1024) > 25) {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_SIZE_EXCEED);
          file.value = null;
          this.vendorCreateForm.get('classificationAttachmentList').reset();
          return;
        }
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
   * patch w9 form
   */
  fileUpload1(event: any) {
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      this.vendorCreateForm.patchValue({
        w9Form: targetFile
      });
    } else {
      this.vendorCreateForm.get('w9Form').patchValue(null);
    }
  }

  clearW9Attachment() {
    this.vendorCreateForm.get('w9Form').patchValue(null);
  }


  /**
   * This method can be used to reset vendor creation page
   */
  resetVendorCreateForm() {
    if (this.vendorHome.isOpenEditPage) {
      this.additionalData = [];
      this.vendorAdditionalFieldAttachment = [];
      this.vendorAdditionalDataArrayInBasicInformation.controls = [];
      this.vendorAdditionalDataArrayInPostalAddress.controls = [];
      this.vendorAdditionalDataArrayInRemitAddress.controls = [];
      this.vendorAdditionalDataArrayInW9Form.controls = [];
      this.vendorAdditionalDataArrayInPaymentInformation.controls = [];
      this.getModuleReheatedAdditionalField(AppDocumentType.VENDOR, false);
      this.vendorCreateForm.reset();
      this.getVendorData(this.vendorHome.vendorIdToEdit);
      this.isVendorEmpNoAvailable = false;
      this.isSocialEmailDisabled = false;
      this.isVendorSsnAvailable = false;
      this.isVendorCodeAvailable = false;
      this.isEmailAvailable = false;
    } else {
      this.additionalData = [];
      this.vendorAdditionalDataArrayInBasicInformation.controls = [];
      this.vendorAdditionalDataArrayInPostalAddress.controls = [];
      this.vendorAdditionalDataArrayInRemitAddress.controls = [];
      this.vendorAdditionalDataArrayInW9Form.controls = [];
      this.vendorAdditionalDataArrayInPaymentInformation.controls = [];
      this.getModuleReheatedAdditionalField(AppDocumentType.VENDOR, false);
      this.isEmployeeIdDisabled = false;
      this.isSocialEmailDisabled = false;
      this.isSocialEmailDisabled = false;
      this.isSocialNoDisabled = false;
      this.isVendorEmpNoAvailable = false;
      this.isVendorSsnAvailable = false;
      this.isVendorCodeAvailable = false;
      this.isEmailAvailable = false;
      this.isVendorSelectedFromSuggestions = false;


      this.vendorCreateForm.reset();
    }
    this.vendorCreateForm.get('country').patchValue(AppEnumConstants.DEFAULT_COUNTRY);
    this.vendorCreateForm.get('diverseSupplier').patchValue(false);
  }

  /**
   * Open Vendor Overlay on keyup
   */
  toggleOverlay(keyboardEvent, actualTarget: HTMLDivElement) {
    if (this.vendorCreateForm.get('name').dirty && this.vendorCreateForm.get('name').value.length >= 2) {
      this.vendorService.getVendorSuggestions(this.vendorCreateForm.get('name').value).subscribe((res) => {
        this.suggestions = res.body;
        if (this.suggestions.length > 0) {
          this.vendorOverlay.show(keyboardEvent, actualTarget);
        } else {
          this.vendorOverlay.hide();
        }
      });
    } else {
      this.vendorOverlay.hide();
    }
  }

  /**
   * View Detail Of vendor on create
   * @param id id
   */
  detailView(id: any) {
    this.vendorOverlay.hide();
    this.vendorId = id;
    this.vendorDetail = true;
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
    if (emailLetters !== null && emailLetters !== AppConstant.EMPTY_STRING) {
      this.vendorService.checkEmailAvailability(emailLetters, this.vendorCreateForm.get('id').value).subscribe((res: any) => {
          this.isEmailAvailable = res.body;
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * Check vendor code availability
   */
  checkVendorCodeAvailability() {
    const vendorCode = this.vendorCreateForm.get('vendorCode').value;
    if (vendorCode !== null && vendorCode !== AppConstant.EMPTY_STRING) {
      this.vendorService.checkVendorCodeAvailability(vendorCode, this.vendorCreateForm.get('id').value).subscribe((res: any) => {
          this.isVendorCodeAvailable = res.body;
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
    if (socialSecNo !== null && socialSecNo !== AppConstant.EMPTY_STRING) {
      this.vendorService.checkSsnAvailability(socialSecNo, this.vendorCreateForm.get('id').value).subscribe((res: any) => {
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
      this.vendorService.checkEmployeeNoAvailability(empIdNo, this.vendorCreateForm.get('id').value).subscribe((res: any) => {
          this.isVendorEmpNoAvailable = res.body;
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * Vendor Selected from Vendor Suggestions list
   */
  vendorClickedFromList(vendor: VendorSuggestionDto) {
    this.isVendorSelectedFromSuggestions = true;
    this.communityVendorId = vendor.id;
    this.showAddress = true;
    this.w9Information = true;
    this.vendorCreateForm.reset();
    this.vendorOverlay.hide();

    this.vendorService.getVendorsFromCommunity(vendor.id).then((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorCreateForm.patchValue(res.body);
        this.patchVendorData(res.body);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * Vendor Selected from Vendor List and added to company list
   */
  addVendorToCompanyFromList() {
    if (this.vendorCreateForm.valid) {
      this.setVendorDataToDto();
      this.vendorDto.contactNumber = this.commonUtil.getTelNo(this.vendorCreateForm, 'contactNumber');
      this.vendorService.addVendorFromCommunity(this.communityVendorId, this.vendorDto).subscribe((res: any) => {
          if (AppResponseStatus.STATUS_SUCCESS === res.status) {
            this.vendorHome.refreshVendorList();
            this.communityVendorId = null;
            this.resetVendorCreateForm();
            this.isSocialNoDisabled = false;
            this.isEmployeeIdDisabled = false;
            this.isVendorSelectedFromSuggestions = false;
            this.notificationService.successMessage(HttpResponseMessage.VENDOR_ADDED_TO_LOCAL_SUCCESSFULLY);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, (error => {
          this.notificationService.errorMessage(error);
        })
      );
    } else {
      new CommonUtility().validateForm(this.vendorCreateForm);
    }
  }

  /**
   * This method use for add additional fields to po creation
   */
  getModuleReheatedAdditionalField(id, isDetailView) {
    this.additionalFieldService.getAdditionalField(id, isDetailView, !this.isVendorEdit).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.additionalData = res.body;
        this.vendorNameInput.nativeElement.focus();
        this.additionalData.forEach(((field) => {
          this.commonUtil.manageDropDownData(field, isDetailView);
          if (field.sectionId === AppModuleSection.VENDOR_BASIC_INFO_SECTION && field.status !== AppConstant.STATUS_DELETE) {
            this.addAdditionalDataForBasicInfo(field);
          }
          if (field.sectionId === AppModuleSection.POSTAL_ADDRESS_SECTION && field.status !== AppConstant.STATUS_DELETE) {
            this.addAdditionalDataForPostalAddress(field);
          }
          if (field.sectionId === AppModuleSection.REMIT_ADDRESS_SECTION && field.status !== AppConstant.STATUS_DELETE) {
            this.addAdditionalDataForRemitAddress(field);
          }
          if (field.sectionId === AppModuleSection.W9_INFO_SECTION && field.status !== AppConstant.STATUS_DELETE) {
            this.addAdditionalDataForW9Info(field);
          }
          if (field.sectionId === AppModuleSection.VENDOR_PAYMENT_INFO_SECTION && field.status !== AppConstant.STATUS_DELETE) {
            this.addAdditionalDataForPaymentInfo(field);
          }
        }));
        if (this.isVendorEdit) {
          this.getVendorData(this.vendorHome.vendorIdToEdit);
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }

    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * add fields to basic info section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForBasicInfo(field: AdditionalFieldDetailDto) {
    this.additionalDataBasicInfo.push(field);
    this.vendorAdditionalDataArrayInBasicInformation.push(this.commonUtil.getAdditionalFieldValidations(field, !this.detailView));
  }

  /**
   * add fields to postal address section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForPostalAddress(field: AdditionalFieldDetailDto) {
    this.additionalDataPostalAddress.push(field);
    this.vendorAdditionalDataArrayInPostalAddress.push(this.commonUtil.getAdditionalFieldValidations(field, !this.detailView));
  }

  /**
   * add fields for remit address section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForRemitAddress(field: AdditionalFieldDetailDto) {
    this.additionalDataRemitAddress.push(field);
    this.vendorAdditionalDataArrayInRemitAddress.push(this.commonUtil.getAdditionalFieldValidations(field, !this.detailView));
  }

  /**
   * add fields for w9 section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForW9Info(field: AdditionalFieldDetailDto) {
    this.additionalDataW9Info.push(field);
    this.vendorAdditionalDataArrayInW9Form.push(this.commonUtil.getAdditionalFieldValidations(field, !this.detailView));
  }

  /**
   * add fields for payment section
   * @param field AdditionalFieldDetailDto
   */
  public addAdditionalDataForPaymentInfo(field: AdditionalFieldDetailDto) {
    this.additionalDataPaymentInfo.push(field);
    this.vendorAdditionalDataArrayInPaymentInformation.push(this.commonUtil.getAdditionalFieldValidations(field, !this.detailView));
  }


  /**
   * this method can be used to manage dropdown data
   * @param field to section object
   */


  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInBasicInformation() {
    return this.vendorCreateForm.get(AppConstant.VENDOR_BASIC_INFO) as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInPostalAddress() {
    return this.vendorCreateForm.get(AppConstant.VENDOR_POSTAL_ADDRESS) as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInPaymentInformation() {
    return this.vendorCreateForm.get(AppConstant.VENDOR_PAYMENT_INFO) as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInRemitAddress() {
    return this.vendorCreateForm.get(AppConstant.VENDOR_REMIT_ADDRESS) as UntypedFormArray;
  }

  /**
   * return form array data
   */
  public get vendorAdditionalDataArrayInW9Form() {
    return this.vendorCreateForm.get(AppConstant.VENDOR_W9_INFO) as UntypedFormArray;
  }


  /**
   * this method can be used to get file name
   * @param fileUpload string
   * @param i
   */
  fileUploadClick(fileUpload, i: number) {
    document.getElementById(fileUpload + i).click();
  }

  /**
   * this method can be used to format date
   * @param event to change event
   * @param index io index number
   * @param sectionName to section name
   */
  formatDate(event, index, sectionName) {
    switch (sectionName) {
      case AppConstant.SECTION_BASIC:
        this.vendorAdditionalDataArrayInBasicInformation.controls[index].get(AppConstant.FIELD_VALUE).patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
        break;
      case AppConstant.SECTION_POSTAL_ADDRESS:
        this.vendorAdditionalDataArrayInPostalAddress.controls[index].get(AppConstant.FIELD_VALUE).patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
        break;
      case AppConstant.SECTION_REMIT_ADDRESS:
        this.vendorAdditionalDataArrayInRemitAddress.controls[index].get(AppConstant.FIELD_VALUE).patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
        break;
      case AppConstant.SECTION_W9_INFO:
        this.vendorAdditionalDataArrayInW9Form.controls[index].get(AppConstant.FIELD_VALUE).patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
        break;
      case AppConstant.SECTION_PAYMENT_INFO:
        this.vendorAdditionalDataArrayInPaymentInformation.controls[index].get(AppConstant.FIELD_VALUE).patchValue(event.toLocaleDateString());
        break;
    }

  }

  /**
   * This method use for choose file for upload
   * @param event any
   * @param additionalField to index array instance
   * @param indexNumber to index number
   * @param fileTypes to file types
   */
  changeFileInput(event: any, additionalField, indexNumber, fileTypes) {
    additionalField.get(AppConstant.ATTACHMENT).reset();
    let isAllowedToUpload = false;
    if (!event.target.files[0]) {
      return;
    } else {
      const changeFileTypes: string [] = event.target.files[0].type.split(AppConstant.FORWARD_SLASH_STRING);
      const fileTypesArray: string [] = fileTypes.split(AppConstant.COMMA_STRING);

      for (let i = 0; i < fileTypesArray.length; i++) {
        const slittedSlash = fileTypesArray[i].split(AppConstant.FORWARD_SLASH_STRING);
        if (fileTypesArray[i] === event.target.files[0].type) {
          isAllowedToUpload = true;
          break;
        } else if (slittedSlash[0] === changeFileTypes[0]) {
          if (slittedSlash[1] === AppConstant.STAR_STRING) {
            isAllowedToUpload = true;
            break;
          }
        }
      }

      if (isAllowedToUpload) {
        const targetFile = event.target.files[0];
        additionalField.patchValue({
          attachment: targetFile
        });

        if ((event.target.files[0].size / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
          setTimeout(() => {
            additionalField.get(AppConstant.ATTACHMENT).reset();
          }, 100);
          return this.notificationService.infoMessage(CommonMessage.INVALID_FILE_SIZE);
        }
      } else {
        setTimeout(() => {
          additionalField.get(AppConstant.ATTACHMENT).reset();
        }, 100);
        return this.notificationService.infoMessage(CommonMessage.ADDITIONAL_FIELD_INVALID_FILE_TYPE);
      }
    }
  }

  /**
   * This method use for view additional option input drawer
   * @param event to change event
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   * @param additionalField to AdditionalFieldDetailDto
   * @param multiSelect to multiSelect dropdown
   */
  addNewAdditionalDropDownOption(event: any, additionalFieldDetailDto: AdditionalFieldDetailDto, additionalField: AbstractControl,
                                 multiSelect) {
    if (event.itemValue === 0 || event.value === 0) {
      additionalField.get(AppConstant.FIELD_VALUE).reset();
      this.addNewDropDown = true;
      this.selectedAdditionalField = additionalFieldDetailDto;
    }
    if (multiSelect._options.length === AppConstant.ONE && additionalFieldDetailDto.createNew ===
      AppConstant.STATUS_ACTIVE && additionalFieldDetailDto.multiple ===
      AppConstant.STATUS_ACTIVE) {
      additionalField.get(AppConstant.FIELD_VALUE).reset();
      this.addNewDropDown = true;
      this.selectedAdditionalField = additionalFieldDetailDto;
    }
    if (multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        value.isChecked = true;
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = true;
        }
      });
    } else {
      const allChecked: boolean = multiSelect._options.every(function(item: any) {
        return item.isChecked == false;
      });

      if (allChecked) {
        multiSelect._options.forEach((value) => {
          if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
            value.disabled = false;
          }
        });
      } else {
        multiSelect._options.forEach((value) => {
          if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
            value.disabled = true;
          }
        });
      }
    }
    if (additionalFieldDetailDto.createNew === AppConstant.STATUS_ACTIVE && additionalFieldDetailDto.multiple ===
      AppConstant.STATUS_ACTIVE && multiSelect.allChecked) {

      let idArray: number [] = [];
      idArray = additionalField.get(AppConstant.FIELD_VALUE).value;
      idArray.forEach((value, index) => {
        if (idArray[0] === 0) {
          idArray.splice(index, 1);
        }
      });

      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = true;
        }
      });
    } else if (!multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = false;
        }
      });
    }
  }

  /**
   * This method use for close additional dropdown option create drawer
   */
  closeAdditionalDropdownCreateDrawer() {
    this.addNewDropDown = false;
    this.updateAdditionalFieldDropDowns();
  }

  /**
   * this method return true or false
   * @param multiSelectDropDownRef to dropdown reference
   * @param additionalFieldObject to additional field object
   */
  isAllowedToTriggerClickEvent(multiSelectDropDownRef, additionalFieldObject: AdditionalFieldDetailDto): boolean {
    return !(multiSelectDropDownRef._options.length === AppConstant.ONE &&
      additionalFieldObject.multiple === AppConstant.STATUS_ACTIVE &&
      additionalFieldObject.createNew === AppConstant.STATUS_ACTIVE);
  }


  /*
  ---------------------------------------------------ADDITIONAL ATTACHMENT SECTION-------------------------------------------------------->
   */
  downloadAttachments(val) {
    document.getElementById(AppConstant.DOWNLOAD_ATTACHMENT_ID).style.pointerEvents = AppConstant.POINTER_EVENT_NONE;
    this.vendorService.downloadAdditionalAttachment(val.id).subscribe((res: any) => {
      if (res.result.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        document.getElementById(AppConstant.DOWNLOAD_ATTACHMENT_ID).style.pointerEvents = AppConstant.POINTER_EVENT_AUTO;
        this.notificationService.infoMessage(res.body.message);
      } else {
        console.log('start download:', res);
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', val.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        document.getElementById(AppConstant.DOWNLOAD_ATTACHMENT_ID).style.pointerEvents = AppConstant.POINTER_EVENT_AUTO;
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      }
      val.loading = false;
    }, error => {
      val.loading = false;
      document.getElementById(AppConstant.DOWNLOAD_ATTACHMENT_ID).style.pointerEvents = AppConstant.POINTER_EVENT_AUTO;
      this.notificationService.errorMessage(error);
    });
  }

  deleteAdditionalAttachments(val: any, index: any) {
    document.getElementById(AppConstant.DELETE_ATTACHMENT_ID).style.pointerEvents = AppConstant.POINTER_EVENT_NONE;
    this.confirmationService.confirm({
      key: AppConstant.VENDOR_ATTACHMENT_DELETE_KEY,
      message: 'You want to delete this Attachment!',
      accept: () => {
        this.vendorService.deleteAdditionalAttachment(val.id).subscribe((res: any) => {
          if (res.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            document.getElementById(AppConstant.DELETE_ATTACHMENT_ID).style.pointerEvents = AppConstant.POINTER_EVENT_AUTO;
            this.notificationService.infoMessage(res.body.message);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.ATTACHMENT_DELETED_SUCCESSFULLY);
            document.getElementById(AppConstant.DELETE_ATTACHMENT_ID).style.pointerEvents = AppConstant.POINTER_EVENT_AUTO;
            this.vendorAdditionalFieldAttachment.splice(index, 1);

          }
        }, error => {
          document.getElementById(AppConstant.DELETE_ATTACHMENT_ID).style.pointerEvents = AppConstant.POINTER_EVENT_AUTO;
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  /**
   * this method can be used to download attachment
   * @param val to attachment object
   */
  downloadVendorAttachment(val) {
    val.loading = true;
    if (val.fieldName === this.appConstant.VENDOR_W9_FORM_STRING_NAME) {
      this.downloadW9Form(val);
    } else if (val.fieldName === this.appConstant.CLASSIFICATION_FIELD_NAME) {
      this.downloadClassificationAttachment(val);
    } else {
      this.downloadAttachments(val);
    }
  }

  deleteVendorAttachments(val, i) {
    if (val.fieldName === this.appConstant.CLASSIFICATION_FIELD_NAME) {
      this.deleteClassificationAttachments(val, i);
      return;
    }
    if (val.fieldName === this.appConstant.VENDOR_W9_FORM_STRING_NAME) {
      this.deleteClassificationAttachments(val, i);
    } else {
      this.deleteAdditionalAttachments(val, i);
    }
  }


  /**
   * this method can be used to download additional fields
   * @param id to id
   */

  downloadW9Form(val) {
    this.vendorService.downloadW9Form(val.id).subscribe((res: any) => {
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

  /*
  Vendor payment information section new impl------------------------------------------------------------------------>
   */

  /**
   * This method use for get payment type list for dropdown
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
   * This method use for get payment type list for dropdown
   */
  getVendorGroups() {
    this.vendorService.getVendorGroupDropdowns(!this.isVendorEdit).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorsGroupList.data = res.body;
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

  downloadClassificationAttachment(val: any) {
    this.vendorService.downloadClassification(val.id).subscribe((res: any) => {
      if (res.result.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.infoMessage(res.body.message);
      } else {
        console.log('start download:', res);
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', val.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      }
      val.loading = false;
    }, error => {
      val.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  deleteClassificationAttachments(val: any, i: any) {
    this.confirmationService.confirm({
      key: AppConstant.VENDOR_ATTACHMENT_DELETE_KEY,
      message: 'You want to delete this Attachment!',
      accept: () => {
        if (val.fieldName === this.appConstant.CLASSIFICATION_FIELD_NAME) {
          this.vendorService.deleteClassificationAttachment(val.id).subscribe((res: any) => {
            if (res.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.infoMessage(res.body.message);
            } else {
              this.notificationService.successMessage(HttpResponseMessage.ATTACHMENT_DELETED_SUCCESSFULLY);
              this.vendorAdditionalFieldAttachment.splice(i, 1);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        } else {
          this.vendorService.deleteW9Attachment(val.id).subscribe((res: any) => {
            if (res.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.infoMessage(res.body.message);
            } else {
              this.notificationService.successMessage(HttpResponseMessage.ATTACHMENT_DELETED_SUCCESSFULLY);
              this.vendorAdditionalFieldAttachment.splice(i, 1);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      }
    });
  }

  updateAdditionalFieldDropDowns() {
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalDataBasicInfo, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalDataPaymentInfo, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalDataPostalAddress, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalDataRemitAddress, this.selectedAdditionalField);
    this.commonUtil.updateAdditionalFiledDropdowns(this.additionalDataW9Info, this.selectedAdditionalField);
  }

  /**
   * this method can be used to return enable status of confidential feature
   */
  isEnabledConfidentialFeatureForVendor() {
    this.vendorService.getEnabledConfidentialDetailViewFeature(this.featureIdEnum.CONFIDENTIAL_FEATURE_ID)
      .subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.isConfidential = res.body;
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * this method can be used validate additional file input field
   * @param headingAdditionalFieldFormArray to header section additional field array
   * @param additionalAttachments to additional attached files
   */
  validateFileInput(headingAdditionalFieldFormArray, additionalAttachments: any []) {

    if (headingAdditionalFieldFormArray.controls.length > AppConstant.ZERO) {
      headingAdditionalFieldFormArray.controls.forEach((formGroup, i) => {

        if (formGroup.get('docStatus').value === AppEnumConstants.STATUS_APPROVED
          && formGroup.get('fieldTypeId').value === this.appFieldType.FILE_INPUT && formGroup.get('required').value &&
          additionalAttachments.filter(x => x.fieldId === formGroup.get('fieldId').value && x.sectionId ===
            formGroup.get('sectionId').value).length > AppConstant.ZERO) {
          headingAdditionalFieldFormArray.controls[i].get('attachment').clearValidators();
          headingAdditionalFieldFormArray.controls[i].get('attachment').updateValueAndValidity();

        } else if (formGroup.get('docStatus').value === AppEnumConstants.STATUS_APPROVED
          && formGroup.get('fieldTypeId').value === this.appFieldType.FILE_INPUT && formGroup.get('required').value &&
          additionalAttachments.filter(x => x.fieldId === formGroup.get('fieldId').value &&
            x.sectionId === formGroup.get('sectionId').value).length === AppConstant.ZERO) {

          headingAdditionalFieldFormArray.controls[i].get('attachment').setValidators(Validators.required);
          headingAdditionalFieldFormArray.controls[i].get('attachment').updateValueAndValidity();

        }
      });
    }
  }

  vendorGroupChanged(event: any, multiSelect) {
    const prevGroups: any[] = this.vendorCreateForm.get('vendorGroupIdList').value;

    if (event.itemValue === 0 || event.value === 0) {
      this.vendorCreateForm.get('vendorGroupIdList').reset();
      this.createVendorGroup = true;

      setTimeout(() => {
        prevGroups.forEach((value, index) => {
          if (value === 0) {
            prevGroups.splice(index, 1);
          }
          this.vendorCreateForm.get('vendorGroupIdList').patchValue(prevGroups);
        });
      }, 300);
    }

    if (multiSelect.allChecked) {
      if (this.vendorsGroupList.data[0].id === 0) {
        prevGroups.splice(0, 1);
        this.vendorsGroupList.data[0].inactive = true;
      } else {
        this.vendorsGroupList.data[0].inactive = false;
      }
    } else {
      if (this.vendorsGroupList.data[0].id === 0) {
        this.vendorsGroupList.data[0].inactive = false;
      }
    }
  }

  /**
   * this method can be used to load all payment types to vendor
   */
  getPaymentDropDownList() {
    this.paymentTypeService.getPaymentDropDownList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.allPaymentTypeList.data = res.body;
      }
    }, error => {
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

  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */

  setSelectedAdditionalField(lineItemAdditionalFieldDetail: AdditionalFieldDetailDto) {
    this.selectedAdditionalField = lineItemAdditionalFieldDetail;
  }

  /**
   * This method can be used focus the first element after user go to another tab and come again
   */

  focusFirstElementAfterTabChange() {
    this.vendorService.changeMainTabSet.subscribe(x => {
      setTimeout(() => {
        if (x && x === AppAnalyticsConstants.CREATE_VENDOR) {
          this.vendorNameInput.nativeElement.focus();
        }
      }, 0);
    });
  }

  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text/plain');
    const sanitizedText = pastedText.replace(/\s/g, ''); // Remove spaces
    document.execCommand('insertText', false, sanitizedText);
  }

}



