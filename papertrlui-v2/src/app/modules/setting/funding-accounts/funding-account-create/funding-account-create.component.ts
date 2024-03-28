import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {FundingAccountService} from '../../../../shared/services/settings/funding-account.service';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {RemoveSpace} from '../../../../shared/helpers/remove-space';
import {CompanyProfileService} from '../../../../shared/services/company-profile/company-profile.service';
import {Dropdown} from 'primeng/dropdown';

@Component({
  selector: 'app-funding-account-create',
  templateUrl: './funding-account-create.component.html',
  styleUrls: ['./funding-account-create.component.scss']
})
export class FundingAccountCreateComponent implements OnInit{

  public fundingAccountForm: UntypedFormGroup;
  public banks: DropdownDto = new DropdownDto();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public appConstant = AppConstant;
  public supportedPaymentTypes: any [] = [];
  public checkedTypeArray: any [] = [];
  public checkedPaymentTypes: any[] = [];
  public btnDisable = false;
  public paymentChannelDp: any;
  public editViewBankPaymentTypes: any[] = [];
  public achPaymentChannels: DropdownDto = new DropdownDto();
  public checkPaymentChannels: DropdownDto = new DropdownDto();
  public digitalCPaymentChannels: DropdownDto = new DropdownDto();
  public virtualCPaymentChannels: DropdownDto = new DropdownDto();
  @ViewChild('accountNumber') accountNumber: ElementRef;
  @ViewChild('paymentChannelRef') paymentChannelRef: Dropdown;
  @Output() createFundingAccountVisible = new EventEmitter();
  @Output() refreshBankList = new EventEmitter();
  @Input() isEditView = false;
  @Input() bankAccountId: any;
  public paymentChannelId: any;

  constructor(public formBuilder: UntypedFormBuilder, public fundingAccountService: FundingAccountService,
              public notificationService: NotificationService, public companyProfileService: CompanyProfileService) {
  }

  ngOnInit(): void {
    this.initializeFormBuilder();
    this.getBanks();
    this.initializePaymentChannelDpMap();

    if (!this.isEditView) {
      this.getCompanyName();
    } else {
      this.getBankAccountById(this.bankAccountId);
    }

    this.fundingAccountForm.get('accountType').valueChanges.subscribe((val) => {
      this.getAccountPaymentTypes(val);
    });
  }

  /**
   * This method use for initialize ths form
   */
  initializeFormBuilder() {
    this.fundingAccountForm = this.formBuilder.group({
      id: [null],
      bankRoutingNo: [null, Validators.compose([Validators.required, Validators.maxLength(9), Validators.pattern('^[0-9]*$')])],
      bankId: [null, Validators.compose([Validators.required, Validators.maxLength(9), Validators.pattern('^[0-9]*$')])],
      accountNo: [null, Validators.compose([Validators.required, Validators.maxLength(17)])],
      accountNicName: ['', Validators.required],
      companyName: ['', Validators.required],
      companyId: [null],
      fileUrl: [null],
      virtualCardAccountId: [null],
      digitalCardAccountId: [null],
      transitNo: [null, Validators.compose([Validators.maxLength(10), Validators.pattern('^[0-9]*$')])],
      checkSequenceNumber: [null],
      bankPaymentTypes: [[]],
      defaultFundingAccount: [false],
      accountType: ['', Validators.required],
      paymentChannel: [null]
    });
  }

  /**
   * This method use for create new Funding account
   * @param fundingAccountForm form data of create funding account form
   */
  createFundingAccount(fundingAccountForm) {
    this.btnDisable = true;
    this.setValidators();

    if (this.fundingAccountForm.invalid) {
      this.btnDisable = false;
      return new CommonUtility().validateForm(this.fundingAccountForm);
    }

    this.fundingAccountService.createFundingAccount(fundingAccountForm).subscribe({
      next: (res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_CREATED === res.status) {
          this.notificationService.successMessage(HttpResponseMessage.FUNDING_ACCOUNT_CREATED_SUCCESSFULLY);
          this.btnDisable = false;
          this.refreshBankList.emit();
          this.formReset();
          this.fundingAccountForm.get(AppConstant.BANK_PAYMENT_TYPES).patchValue([]);
          this.createFundingAccountVisible.emit();
        } else {
          this.notificationService.infoMessage(res.body.message);
          this.btnDisable = false;
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
        this.btnDisable = false;
      }
    });
  }

