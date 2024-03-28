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
  selector: 'app-qb-configurations',
  templateUrl: './qb-configurations.component.html',
  styleUrls: ['./qb-configurations.component.scss']
})
export class QbConfigurationsComponent implements OnInit, OnChanges {


  @Input() public statusOfSystemButton: boolean; // Status of QB Sync
  @Input() public systemId: any; // Id of QB Sync
  @Input() public systemName: any; // Name of the System
  @Input() public authTypeId: any;
  @Input() public connectionTrigger: any; // Triggers onChange event to get status

  public configurationsList: SyncAccountConfiguration[] = []; // Configuration List on Side Drawer
  public showSpin = false; // Show Spin Until QB  Connect Status Response Comes
  public isConfigsDisabled = false; // Disable the Configuration Switches until an item changed response returns
  public accountSyncForm: UntypedFormGroup;
  public passwordShow = false;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public interval;
  public showConfigurationList = false;
  public showConfigurationListLoaded = false;
  public defaultPassword = '*********';
  public appFormConstants = AppFormConstants;

  constructor(public formBuilder: UntypedFormBuilder, public accountSyncService: AccountSyncService,
              public notificationService: NotificationService) {
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  ngOnInit(): void {
    this.accountSyncForm = this.formBuilder.group({
      sync_user_id: ['', Validators.compose([Validators.required, Validators.maxLength(150)])],
      sync_user_password: ['', Validators.compose([Validators.required, Validators.maxLength(20)])],
    });

    this.getSystemTokenStatus();

    this.interval = setInterval(() => {
      this.getSystemTokenStatus();
    }, 5000);
    // this.configurations();
  }

  /**
   * This method use for get token status of each system
   */
  public getSystemTokenStatus() {
    this.accountSyncService.getSystemTokenStatus(this.systemId).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.statusOfSystemButton = res.body && res.body === AppConstant.STATUS_ACTIVE;
        this.showConfigurationList = res.body && res.body === AppConstant.STATUS_ACTIVE;
        if (res.body === AppConstant.STATUS_ACTIVE) {
          this.getConfigurationsList();
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  configurations() {
    this.accountSyncService.getConfigurationProperties(this.systemId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        if (res.body.papertrlSyncUser) {
          this.accountSyncForm.get(AppFormConstants.SYNC_USER_ID).patchValue(res.body.papertrlSyncUser);
          this.accountSyncForm.get(AppFormConstants.SYNC_USER_PASSWORD).patchValue(this.defaultPassword);
        }
        this.getConfigurationsList();
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
  getConfigurationsList() {
    if (this.showConfigurationListLoaded) {
      return;
    }
    this.accountSyncService.getConfigurationsListQb(this.systemId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.configurationsList = res.body;
        this.showConfigurationListLoaded = true;
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
   * Check the Current status of the system when button click
   */
  connectQb() {
    this.showSpin = true;
    this.statusOfSystemButton = !this.statusOfSystemButton;
    const btnCondition = this.statusOfSystemButton;
    setTimeout(() => {
      this.showSpin = false;
      this.statusOfSystemButton = false;
    }, 2000);
    if (this.statusOfSystemButton) {
      if (this.systemId === AppConstant.SYSTEM_QUCIK_BOOKS_ONLINE) {
        this.connectToQuickBooks(btnCondition);
      }
    } else {
      if (this.systemId === AppConstant.SYSTEM_QUCIK_BOOKS_ONLINE) {
        this.disConnectFromQuickBooks(btnCondition);
      }
    }
  }

  /**
   * Connect to QB
   * @param btnCondition button status
   */
  connectToQuickBooks(btnCondition) {
    this.accountSyncService.getQBOnlineConnectURL().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        window.open(res.body.data, '', 'width=700,height=600');
        this.showConfigurationListLoaded = false;
      } else {
        this.statusOfSystemButton = btnCondition;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.statusOfSystemButton = btnCondition;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Disconnect From QB
   * @param btnCondition button status
   */
  disConnectFromQuickBooks(btnCondition) {
    this.accountSyncService.getDisconnectedFromQBO().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.statusOfSystemButton = !this.statusOfSystemButton;
        this.showConfigurationListLoaded = false;
      } else {
        this.statusOfSystemButton = btnCondition;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.statusOfSystemButton = btnCondition;
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

  isCurrentUser() {
    return this.accountSyncForm.get(AppFormConstants.SYNC_USER_PASSWORD).value === this.defaultPassword;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.connectionTrigger.currentValue === 'BC') {
      this.configurations();
    }
  }

}
