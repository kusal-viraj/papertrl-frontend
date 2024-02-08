import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CompanyProfileService} from '../../../shared/services/company-profile/company-profile.service';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {TenantDto} from '../../../shared/dto/tenant/tenant-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {CommonMessage} from '../../../shared/utility/common-message';
import {DomSanitizer} from '@angular/platform-browser';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {PrivilegeService} from 'src/app/shared/services/privilege.service';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss']
})
export class CompanyProfileComponent implements OnInit {
  companyProfileForm: UntypedFormGroup;
  public companyProfileData: TenantDto = new TenantDto();
  public timeZoneList: DropdownDto = new DropdownDto();
  public dateFormatList: DropdownDto = new DropdownDto();
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  @Output() isHasTimeZone = new EventEmitter();

  public countries: DropdownDto = new DropdownDto();
  public filteredGroups: any[];
  public cities = [];
  public states = [];
  @Input() public imageUrl: any;
  @Output() public imageUrlForHome: any = new EventEmitter();
  public saveLoading = false;
  public isSubAccount = false;


  constructor(public formBuilder: UntypedFormBuilder, public companyProfileService: CompanyProfileService, public sanitizer: DomSanitizer,
              public notificationService: NotificationService, public vendorService: VendorService,
              public billSubmitService: BillSubmitService, public privilegeService: PrivilegeService) {
  }

  ngOnInit() {
    this.initializeFormGroup();
    this.getTimeZoneList();
    const clientId = localStorage.getItem(AppConstant.SUB_CLIENT_ID);
    if (clientId || !this.privilegeService.isPortal()) {
      this.getDateFormats();
      this.isSubAccount = true;
    } else {
      this.isSubAccount = false;
    }
    this.vendorService.getCountries().subscribe((res) => {
      this.countries.data = res.body;
    });
    this.vendorService.getCities().subscribe((res) => {
      this.cities = (res.body);
    });
    this.vendorService.getStates().subscribe((res) => {
      this.states = (res.body);
    });

    this.getProfileData();
  }

  get addressLine1() {
    return this.companyProfileForm.get('masterTenantAddress').get('addressLine1');
  }

  get zipcode() {
    return this.companyProfileForm.get('masterTenantAddress').get('zipcode');
  }

  get country() {
    return this.companyProfileForm.get('masterTenantAddress').get('country');
  }

  /**
   * this method initialize form group
   */
  initializeFormGroup() {
    this.companyProfileForm = this.formBuilder.group({
      ownerName: [AppConstant.EMPTY_STRING, Validators.required],
      firstName: [AppConstant.EMPTY_STRING, Validators.required],
      lastName: [AppConstant.EMPTY_STRING, Validators.required],
      dateFormat: [AppConstant.EMPTY_STRING],
      ownerEmail: [AppConstant.EMPTY_STRING, [Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      masterTenantAddress: this.formBuilder.group({
        addressLine1: [null, Validators.required],
        addressLine2: [null],
        city: [null],
        addressState: [null],
        zipcode: [null, Validators.compose([Validators.maxLength(30)])],
        country: [null, Validators.required],
      }),
      timeZone: [null, Validators.required],
      id: [],
      img: [],
      modified: [false],
      masterTenantProfilePicture:
        this.formBuilder.group({
          masterTenantProfilePicture: [null],
        }),
    });
  }

  /**
   * this method can be used to get company profilePic data
   */
  getProfileData() {
    this.companyProfileService.getTenantDetails().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.isHasTimeZone.emit(res.body.timeZone);
        this.companyProfileForm.patchValue(res.body);

        const file = res.body?.masterTenantProfilePicture?.pictureData;
        if (file) {
          this.imageUrl = ('data:image/jpg;base64,' + file);
          this.imageUrlForHome.emit(this.imageUrl);
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to save company profilePic data
   * @param value to form values
   */
  editCompanyProfileData(value) {
    this.companyProfileData = Object.assign(this.companyProfileData, value);
    this.saveLoading = true;
    if (this.companyProfileForm.valid) {
      const tenantDto: TenantDto = this.companyProfileForm.value;
      this.companyProfileService.updateTenant(tenantDto).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.resetForm();
          this.saveLoading = false;
          this.notificationService.successMessage(HttpResponseMessage.COMPANY_PROFILE_UPDATED_SUCCESSFULLY);
        } else {
          this.saveLoading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.saveLoading = false;
        this.notificationService.errorMessage(error);
      });

    } else {
      this.saveLoading = false;
      new CommonUtility().validateForm(this.companyProfileForm);
    }
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
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    try {
      if (this.companyProfileForm.get(fieldName).value) {
        if (this.companyProfileForm.get(fieldName).value[0] === ' ') {
          this.companyProfileForm.get(fieldName).patchValue('');
        }
      }
    } catch (e) {
      if (this.companyProfileForm.get('masterTenantAddress').get(fieldName).value) {
        if (this.companyProfileForm.get('masterTenantAddress').get(fieldName).value[0] === ' ') {
          this.companyProfileForm.get('masterTenantAddress').get(fieldName).patchValue('');
        }
      }
    }
  }

  /**
   * this method can be used to reset the companyProfileForm
   */
  resetForm() {
    this.companyProfileForm.reset();
    this.companyProfileForm.get('modified').patchValue(false);
    this.getProfileData();
  }


  /**
   * get time zone list
   */
  getTimeZoneList() {
    return new Promise<void>((resolve, reject) => {
      this.companyProfileService.getTimeZoneList().subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.timeZoneList.data = res.body;
        }
        resolve();
      }, error => {
        this.notificationService.errorMessage(error);
        reject();
      });
    });
  }

  /**
   * Delete Image
   */
 deleteFile() {
    this.imageUrl = null;
    this.companyProfileForm.get('masterTenantProfilePicture').get('masterTenantProfilePicture').patchValue(null);
    this.companyProfileForm.get('modified').patchValue(true);
    this.imageUrlForHome.emit(this.imageUrl);
  }

  /**
   * this method can be used to upload image
   * @param event to change event
   */
  uploadFile(event) {
    if (!this.isValidFile(event)) {
      return
    } else {
      const reader = new FileReader();
      const file = event.target.files[0];
      if (event.target.files[0]) {
        const targetFile = event.target.files[0];
        this.companyProfileForm.patchValue({
          img: targetFile
        });
        this.companyProfileForm.get('masterTenantProfilePicture').get('masterTenantProfilePicture').patchValue(targetFile);
        this.companyProfileForm.get('modified').patchValue(true);
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.imageUrl = reader.result;
          this.imageUrlForHome.emit(this.imageUrl);
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
   * this method can be used to get date formats
   */
  getDateFormats() {
    this.companyProfileService.getDateFormats().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.dateFormatList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }
}
