import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {TenantUtility} from '../tenant-utility/tenant-utility';
import {TenantService} from '../../../../shared/services/support/tenant.service';
import {MustMatch} from '../../../../shared/helpers/password-validate';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {PatternValidator} from '../../../../shared/helpers/pattern-validator';
import {AppPatternValidations} from '../../../../shared/enums/app-pattern-validations';
import {DropdownDto} from "../../../../shared/dto/common/dropDown/dropdown-dto";
import {VendorService} from "../../../../shared/services/vendors/vendor.service";
import {AppResponseStatus} from "../../../../shared/enums/app-response-status";
import {CompanyProfileService} from "../../../../shared/services/company-profile/company-profile.service";

@Component({
  selector: 'app-tenant-create',
  templateUrl: './tenant-create.component.html',
  styleUrls: ['./tenant-create.component.scss']
})
export class TenantCreateComponent implements OnInit {
  public tenantForm: UntypedFormGroup;
  public tenantUtility: TenantUtility = new TenantUtility(this.tenantService, this.notificationService);
  public passwordShow = false;
  public cPasswordShow = false;
  public isAdAuth = false;
  public loading = false;
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public countries: DropdownDto = new DropdownDto();
  public filteredGroups: any[];
  public cities = [];
  public states = [];
  public timeZoneList: DropdownDto = new DropdownDto();
  public tenantPackageNameList: DropdownDto = new DropdownDto();

