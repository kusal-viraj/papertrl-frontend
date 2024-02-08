import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {SubAccountMasterDto} from '../../../shared/dto/sub-account/sub-account-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {SubAccountService} from '../../../shared/services/sub-account/sub-account.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {EventEmitterService} from '../../../shared/services/common/event-emitter/event-emitter.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {VendorService} from "../../../shared/services/vendors/vendor.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {CompanyProfileService} from "../../../shared/services/company-profile/company-profile.service";
import {CommonMessage} from "../../../shared/utility/common-message";

@Component({
  selector: 'app-create-sub-account',
  templateUrl: './create-sub-account.component.html',
  styleUrls: ['./create-sub-account.component.scss']
})
export class CreateSubAccountComponent implements OnInit {
  subAccountCreationForm: UntypedFormGroup;
  public subAccountMasterDto: SubAccountMasterDto = new SubAccountMasterDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  @Input() editView: boolean;
  @Input() detailVIew: boolean;
  @Input() subAccountId: number;
  @Output() refreshTable = new EventEmitter();
  @Output() refreshTableAfterCreate = new EventEmitter();
  public viewSubAccount: boolean;

  public loading = false;
  public countries: DropdownDto = new DropdownDto();
  public filteredGroups: any[];
  public cities = [];
  public states = [];
  public timeZoneList: DropdownDto = new DropdownDto();
  public imageUrl: any;

  constructor(public formBuilder: UntypedFormBuilder, public subAccountService: SubAccountService, public notificationService: NotificationService,
              public messageService: MessageService, public eventEmitterService: EventEmitterService,
              public vendorService: VendorService, public companyProfileService: CompanyProfileService) {
  }

