import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef, AfterViewInit,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {PoNumberListComponent} from '../po-number-list/po-number-list.component';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {PoNumberConfigurationComponent} from '../po-number-configuration/po-number-configuration.component';
import {PoPriceVarianceListComponent} from '../po-price-variance-list/po-price-variance-list.component';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {MileageConfigurationComponent} from '../mileage-configuration/mileage-configuration.component';
import {MileageRateListComponent} from '../mileage-rate-list/mileage-rate-list.component';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AdditionalFieldListComponent} from '../additional-field-list/additional-field-list.component';
import {ReminderListComponent} from '../reminder-list/reminder-list.component';
import {CompanyProfileComponent} from "../company-profile/company-profile.component";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {CompanyProfileService} from "../../../shared/services/company-profile/company-profile.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {MileageRateService} from "../../../shared/services/settings/mileage-rate/mileage-rate.service";

export class SettingsState {
  public tabIndex?: any;
}

@Component({
  selector: 'app-setting-home',
  templateUrl: './setting-home.component.html',
  styleUrls: ['./setting-home.component.scss']
})
export class SettingHomeComponent implements OnInit, OnDestroy, AfterViewInit {

  public settingsState: SettingsState = new SettingsState();
  public tabIndex = 0;

  public isAdditionalFieldCreate = false;
  public isEditCompanyProfile = true;
  public isTenantConversion = false;
  public isChangePackage = false;
  public isPortal = false;
  public isSubAccount = false;
  public isReminderCreate = false;
  isHasTimeZone = true;
  public appAuthorities = AppAuthorities;
  configurationMenu: any = [];
  public tableBaseComponent: TableSupportBase = new TableSupportBase();
  mileageRateList: any;
  public indexAndString = new Map();

  @ViewChild('poNumberListComponent') poNumberListComponent: PoNumberListComponent;
  @ViewChild('poNumberConfig') poNoConfig: PoNumberConfigurationComponent;
  @ViewChild('poPriceVarianceList') poPriceVarianceList: PoPriceVarianceListComponent;
  @ViewChild('mileageConfigurationComponent') mileageConfigurationComponent: MileageConfigurationComponent;
  @ViewChild('mileageRateListComponent') mileageRateListComponent: MileageRateListComponent;
  @ViewChild('additionalFieldListComponent') additionalFieldListComponent: AdditionalFieldListComponent;
  @ViewChild('reminderListComponent') reminderListComponent: ReminderListComponent;
  @ViewChild('companyProfileComponent') companyProfileComponent: CompanyProfileComponent;

  @ViewChild('companyProfileConfiguration') companyProfileConfiguration: ElementRef;
  @ViewChild('department') department: ElementRef;
  @ViewChild('componentsInGeneralConfiguration') componentsInGeneralConfiguration: ElementRef;
  @ViewChild('componentsInFieldConfiguration') componentsInFieldConfiguration: ElementRef;
  @ViewChild('componentsInPaymentConfiguration') componentsInPaymentConfiguration: ElementRef;
  @ViewChild('componentsInFeatureConfiguration') componentsInFeatureConfiguration: ElementRef;
  @ViewChild('componentsInReminderConfigurationConfiguration') componentsInReminderConfigurationConfiguration: ElementRef;
  @ViewChild('componentsInFundingAccount') componentsInFundingAccountConfiguration: ElementRef;

  activeComponent: any;
  public imageUrl: any;

  constructor(public route: ActivatedRoute, public privilegeService: PrivilegeService, public mileageRateService: MileageRateService,
              public formGuardService: FormGuardService, public additionalFieldService: AdditionalFieldService,
              public companyProfileService: CompanyProfileService, public notificationService: NotificationService) {

    this.isPortal = privilegeService.isPortal();
    this.isSubAccount = localStorage.getItem(AppConstant.SUB_CLIENT_ID) != null;
    // this.isPortal = true;
    this.settingsTabIndexMapInitialize();
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('setting-status')) {
      this.settingsState = JSON.parse(sessionStorage.getItem('setting-status'));
      this.tabIndex = this.settingsState.tabIndex;
    } else {
      this.tabIndex = 0;
    }
    this.configurationMenu = [
      {
        label: 'CompanyProfile',
        isVisible: this.isAccessCompanyProfile(),
      },
      {
        label: 'Department',
        isVisible: this.accessDepartment(),
      },
      {
        label: 'General',
        isVisible: this.isAccessGeneralConfiguration(),
      },
      {
        label: 'Field',
        isVisible: this.isAccessFieldConfigurationGroup(),
      },
      {
        label: 'Payment',
        isVisible: this.isAccessPaymentConfiguration(),
      },
      {
        label: 'Funding',
        isVisible: this.isAccessPaymentConfiguration(),
      },
      {
        label: 'Feature',
        isVisible: this.isAccessFeatureConfiguration(),
      },
      {
        label: 'Reminder',
        isVisible: this.isReminderConfigurationModule(),
      }
    ];