  @Output() refreshTable = new EventEmitter();


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public tenantService: TenantService, public vendorService: VendorService,
              public companyProfileService: CompanyProfileService) {
  }

  ngOnInit(): void {
    this.tenantForm = this.formBuilder.group({
      ownerName: [AppConstant.NULL_VALUE, Validators.required],
      firstName: [AppConstant.NULL_VALUE, Validators.required],
      lastName: [AppConstant.NULL_VALUE, Validators.required],
      ownerEmail: [AppConstant.NULL_VALUE, [Validators.required, Validators.compose([
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
      dbDriverClassName: [AppConstant.NULL_VALUE, Validators.required],
      dbServerId: [AppConstant.NULL_VALUE, Validators.required],
      sftpServerId: [AppConstant.NULL_VALUE, Validators.required],
      dbCachePrepStmts: [this.tenantUtility.dbCachePrepStmts, Validators.required],
      dbPrepStmtCacheSize: [this.tenantUtility.dbPrepStmtCacheSize, Validators.required],
      dbPrepStmtCacheSqlLimit: [this.tenantUtility.dbPrepStmtCacheSqlLimit, Validators.required],
      dbConnectionTimeOut: [this.tenantUtility.dbConnectionTimeOut, Validators.required],
      dbIdleTimeOut: [this.tenantUtility.dbIdleTimeOut, Validators.required],
      dbInitFailTimeout: [this.tenantUtility.dbInitFailTimeout, Validators.required],
      dbMinIdle: [this.tenantUtility.dbMinIdle, Validators.required],
      dbLeakDetectionThreadshold: [this.tenantUtility.dbLeakDetectionThreadshold, Validators.required],
      dbPoolSize: [this.tenantUtility.dbPoolSize, Validators.required],
      dbMaxLife: [this.tenantUtility.dbMaxLife, Validators.required],
      dbDefaultAutoCommit: [this.tenantUtility.dbDefaultAutoCommit, Validators.required],
      userAuthType: [AppConstant.NULL_VALUE, Validators.required],
      packageId: [null, Validators.required],
      adProviderUrl: [AppConstant.NULL_VALUE],
      adSecurityAuth: [AppConstant.NULL_VALUE],
      adOuDcParam: [AppConstant.NULL_VALUE],
      adSampleSyncUser: [AppConstant.NULL_VALUE],
      adSampleSyncUserPassword: [AppConstant.NULL_VALUE],
      adSampleSyncUserConfirmPassword: [AppConstant.NULL_VALUE],
    }, {
      validator: [
        MustMatch('adSampleSyncUserPassword', 'adSampleSyncUserConfirmPassword')
      ]
    });

    this.getTimeZoneList();
    this.vendorService.getCountries().subscribe((res) => {
      this.countries.data = res.body;
      this.country.patchValue(AppConstant.COUNTRY_US);
    });
    this.vendorService.getCities().subscribe((res) => {
      this.cities = (res.body);
    });
    this.vendorService.getStates().subscribe((res) => {
      this.states = (res.body);
    });

    this.getAvailableSftpServers();
    this.getPackagesDetails();
  }

  /**
   * this method can be used to get available db servers
   * @param event to change event
   */
  getAvailableDBServers(event) {
    this.tenantService.getAvailableDBServers(event.value, 'A').subscribe((res: any) => {
      this.tenantUtility.supportDBServers.data = res.body;
    });
  }

  /**
   * get time zone list
   */
  getTimeZoneList() {
    return new Promise<void>((resolve, reject) => {
      this.companyProfileService.getTimeZoneList().subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.timeZoneList.data = res.body;
          this.tenantForm.get('timeZone').patchValue(AppConstant.TIMEZONE_EASTERN)
        }
        resolve();
      }, error => {
        this.notificationService.errorMessage(error);
        reject();
      });
    });
  }

  getPackagesDetails(){
    this.tenantService.getPackagesDetails().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.tenantPackageNameList.data = res.body;
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get available sftp server
   */
  getAvailableSftpServers() {
    this.tenantService.getAvailableSftpServers('A').subscribe((res: any) => {
      this.tenantUtility.supportSftpServers.data = res.body;
    });
  }


  /**
   * this method can be used to submit the form
   * @param value to form value
   */
  onSubmitForm(value) {
    this.loading = true;
    if (this.tenantForm.valid) {
      this.tenantService.createTenant(this.tenantForm.value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
          this.notificationService.successMessage(HttpResponseMessage.TENANT_CREATED_SUCCESSFULLY);
          this.tenantForm.reset();
          this.refreshTable.emit();
          this.loading = false;
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
      new CommonUtility().validateForm(this.tenantForm);
    }

  }


  get addressLine1() {
    return this.tenantForm.get('masterTenantAddress').get('addressLine1');
  }

  get zipcode() {
    return this.tenantForm.get('masterTenantAddress').get('zipcode');
  }

  get country() {
    return this.tenantForm.get('masterTenantAddress').get('country');
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
   * this method can be used to reset form
   */
  resetForm() {
    this.tenantForm.reset();
  }


  userAuthDropdownChanged(event) {
    this.isAdAuth = (event.value === 'AD');
    const providerUrl = this.tenantForm.get('adProviderUrl');
    const syncType = this.tenantForm.get('adSecurityAuth');
    const sampleUserName = this.tenantForm.get('adOuDcParam');
    const ouParam = this.tenantForm.get('adSampleSyncUser');
    const syncUserPassword = this.tenantForm.get('adSampleSyncUserPassword');
    const syncUserConPassword = this.tenantForm.get('adSampleSyncUserConfirmPassword');

    if (this.isAdAuth) {
      providerUrl.setValidators([Validators.required]);
      syncType.setValidators([Validators.required]);
      sampleUserName.setValidators([Validators.required]);
      ouParam.setValidators([Validators.required]);
      syncUserPassword.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(20)]);
      syncUserConPassword.setValidators([Validators.required]);
    } else {

      providerUrl.reset();
      syncType.reset();
      sampleUserName.reset();
      ouParam.reset();
      syncUserPassword.reset();
      syncUserConPassword.reset();

      providerUrl.clearValidators();
      syncType.clearValidators();
      sampleUserName.clearValidators();
      ouParam.clearValidators();
      syncUserPassword.clearValidators();
      syncUserConPassword.clearValidators();
    }
    providerUrl.updateValueAndValidity();
    syncType.updateValueAndValidity();
    sampleUserName.updateValueAndValidity();
    ouParam.updateValueAndValidity();
    syncUserPassword.updateValueAndValidity();
    syncUserConPassword.updateValueAndValidity();
  }

  /**
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    try {
      if (this.tenantForm.get(fieldName).value) {
        if (this.tenantForm.get(fieldName).value[0] === ' ') {
          this.tenantForm.get(fieldName).patchValue('');
        }
      }
    } catch (e) {
      if (this.tenantForm.get('masterTenantAddress').get(fieldName).value) {
        if (this.tenantForm.get('masterTenantAddress').get(fieldName).value[0] === ' ') {
          this.tenantForm.get('masterTenantAddress').get(fieldName).patchValue('');
        }
      }
    }

  }
}