  ngOnInit(): void {
    this.subAccountCreationForm = this.formBuilder.group({
      ownerName: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}, Validators.required],
      firstName: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}, Validators.required],
      lastName: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}, Validators.required],
      // businessAddress: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}, Validators.required],
      ownerEmail: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailVIew
      }, [Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      uuid: [],
      masterTenantAddress: this.formBuilder.group({
        addressLine1: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}, Validators.required],
        addressLine2: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}],
        city: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}],
        addressState: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}],
        zipcode: [{
          value: AppConstant.NULL_VALUE,
          disabled: this.detailVIew
        }, Validators.compose([Validators.maxLength(30)])],
        country: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}],
      }),
      timeZone: [{value: AppConstant.NULL_VALUE, disabled: this.detailVIew}, Validators.required],
      img: [],
      modified: [false],
      masterTenantProfilePicture:
        this.formBuilder.group({
          masterTenantProfilePicture: [null],
        }),
    });

    this.init();

    this.subAccountCreationForm.valueChanges.subscribe((updatedValues) => {
      Object.assign(this.subAccountMasterDto, updatedValues);
    });

    this.viewSubAccount = (this.editView || this.detailVIew);
  }

  async init() {
    await this.getTimeZoneList();

    this.vendorService.getCountries().subscribe((res) => {
      this.countries.data = res.body;
      if (!(this.editView || this.detailVIew)) {
        this.country.patchValue(AppConstant.COUNTRY_US);
      }
    });
    this.vendorService.getCities().subscribe((res) => {
      this.cities = (res.body);
    });
    this.vendorService.getStates().subscribe((res) => {
      this.states = (res.body);
    });

    if (this.editView || this.detailVIew) {
      this.getSubAccountData();
    }
  }


  /**
   * this method can be used to get sub account profilePic data
   */
  getSubAccountData() {
    this.subAccountService.viewSubAccount(this.subAccountId).subscribe((res: any) => {
      const file = res.body?.masterTenantProfilePicture?.pictureData;
      if (file) {
        this.imageUrl = ('data:image/jpg;base64,' + file);
      }
      this.subAccountCreationForm.patchValue(res.body);
    });
  }

  get addressLine1() {
    return this.subAccountCreationForm.get('masterTenantAddress').get('addressLine1');
  }

  get zipcode() {
    return this.subAccountCreationForm.get('masterTenantAddress').get('zipcode');
  }

  get country() {
    return this.subAccountCreationForm.get('masterTenantAddress').get('country');
  }

  /**
   * get time zone list
   */
  getTimeZoneList() {
    return new Promise<void>((resolve, reject) => {
      this.companyProfileService.getTimeZoneList().subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.timeZoneList.data = res.body;
          if (!(this.editView || this.detailVIew)) {
            this.subAccountCreationForm.get('timeZone').patchValue(AppConstant.TIMEZONE_EASTERN)
          }
        }
        resolve();
      }, error => {
        this.notificationService.errorMessage(error);
        resolve();
      });
    });
  }

  /**
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    if (this.subAccountCreationForm.get('masterTenantAddress').get(fieldName).value) {
      if (this.subAccountCreationForm.get('masterTenantAddress').get(fieldName).value[0] === ' ') {
        this.subAccountCreationForm.get('masterTenantAddress').get(fieldName).patchValue('');
      }
    }
  }


  /**
   * Delete Image
   */
  deleteFile() {
    this.imageUrl = null;
    this.subAccountCreationForm.get('masterTenantProfilePicture').get('masterTenantProfilePicture').patchValue(null);
    this.subAccountCreationForm.get('modified').patchValue(true);
  }

  /**
   * this method can be used to upload image
   * @param event to change event
   */
  uploadFile(event) {
    if(!this.isValidFile(event)){
      return
    }else {
      const reader = new FileReader();
      const file = event.target.files[0];
      if (event.target.files[0]) {
        const targetFile = event.target.files[0];
        // this.subAccountCreationForm.patchValue({
        //   masterTenantProfilePicture: targetFile
        // });
        this.subAccountCreationForm.get('masterTenantProfilePicture').get('masterTenantProfilePicture').patchValue(targetFile);
        this.subAccountCreationForm.get('modified').patchValue(true);
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.imageUrl = reader.result;
        };
      }
    }
  }

  /**
   * validate image file
   * @param event to change event
   */
  isValidFile(event) {
    let fileObject: File = event.target.files[0];
    if ((fileObject.size / 1024 / 1024) > AppConstant.MAX_PROPIC_SIZE) {
      fileObject = null;
      this.notificationService.infoMessage(CommonMessage.INVALID_IMAGE_SIZE);
      return false;
    } else {
      const contentType: string = fileObject.type;
      if (!AppConstant.SUPPORTING_PRO_PIC_TYPES.includes(contentType)) {
        fileObject = null;
        this.notificationService.infoMessage(CommonMessage.INVALID_PRO_PIC_TYPE);
        return false;
      }
    }
    return true;
  }

  /**
   * Auto Complete Cities
   */
  filterCities(event) {
    if (this.country.value !== AppConstant.COUNTRY_US) {
      this.filteredGroups = [];
      return;
    }
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
   * Auto Complete States
   */
  filterStates(event) {
    if (this.country.value !== AppConstant.COUNTRY_US) {
      this.filteredGroups = [];
      return;
    }
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
   * this method can be used to submit sub account form data
   */

  onSubmit(formValues) {
    this.loading = true;
    this.subAccountMasterDto = Object.assign(this.subAccountMasterDto, formValues);
    this.subAccountMasterDto.id = this.subAccountId;
    if (this.subAccountCreationForm.valid) {
      if (this.editView) {
        this.updateSubAccount(this.subAccountMasterDto);
      } else {
        this.createSubAccount(this.subAccountMasterDto);
      }
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.subAccountCreationForm);
    }
  }

  /**
   * this method can be used to reset the form
   */
  resetForm() {
    this.subAccountCreationForm.reset();
    this.subAccountCreationForm.get('modified').patchValue(false);
    if (this.editView) {
      this.getSubAccountData();
    }
  }

  /**
   * This method is use for create new sub account
   * @param subAccountDto to subAccountDto
   */
  createSubAccount(subAccountDto) {
    this.subAccountService.createSubAccount(subAccountDto).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.subAccountService.getUpdatedSubAccounts.next(subAccountDto);
        this.loading = false;
        this.refreshTableAfterCreate.emit();
        this.notificationService.successMessage(HttpResponseMessage.SUB_ACCOUNT_CREATED_SUCCESSFULLY);
        this.eventEmitterService.loadSubAccounts();
      } else {
        this.loading = false;
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method is use for update sub account
   * @param subAccountDto to subAccountDto
   */
  updateSubAccount(subAccountDto) {
    this.subAccountService.updateSubAccount(subAccountDto).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.refreshTable.emit();
        this.eventEmitterService.loadSubAccounts();
        this.subAccountService.getUpdatedSubAccounts.next(subAccountDto);
        this.loading = false;
        this.notificationService.successMessage(HttpResponseMessage.RECORD_UPDATED_SUCCESSFULLY);
      } else {
        this.loading = false;
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }
}
