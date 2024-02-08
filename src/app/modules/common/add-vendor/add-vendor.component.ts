import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {OnTheFlyVendorCreateDto} from '../../../shared/dto/vendor/on-the-fly-vendor-create-dto';
import {AddVendorService} from '../../../shared/services/items/add-vendor.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppFormConstants} from '../../../shared/enums/app-form-constants';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {Subscription} from 'rxjs';
import {AppFeatureId} from "../../../shared/enums/app-feature-id";

@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.scss']
})
export class AddVendorComponent implements OnInit, OnDestroy {

  public addVendorForm: UntypedFormGroup;
  public onTheFlyVendorRequestDto: OnTheFlyVendorCreateDto = new OnTheFlyVendorCreateDto();
  public isEmailAvailable = false;
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public countries = [];
  public isVendorCodeAvailable = false;
  public vendorsGroupList: DropdownDto = new DropdownDto();
  public termList: DropdownDto = new DropdownDto();
  public subscription: Subscription = new Subscription();
  public commonUtil: CommonUtility = new CommonUtility();


  public appFormConstants = AppFormConstants;

  @Output() closeModal = new EventEmitter();
  @Output() refreshVendorList = new EventEmitter();
  public loading = false;
  public createVendorGroup = false;
  confidential: any;
  public isConfidential = false;
  public featureIdEnum = AppFeatureId;

  constructor(public formBuilder: UntypedFormBuilder, public vendorService: VendorService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public billsService: BillsService) {

    this.addVendorForm = this.formBuilder.group({
      name: [AppConstant.EMPTY_STRING, Validators.required],
      vendorGroupIdList: [AppConstant.EMPTY_STRING],
      confidential: [false],
      discountPercentage: [AppConstant.EMPTY_STRING],
      discountDaysDue: [AppConstant.EMPTY_STRING],
      netDaysDue: [AppConstant.EMPTY_STRING],
      term: [AppConstant.EMPTY_STRING],
      vendorCode: [null, Validators.compose([Validators.maxLength(50)])],
      contactPerson: [AppConstant.EMPTY_STRING],
      contactNumber: [null],
      fax: [null, Validators.compose([Validators.maxLength(50)])],
      country: [AppConstant.NULL_VALUE, Validators.required],
      email: [AppConstant.NULL_VALUE, [Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      ccEmail: [AppConstant.NULL_VALUE, [Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.isEnabledConfidentialFeatureForVendor();
    this.vendorService.getCountries().subscribe((res) => {
      this.countries = (res.body);
      this.addVendorForm.get('country').patchValue(AppEnumConstants.DEFAULT_COUNTRY);
    });
    this.getPaymentTerms();
    this.getVendorGroups();

    this.subscription = this.vendorService.groupSubject.subscribe(
      (val: any) => {
        this.getVendorGroups();
      },
    );
  }

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
   * This method use for get payment type list for dropdown
   */
  getVendorGroups() {
    this.vendorService.getVendorGroupDropdowns(true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorsGroupList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
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
  /**
   * Add new Vendor
   * @param addVendorForm to form group
   */
  addNewVendor(addVendorForm) {
    this.loading = true;
    this.onTheFlyVendorRequestDto = Object.assign(this.onTheFlyVendorRequestDto, addVendorForm.value);
    this.onTheFlyVendorRequestDto.contactNumber = this.commonUtil.getTelNo(this.addVendorForm, 'contactNumber');

    if (this.addVendorForm.valid) {
      this.onTheFlyVendorRequestDto.permenantAddress.country = this.addVendorForm.get('country').value;
      this.createVendor(this.onTheFlyVendorRequestDto);
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.addVendorForm);
    }
  }

  /**
   * Reset Vendor Form
   */
  resetVendorForm() {
    this.addVendorForm.reset();
    this.addVendorForm.get('country').patchValue(AppEnumConstants.DEFAULT_COUNTRY);
  }

  /**
   * this method can be used to create new user
   */
  createVendor(vendorDto) {
    if (this.addVendorForm.valid && !this.isEmailAvailable && !this.isVendorCodeAvailable) {
      this.vendorService.createVendor(vendorDto, false).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
          this.loading = false;
          if (res?.body?.message){
            this.notificationService.infoMessage(res.body.message);
          }
          this.notificationService.successMessage(HttpResponseMessage.VENDOR_CREATED_SUCCESSFULLY);
          setTimeout(() => {
            this.refreshVendorList.emit();
          }, 500);
          this.addVendorForm.reset();
        } else {
          this.loading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.loading = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.addVendorForm);
    }
  }

  /**
   * Check vendor code availability
   */
  checkVendorCodeAvailability() {
    const vendorCode = this.addVendorForm.get('vendorCode').value;
    if (vendorCode !== null && vendorCode !== '') {
      this.vendorService.checkVendorCodeAvailability(vendorCode, null).subscribe((res: any) => {
          this.isVendorCodeAvailable = res.body;
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * Check Email is available
   */
  checkEmailAvailability() {
    const emailLetters = this.addVendorForm.get('email').value;
    if (emailLetters !== null && emailLetters !== '') {
      this.vendorService.checkEmailAvailability(emailLetters, null).subscribe((res: any) => {
          this.isEmailAvailable = res.body;
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    if (this.addVendorForm.get(fieldName).value) {
      if (this.addVendorForm.get(fieldName).value[0] === ' ') {
        this.addVendorForm.get(fieldName).patchValue('');
      }
    }
    if (this.addVendorForm.get(fieldName).value === ' ' && !this.addVendorForm.get(fieldName).value.replace(/\s/g, '').length) {
      this.addVendorForm.get(fieldName).patchValue('');
    }
  }

  vendorGroupChanged(event: any, multiSelect) {
    const prevGroups: any[] = this.addVendorForm.get('vendorGroupIdList').value;

    if (event.itemValue === 0 || event.value === 0) {
      this.addVendorForm.get('vendorGroupIdList').reset();
      this.createVendorGroup = true;

      setTimeout(() => {
        prevGroups.forEach((value, index) => {
          if (value === 0) {
            prevGroups.splice(index, 1);
          }
          this.addVendorForm.get('vendorGroupIdList').patchValue(prevGroups);
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
}
