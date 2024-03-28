import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SyncAccountConfiguration} from "../../../shared/dto/sync-dashboard/sync-account-configuration";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {AppFormConstants} from "../../../shared/enums/app-form-constants";
import {AccountSyncService} from "../../../shared/services/sync-dashboard/account-sync.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {CommonUtility} from "../../../shared/utility/common-utility";

@Component({
  selector: 'app-bc-configurations',
  templateUrl: './bc-configurations.component.html',
  styleUrls: ['./bc-configurations.component.scss']
})
export class BcConfigurationsComponent implements OnInit, OnChanges {


  @Input() public statusOfSystemButton: boolean; // Status of QB Sync
  @Input() public systemId: any; // Id of QB Sync
  @Input() public systemName: any; // Name of the System
  @Input() public authTypeId: any;
  @Input() public connectionTrigger: any; // Triggers onChange event to get status

  public configurationsList: SyncAccountConfiguration[] = []; // Configuration List on Side Drawer
  public configurationView = false; // Configurations Side Drawer
  public showSpin = false; // Show Spin Until QB  Connect Status Response Comes
  public isConfigsDisabled = false; // Disable the Configuration Switches until an item changed response returns
  public accountSyncForm: UntypedFormGroup;
  public passwordShow = false;
  public isPasswordShow = false;
  public bcCompanyList = [];
  public selectedBcCompanyList = [];
  public bcCredentialsForm: UntypedFormGroup;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public defaultPassword = '*********';
  public appFormConstants = AppFormConstants;

  constructor(public formBuilder: UntypedFormBuilder, public accountSyncService: AccountSyncService,
              public notificationService: NotificationService) {
  }


  ngOnInit(): void {
    this.accountSyncForm = this.formBuilder.group({
      sync_user_id: ['', Validators.compose([Validators.required, Validators.maxLength(150)])],
      sync_user_password: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
    });

    this.bcCredentialsForm = this.formBuilder.group({
      thirdPartyUsername: ['', Validators.compose([Validators.required])],
      thirdPartyTenantId: [''],
      thirdPartyCompanyName: [null],
      thirdPartyPassword: ['', Validators.compose([Validators.required])],
    });
    this.configurations();
  }