    this.configurationMenu = this.configurationMenu.filter(menu => menu.isVisible);
    this.mileageRateService.mileageRate.subscribe(value => {
      if (value) {
        this.mileageRateList = value;
      }
    });
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('setting-status');
  }

  /* This method used to change setting screen when user click the menu tabs*/
  menuChanged(tabIndex: any){
    switch (this.indexAndString.get(tabIndex)) {
      case AppConstant.COMPANY_PROFILE:
        this.activeComponent = this.companyProfileConfiguration;
        this.configurationMenu[0].label = null;
        this.menuChange();
        break;
      case AppConstant.DEPARTMENTS:
        this.activeComponent = this.department;
        this.configurationMenu[0].label = null;
        this.menuChange();
        break;
      case AppConstant.GENERAL_SETTINGS:
        this.activeComponent = this.componentsInGeneralConfiguration;
        this.configurationMenu[0].label = null;
        this.menuChange();
        break;
      case AppConstant.FIELDS_CONFIGURATION:
        this.activeComponent = this.componentsInFieldConfiguration;
        this.configurationMenu[0].label = null;
        this.menuChange();
        break;
      case AppConstant.ONLINE_PAYMENTS:
        this.activeComponent = this.componentsInPaymentConfiguration;
        this.configurationMenu[0].label = null;
        this.menuChange();
        break;
      case AppConstant.FUNDING_ACCOUNTS:
        this.activeComponent = this.componentsInFundingAccountConfiguration;
        this.configurationMenu[0].label = null;
        this.menuChange();
        break;
      case AppConstant.FEATURE_SETTINGS:
        this.activeComponent = this.componentsInFeatureConfiguration;
        this.configurationMenu[0].label = null;
        this.menuChange();
        break;
      case AppConstant.REMINDERS:
        this.activeComponent = this.componentsInReminderConfigurationConfiguration;
        this.configurationMenu[0].label = null;
        this.menuChange();
        break;
    }
  }

  /**
   * This method use for handle tab changed
   * @param tabIndex any
   */
  tabChanged(tabIndex: any) {
    this.tabIndex = tabIndex;
    this.storeSessionStore();
  }

  /**
   * This method can be used store data in storage
   */
  storeSessionStore() {
    this.settingsState.tabIndex = this.tabIndex;
    sessionStorage.setItem('setting-status', JSON.stringify(this.settingsState));
  }

  toggleAdditionalFieldCreate() {
    this.isAdditionalFieldCreate = !this.isAdditionalFieldCreate;
  }


  toggleCompanyProfile(e: string) {
    if (e === 'e') {
      this.isEditCompanyProfile = true;
      this.isTenantConversion = false;
      this.isChangePackage = false;
    }
    if (e === 't') {
      this.isEditCompanyProfile = false;
      this.isTenantConversion = true;
      this.isChangePackage = false;
    }
    if (e === 'c') {
      this.isEditCompanyProfile = false;
      this.isTenantConversion = false;
      this.isChangePackage = true;
    }
  }

  /**
   * creation after success
   * @param event to emit event
   */
  getAfterSuccess(event) {
    setTimeout(() => {
      this.poNumberListComponent.loadData(this.tableBaseComponent.searchFilterDto);
    }, 100);
  }

  addNewDep() {
    setTimeout(() => {
    }, 100);
  }

  /**
   * check access for field configuration group
   */
  isAccessFieldConfigurationGroup() {
    return (this.privilegeService.isAuthorizedMultiple([AppAuthorities.MANAGE_ADDITIONAL_FIELDS, AppAuthorities.MANAGE_SHOW_HIDE_FIELDS,
      AppAuthorities.PO_NO_CONFIGURATION]) && (this.isSubAccount || !this.isPortal));
  }

  isAccessGeneralConfiguration() {
    return (this.privilegeService.isAuthorizedMultiple([this.appAuthorities.CONFIGURE_PO_VARIANCE_ALLOWANCE,
      this.appAuthorities.CONFIGURE_MILEAGE_RATE]) && (this.isSubAccount || !this.isPortal));
  }

  isAccessPaymentConfiguration() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.PAYMENT_CONFIGURATION) && (this.isSubAccount || !this.isPortal));
  }

  isAccessFeatureConfiguration() {
    return (this.privilegeService.isAuthorized(this.appAuthorities.FEATURE_CONFIGURATION) && (this.isSubAccount || !this.isPortal));
  }

  isAccessCompanyProfile() {
    return this.privilegeService.isAuthorizedMultiple(
      [this.appAuthorities.COMPANY_PROFILE_EDIT, this.appAuthorities.COMPANY_PROFILE_CONVERT_TO_PORTAL])
  }

  isAccessDepartment() {
    return this.privilegeService.isAuthorizedMultiple(
      [AppAuthorities.DEPARTMENT_CREATE, AppAuthorities.DEPARTMENT_DELETE, AppAuthorities.DEPARTMENT_EDIT,
        AppAuthorities.DEPARTMENT_INACTIVE, AppAuthorities.DEPARTMENT_ACTIVE]);
  }

  accessDepartment() {
    return (this.isAccessDepartment() && (this.isSubAccount || !this.isPortal));
  }

  isAccessFundingAccountCreate() {
    return (this.accessFundingAccount() && (this.isSubAccount || !this.isPortal));
  }

  accessFundingAccount() {
    return this.privilegeService.isAuthorizedMultiple(
      [AppAuthorities.FUNDING_ACCOUNT_CREATE, AppAuthorities.FUNDING_ACCOUNT_EDIT, AppAuthorities.FUNDING_ACCOUNT_DELETE,
        AppAuthorities.FUNDING_ACCOUNT_MARK_AS_DEFAULT, AppAuthorities.FUNDING_ACCOUNT_INACTIVATE,
        AppAuthorities.FUNDING_ACCOUNT_ACTIVATE]);
  }


  deptAddedFromEdit() {
    setTimeout(() => {
      this.poNoConfig.getDepartmentList();
    }, 100);
  }

  /**
   * emit time zone value
   * @param event
   */
  viewNotification(event) {
    this.isHasTimeZone = !!event;
  }

  isReminderConfigurationModule() {
    return (this.privilegeService.isAuthorized(AppAuthorities.REMINDER_CONFIGURATION) && (this.isSubAccount || !this.isPortal));
  }

  /**
   * this method trigger when change general configuration tab
   */
  generalConfigurationTabChange() {
    if (this.mileageConfigurationComponent) {
      this.mileageConfigurationComponent.resetForm();
    }
  }

  /**
   * this method can be used to on clicked menu
   */
  onChangeTab() {
    if (this.configurationMenu[0].label === 'CompanyProfile') {
      this.activeComponent = this.companyProfileConfiguration;
    }
    if (this.configurationMenu[0].label === 'Department') {
      this.activeComponent = this.department;
    }
    if (this.configurationMenu[0].label === 'Field') {
      this.activeComponent = this.componentsInFieldConfiguration;
    }
    if (this.configurationMenu[0].label === 'General') {
      this.activeComponent = this.componentsInGeneralConfiguration;
    }
    if (this.configurationMenu[0].label === 'Field') {
      this.activeComponent = this.componentsInFieldConfiguration;
    }
    if (this.configurationMenu[0].label === 'Payment') {
      this.activeComponent = this.componentsInPaymentConfiguration;
    }
    if (this.configurationMenu[0].label === 'Feature') {
      this.activeComponent = this.componentsInFeatureConfiguration;
    }
    if (this.configurationMenu[0].label === 'ReminderReminder') {
      this.activeComponent = this.componentsInReminderConfigurationConfiguration;
    }
    if (this.configurationMenu[0].label === 'Funding') {
      this.activeComponent = this.componentsInFundingAccountConfiguration;
    }
  }

  ngAfterViewInit(): void {
    this.route.params.subscribe(params => {
        if (params.tab !== undefined) {
            this.tabChanged(parseInt(params.tab));
            this.menuChanged(parseInt(params.tab));
        }
    });
    this.onChangeTab();
  }

  /**
   * this method can be used to get company profilePic data
   */
  menuChange() {
    this.companyProfileService.getTenantDetails().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        const file = res.body?.masterTenantProfilePicture?.pictureData;
        if (file) {
          this.imageUrl = ('data:image/jpg;base64,' + file);
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method is used to store tab index and particular string inside the map
   */
  settingsTabIndexMapInitialize() {
      this.indexAndString.set(AppConstant.TAB_INDEX_OF_COMPANY_PROFILE, AppConstant.COMPANY_PROFILE);
      this.indexAndString.set(AppConstant.TAB_INDEX_OF_DEPARTMENTS, AppConstant.DEPARTMENTS);
      this.indexAndString.set(AppConstant.TAB_INDEX_OF_GENERAL_SETTINGS, AppConstant.GENERAL_SETTINGS);
      this.indexAndString.set(AppConstant.TAB_INDEX_OF_FIELDS_CONFIGURATION, AppConstant.FIELDS_CONFIGURATION);
      this.indexAndString.set(AppConstant.TAB_INDEX_OF_ONLINE_PAYMENTS, AppConstant.ONLINE_PAYMENTS);
      this.indexAndString.set(AppConstant.TAB_INDEX_OF_FEATURE_SETTINGS, AppConstant.FEATURE_SETTINGS);
      this.indexAndString.set(AppConstant.TAB_INDEX_OF_FUNDING_ACCOUNTS, AppConstant.FUNDING_ACCOUNTS);
      this.indexAndString.set(AppConstant.TAB_INDEX_OF_REMINDERS, AppConstant.REMINDERS);
  }

}