  /**
   * This method use for get bank list
   */
  getBanks() {
    this.fundingAccountService.getBankList().subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.banks.data = res.body;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
      }
    });
  }

  /**
   * This method can be used to update value of supported payment types
   * @param checked to check status
   * @param id to payment type id
   */
  supportedPaymentTypesChange(checked, id) {
    if (!id) {
      return;
    }

    if (checked) {
      if (!this.checkedTypeArray.includes(id)) {
        this.checkedTypeArray.push(id);
        this.setDefaultPaymentType(id, false);
      }
      this.getPaymentChannels(id, this.fundingAccountForm.get('bankId').value);
    } else {
        this.checkedTypeArray.splice(this.checkedTypeArray.indexOf(id), 1);
        this.checkedPaymentTypes = this.checkedPaymentTypes.filter(item => item.paymentTypeId !== id);
    }

    this.setValidators();

    this.fundingAccountForm.get(AppConstant.BANK_PAYMENT_TYPES).patchValue(this.checkedPaymentTypes);
  }

  /**
   * This method is used to reset the form data
   */
  formReset() {
    this.fundingAccountForm.reset();
    this.supportedPaymentTypes.forEach(type => {
      type.checked = false;
    });
    this.setValidators();
    this.checkedTypeArray = [];
    this.checkedPaymentTypes = [];
    if (!this.isEditView) {
      this.getCompanyName();
    }
    if (this.isEditView) {
      this.getBankAccountById(this.bankAccountId);
    }
  }

  /**
   * This method is used to get bank account by id
   * @param bankAccountId this parameter represent bank account id
   */
  getBankAccountById(bankAccountId) {
    this.fundingAccountService.getFundingAccountById(bankAccountId).subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.fundingAccountForm.patchValue(res.body);
          this.editViewBankPaymentTypes = res.body.bankPaymentTypes;
          this.checkedTypeArray.push(...res.body.bankPaymentTypes);
          this.checkedPaymentTypes.push(...res.body.bankPaymentTypes);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
      }
    });
  }

  /**
   * This method is used to update bank account by id
   */
  updateFundingAccount() {
    this.btnDisable = true;
    if (this.fundingAccountForm.get(AppConstant.SEQUENCE_NUMBER).value) {
      const integerSequenceNumber = parseInt(this.fundingAccountForm.get(AppConstant.SEQUENCE_NUMBER).value);
      this.fundingAccountForm.get(AppConstant.SEQUENCE_NUMBER).patchValue(integerSequenceNumber);
    }

    if (this.fundingAccountForm.invalid) {
      this.btnDisable = false;
      return new CommonUtility().validateForm(this.fundingAccountForm);
    }

    this.fundingAccountService.updateFundingAccount(this.fundingAccountForm.value).subscribe({
      next: (res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(HttpResponseMessage.FUNDING_ACCOUNT_UPDATED_SUCCESSFULLY);
          this.btnDisable = false;
          this.refreshBankList.emit();
          this.createFundingAccountVisible.emit();
        } else {
          this.notificationService.infoMessage(res.body.message);
          this.btnDisable = false;
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
        this.btnDisable = false;
      }
    });
  }

  /**
   * This method is used to set validators to Check Sequence Number field, ACH Upload Location URL field and
   * payment types
   */
  setValidators() {
    const ach = this.supportedPaymentTypes.find(type => type.id === AppConstant.ACH_PAYMENT_TYPE && type.checked);
    const sequenceNumber = this.supportedPaymentTypes.find(type => type.id === AppConstant.CHECK_PAYMENT_TYPE && type.checked);
    const virtualCardId = this.supportedPaymentTypes.find(type => type.id === AppConstant.VIRTUAL_CARD_PAYMENT_TYPE && type.checked);
    const digitalCardId = this.supportedPaymentTypes.find(type => type.id === AppConstant.DIGITAL_CARD_PAYMENT_TYPE && type.checked);

    /* This condition is used to set validators for companyId form controller if
    check ach payment type */
    if (ach) {
      this.fundingAccountForm.get(AppConstant.COMPANY_ID).setValidators([Validators.compose(
        [Validators.required, Validators.maxLength(20), Validators.pattern('^[0-9]*$')])]);
    } else {
      this.fundingAccountForm.get(AppConstant.COMPANY_ID).clearValidators();
    }
    this.fundingAccountForm.get(AppConstant.COMPANY_ID).updateValueAndValidity();

    /* This condition is used to set validators for checkSequenceNumber form controller if
    sequenceNumber ach payment type */
    if (sequenceNumber) {
      this.fundingAccountForm.get(AppConstant.SEQUENCE_NUMBER).setValidators([Validators.compose(
        [Validators.required, Validators.maxLength(5), Validators.pattern('^[0-9]*$')])]);
    } else {
      this.fundingAccountForm.get(AppConstant.SEQUENCE_NUMBER).clearValidators();
    }
    this.fundingAccountForm.get(AppConstant.SEQUENCE_NUMBER).updateValueAndValidity();

    /* This condition is used to set validators for virtualCardAccountId form controller
    if virtual card ach payment type */
    if (virtualCardId) {
      this.fundingAccountForm.get(AppConstant.VIRTUAL_CARD_ID).setValidators([Validators.compose(
        [Validators.required, Validators.maxLength(12), Validators.pattern('^[0-9]*$')])]);
    } else {
      this.fundingAccountForm.get(AppConstant.VIRTUAL_CARD_ID).clearValidators();
    }
    this.fundingAccountForm.get(AppConstant.VIRTUAL_CARD_ID).updateValueAndValidity();

    /* This condition is used to set validators for digitalCardAccountId form controller
    if digital card ach payment type */
    if (digitalCardId) {
      this.fundingAccountForm.get(AppConstant.DIGITAL_CARD_ID).setValidators([Validators.compose(
        [Validators.required, Validators.maxLength(12), Validators.pattern('^[0-9]*$')])]);
    } else {
      this.fundingAccountForm.get(AppConstant.DIGITAL_CARD_ID).clearValidators();
    }
    this.fundingAccountForm.get(AppConstant.DIGITAL_CARD_ID).updateValueAndValidity();
  }

  /**
   * This method is used to get default company name
   */
  getCompanyName() {
    this.companyProfileService.getTenantDetails().subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.fundingAccountForm.get(AppConstant.COMPANY_NAME).patchValue(res.body.ownerName);
        }
      }
    });
  }

  /**
   * This method is used to select whole account number in edit screen
   */
  selectAccountNumber() {
    if (this.isEditView) {
      const accNo = this.accountNumber.nativeElement as HTMLInputElement;
      accNo.select();
    }
  }

  /**
   * This method is used to get payment types related to account type
   * @param accountTypeId id of the account type
   */
  getAccountPaymentTypes(accountTypeId) {
    this.fundingAccountService.getPaymentTypesAccountTypeWise(accountTypeId).subscribe({
      next: (res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.supportedPaymentTypes = res.body.filter(paymentType => paymentType.forOnline);
          /* This part use to open the panels of checked payment types in create screen */
          if (this.isEditView) {
            this.editViewBankPaymentTypes.forEach(enabledTypes => {
              this.supportedPaymentTypes.find(allPaymentTypes => {
                if (enabledTypes.paymentTypeId === allPaymentTypes.id) {
                  allPaymentTypes.checked = true;
                  this.getPaymentChannels(enabledTypes.paymentTypeId, this.fundingAccountForm.get('bankId').value);
                  allPaymentTypes.paymentChannelId = enabledTypes.paymentChannelId;
                  if (enabledTypes.isDefault) {
                    allPaymentTypes.isDefault = true;
                  }
                }
              });
            });
          }
          this.setValidators();
        } else {
          this.notificationService.infoMessage(res.body.message);
          this.btnDisable = false;
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
        this.btnDisable = false;
      }
    });
  }

  /**
   * This method is used to set payment types as default payment type
   * @param paymentTypeId id of the payment type
   * @param isDefault default status of the payment type
   */
  setDefaultPaymentType(paymentTypeId, isDefault) {
    const existingIndex = this.checkedPaymentTypes.findIndex(item => item.paymentTypeId === paymentTypeId);

    if (existingIndex === -1) {
      const newPaymentType: any = { paymentTypeId, isDefault, paymentChannelId: null };
      this.checkedPaymentTypes.push(newPaymentType);
    } else {
      this.checkedPaymentTypes[existingIndex].isDefault = isDefault;
    }

    this.fundingAccountForm.get(AppConstant.BANK_PAYMENT_TYPES).patchValue(this.checkedPaymentTypes);
  }

  /**
   * This method is used to get payment channels related to payment type
   * @param paymentTypeId id of the payment type
   */
  getPaymentChannels(paymentTypeId, bankId) {
    this.fundingAccountService.getPaymentChannel(paymentTypeId, bankId).subscribe({
      next: (res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          switch (paymentTypeId) {
            case AppConstant.ACH_PAYMENT_TYPE:
              this.paymentChannelDp.set(AppConstant.ACH_PAYMENT_TYPE, res.body);
              break;
            case AppConstant.CHECK_PAYMENT_TYPE:
              this.paymentChannelDp.set(AppConstant.CHECK_PAYMENT_TYPE, res.body);
              break;
            case AppConstant.VIRTUAL_CARD_PAYMENT_TYPE:
              this.paymentChannelDp.set(AppConstant.VIRTUAL_CARD_PAYMENT_TYPE, res.body);
              break;
            case AppConstant.DIGITAL_CARD_PAYMENT_TYPE:
              this.paymentChannelDp.set(AppConstant.DIGITAL_CARD_PAYMENT_TYPE, res.body);
              break;
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
      }
    });
  }

  /**
   * This method is used to initialize payment channels drop down map
   */
  initializePaymentChannelDpMap() {
    this.paymentChannelDp = new Map([
      [AppConstant.ACH_PAYMENT_TYPE, this.achPaymentChannels.data],
      [AppConstant.CHECK_PAYMENT_TYPE, this.checkPaymentChannels.data],
      [AppConstant.VIRTUAL_CARD_PAYMENT_TYPE, this.virtualCPaymentChannels.data],
      [AppConstant.DIGITAL_CARD_PAYMENT_TYPE, this.digitalCPaymentChannels.data]
    ]);
  }

  /**
   * This method is used to get payment channel value of payment type and patch to payment types object
   * @param paymentTypeId id of the payment type
   * @param event event is used to get value of the payment channel drop down
   */
  onPaymentChannelChange(paymentTypeId, event) {
    const existingIndex = this.checkedPaymentTypes.findIndex(item => item.paymentTypeId === paymentTypeId);
    if (existingIndex !== -1) {
      this.checkedPaymentTypes[existingIndex].paymentChannelId = event.value;
      this.fundingAccountForm.get(AppConstant.BANK_PAYMENT_TYPES).patchValue(this.checkedPaymentTypes);
    }
  }
}