  configurations() {
    this.configurationView = true;
    this.accountSyncService.getConfigurationProperties(this.systemId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res.body.papertrlSyncUser) {
          this.accountSyncForm.get(AppFormConstants.SYNC_USER_ID).patchValue(res.body.papertrlSyncUser);
          this.accountSyncForm.get(AppFormConstants.SYNC_USER_PASSWORD).patchValue(this.defaultPassword);
        }
        if (res.body.thirdPartySyncUser) {
          this.bcCredentialsForm.get(AppFormConstants.THIRD_PARTY_USER_NAME).patchValue(res.body.thirdPartySyncUser);
          this.bcCredentialsForm.get(AppFormConstants.THIRD_PARTY_TENANT_ID).patchValue(res.body.thirdPartyTenantId);
          this.bcCredentialsForm.get(AppFormConstants.THIRD_PARTY_COMPANY_NAME).patchValue(res.body.thirdPartyCompanyName);
          this.bcCredentialsForm.get(AppFormConstants.THIRD_PARTY_PASSWORD).patchValue(this.defaultPassword);

          if (res.body.thirdPartySyncUser) {
            this.getCompanyList()
          }
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Get Selected Company List
   */
  getSelectedCompanyList() {
    this.accountSyncService.getSelectedCompanyList(this.systemId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.selectedBcCompanyList = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Get Configurations List
   */
  getConfigurationsList(companyId, i) {
    this.accountSyncService.getConfigurationsListBc(this.systemId, companyId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.configurationsList = res.body;
        setTimeout(() => {
          const el = document.getElementById(`company_${i}`);
          el.scrollIntoView({block: 'start', behavior: 'smooth'});
        }, 500);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Toggle Radio button to change configuration
   * @param value toggle radio button value
   */
  configsChanged(value) {
    this.isConfigsDisabled = true;
    const prevCondition = !value.syncable;
    this.accountSyncService.changeConfig(value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isConfigsDisabled = false;
      } else {
        value.syncable = prevCondition;
        this.isConfigsDisabled = false;
      }
    }, error => {
      value.syncable = prevCondition;
      this.isConfigsDisabled = false;
    });
  }

  /**
   * Connect to BC
   * @param btnCondition button status
   */
  getCompanyList() {
    this.accountSyncService.getCompanyList(AppConstant.SYSTEM_BUISNESS_CENTRAL_V15).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.bcCompanyList = res.body;
        this.getSelectedCompanyList();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Company Change event after connecting to quick books
   * @param company
   * @param companyMultiSelect
   */
  companyChanged(company, companyMultiSelect) {
    companyMultiSelect.optionDisabled = 'id';
    this.accountSyncService.saveCompanyData(company.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {

      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      companyMultiSelect.optionDisabled = null;
      companyMultiSelect.setDisabledState(false)
    }, error => {
      companyMultiSelect.optionDisabled = null;
      companyMultiSelect.setDisabledState(false)
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Disconnect From BC
   */
  disConnectFromBc() {
    this.accountSyncService.clearCompanyData().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.bcCompanyList = [];
        this.bcCredentialsForm.get(AppFormConstants.THIRD_PARTY_COMPANY_NAME).patchValue(null);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * On sync Dashboard form submit
   */
  onSubmit() {
    if (this.accountSyncForm.valid) {
      const password = this.accountSyncForm.get(AppFormConstants.SYNC_USER_PASSWORD).value;
      if ((this.accountSyncForm.get(AppFormConstants.SYNC_USER_PASSWORD).value === this.defaultPassword)) {
        return;
      }
      this.accountSyncService.userPrivileges(this.systemId, this.accountSyncForm.get(AppFormConstants.SYNC_USER_ID).value,
        password).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.SYNC_PRIVILEGES);
          this.accountSyncForm.reset();
          this.configurations();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      new CommonUtility().validateForm(this.accountSyncForm);
    }
  }

  /**
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    if (this.accountSyncForm.get(fieldName).value) {
      if (this.accountSyncForm.get(fieldName).value[1] === ' ') {
        this.accountSyncForm.get(fieldName).patchValue('');
      }
    }
  }

  /**
   * remove space if empty space typed
   */
  removeSpaceBcCentralFields(fieldName) {
    if (this.bcCredentialsForm.get(fieldName).value) {
      if (this.bcCredentialsForm.get(fieldName).value[1] === ' ') {
        this.bcCredentialsForm.get(fieldName).patchValue('');
      }
    }
  }

  isCurrentUser() {
    return this.accountSyncForm.get(AppFormConstants.SYNC_USER_PASSWORD).value === this.defaultPassword;
  }

  isCurrentBcUser() {
    return this.bcCredentialsForm.get(AppFormConstants.THIRD_PARTY_PASSWORD).value === this.defaultPassword;
  }


  /**
   * this method can be used to save business central credentials details
   */
  saveBcCredentials() {
    if (this.bcCredentialsForm.valid) {
      const userName = this.bcCredentialsForm.get(AppFormConstants.THIRD_PARTY_USER_NAME).value;
      const password = this.bcCredentialsForm.get(AppFormConstants.THIRD_PARTY_PASSWORD).value;
      this.accountSyncService.saveBcDetails(this.systemId, userName,
        password).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(this.systemName + 'credentials saved successfully');
          this.bcCredentialsForm.reset();
          this.getCompanyList();
          this.configurations();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      new CommonUtility().validateForm(this.bcCredentialsForm);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.connectionTrigger.currentValue === 'QB') {
      this.configurations();
    }
  }

  /**
   * On Accorion Changed
   * @param event accordion event
   */
  onTabOpen(event: any) {
    this.getConfigurationsList(this.selectedBcCompanyList[event.index].id, event.index);
  }
}
