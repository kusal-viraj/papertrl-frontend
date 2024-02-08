import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
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
  selector: 'app-dno-configurations',
  templateUrl: './dno-configurations.component.html',
  styleUrls: ['./dno-configurations.component.scss']
})
export class DnoConfigurationsComponent implements OnInit {

  @Input() public statusOfSystemButton: boolean; // Status of DNO Sync
  @Input() public systemId: any; // Id of DNO Sync
  @Input() public systemName: any; // Name of the System
  @Input() public authTypeId: any;
  @Input() public connectionTrigger: any; // Triggers onChange event to get status

  public configurationsList: SyncAccountConfiguration[] = []; // Configuration List on Side Drawer
  public configurationView = false; // Configurations Side Drawer
  public isConfigsDisabled = false; // Disable the Configuration Switches until an item changed response returns
  public accountSyncForm: UntypedFormGroup;
  public passwordShow = false;
  public isPasswordShow = false;
  public selectedBcCompanyList = [];
  public dnoCredentialsForm: UntypedFormGroup;
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

    this.dnoCredentialsForm = this.formBuilder.group({
      thirdPartyUsername: ['', Validators.compose([Validators.required])],
      thirdPartyTenantId: [''],
      thirdPartyCompanyId: [''],
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
          this.dnoCredentialsForm.get(AppFormConstants.THIRD_PARTY_USER_NAME).patchValue(res.body.thirdPartySyncUser);
          this.dnoCredentialsForm.get(AppFormConstants.THIRD_PARTY_COMPANY_ID).patchValue(res.body.thirdPartyCompanyId);
          this.dnoCredentialsForm.get(AppFormConstants.THIRD_PARTY_PASSWORD).patchValue(this.defaultPassword);

          if (res.body.thirdPartyCompanyId) {
            this.getConfigurationsList(res.body.thirdPartyCompanyId)
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
   * Get Configurations List
   */
  getConfigurationsList(companyId) {
    this.accountSyncService.getConfigurationsListBc(this.systemId, companyId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.configurationsList = res.body;
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
   * PaperTrl Credentials submit
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
    if (this.dnoCredentialsForm.get(fieldName).value) {
      if (this.dnoCredentialsForm.get(fieldName).value[1] === ' ') {
        this.dnoCredentialsForm.get(fieldName).patchValue('');
      }
    }
  }

  isCurrentUser() {
    return this.accountSyncForm.get(AppFormConstants.SYNC_USER_PASSWORD).value === this.defaultPassword;
  }

  isCurrentBcUser() {
    return this.dnoCredentialsForm.get(AppFormConstants.THIRD_PARTY_PASSWORD).value === this.defaultPassword;
  }


  /**
   * this method can be used to save DNO credentials details
   */
  saveDNOCredentials() {
    if (this.dnoCredentialsForm.valid) {
      const userName = this.dnoCredentialsForm.get(AppFormConstants.THIRD_PARTY_USER_NAME).value;
      const password = this.dnoCredentialsForm.get(AppFormConstants.THIRD_PARTY_PASSWORD).value;
      this.accountSyncService.saveBcDetails(this.systemId, userName,
        password).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(this.systemName + 'credentials saved successfully');
          this.dnoCredentialsForm.reset();
          this.configurations();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      new CommonUtility().validateForm(this.dnoCredentialsForm);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.connectionTrigger.currentValue === 'DNO') {
      this.configurations();
    }
  }

}
