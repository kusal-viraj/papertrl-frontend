import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {IntegrationUiUtility} from '../integration-ui-utility';
import {IntegrationService} from '../../../../shared/services/support/integration.service';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {DropdownDto} from "../../../../shared/dto/common/dropDown/dropdown-dto";
import {AppFormConstants} from "../../../../shared/enums/app-form-constants";

@Component({
  selector: 'app-integration-configuration-create',
  templateUrl: './integration-configuration-create.component.html',
  styleUrls: ['./integration-configuration-create.component.scss']
})
export class IntegrationConfigurationCreateComponent implements OnInit {
  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public integrationService: IntegrationService) {
  }

  @Input() editView;
  @Input() configId;
  @Output() success: EventEmitter<any> = new EventEmitter<any>();

  public configurationForm: UntypedFormGroup;
  public integrationUiUtility: IntegrationUiUtility = new IntegrationUiUtility(this.integrationService, this.notificationService);
  public appConstant = new AppConstant();
  SYSTEM_BUSINESS_CENTRAL_CLOUD = AppConstant.SYSTEM_BUISNESS_CENTRAL_CLOUD;
  public showRedirectUrl = false;
  public loading = false;
  public isViewBasicAuthDetails = false;
  public otherData: any;
  public systemList: DropdownDto = new DropdownDto();
  public integrationUserTypes: DropdownDto = new DropdownDto();
  public showIntegratedPayableUserIds = false;
  public systemId: any;


  ngOnInit(): void {
    this.configurationForm = this.formBuilder.group({
      id: [null],
      tenantId: [null, Validators.required],
      systemId: [null, Validators.required],
      redirectUrl: [null],
      baseUrl: [null],
      tpEnvironment: [null],
      tpTenantId: [null],
      integrationSystemTenantId: [null],
      integrationSystemCompanyName: [null],
      pullInitDataFrom: [null],
      integratedPayableUserId: [null]
    });

    this.configurationForm.get(AppFormConstants.TENANT_ID).valueChanges.subscribe(data => this.getIntegrationSystems(data));

    if (this.editView) {
      this.getDataToEdit().then(r => {
        this.systemChanged(this.otherData, this.systemId, false);
      });
    }
  }

  getIntegrationSystems(tenantId) {
    if (!tenantId) {
      this.systemList.data = [];
      return;
    }
    if (this.editView) {
      this.integrationService.getAllIntegrationSystemList().subscribe((res: any[]) => {
        this.systemList.data = res;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      this.integrationService.getIntegrationSystemList(tenantId).subscribe((res: any[]) => {
        this.systemList.data = res;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    if (this.configurationForm.get(fieldName).value) {
      if (this.configurationForm.get(fieldName).value[0] === ' ') {
        this.configurationForm.get(fieldName).patchValue('');
      }
    }
  }

  addSystem() {
    this.loading = true;
    if (this.configurationForm.valid) {
      // if (this.editView) {
      //   this.editConfig();
      // } else {
      this.createConfig();
      // }
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.configurationForm);
    }
  }

  /**
   * Create System
   */
  createConfig() {
    this.integrationService.createConfiguration(this.configurationForm.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.INTEGRATION_CONFIG_CREATED_SUCCESSFULLY);
        this.configurationForm.reset();
        this.loading = false;
        this.success.emit();
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  // /**
  //  * Edit System
  //  */
  // editConfig() {
  //   this.integrationService.editConfiguration(this.configurationForm.value).subscribe((res: any) => {
  //     if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
  //       this.notificationService.successMessage(HttpResponseMessage.INTEGRATION_CONFIG_UPDATED_SUCCESSFULLY);
  //       this.success.emit();
  //       this.loading = false;
  //     } else {
  //       this.loading = false;
  //       this.notificationService.infoMessage(res.body.message);
  //     }
  //   }, error => {
  //     this.loading = false;
  //     this.notificationService.errorMessage(error);
  //   });
  // }

  /**
   * System changed from dropdown
   */
  systemChanged(e: any, id: any, isOnChange: boolean) {
    this.otherData = e;
    this.systemId = id;
    this.showRedirectUrl = e === AppConstant.AUTH_CODE_GRANT_TYPE_ID;
    if (isOnChange) {
      this.showIntegratedPayableUserIds = id === AppConstant.QB_ONLINE_ID;
    }
    this.systemChangedFormValidate();
    this.validateFields(e);
    this.showIntegratedPayableUserIds && this.getIntegrationUserTypes();
  }

  /**
   * Get Data to Edit From Backend
   */
  getDataToEdit() {
    return new Promise<void>(resolve => {
      this.integrationService.getIntegrationConfiguration(this.configId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.showRedirectUrl = !!res.body.redirectUrl;
          this.isViewBasicAuthDetails = !!res.body.baseUrl;
          if (res.body.systemId === AppConstant.QB_ONLINE_ID) {
            this.showIntegratedPayableUserIds = true;
          }
          this.configurationForm.patchValue(res.body);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });
  }

  /**
   * Validate Redirect Url field on system change
   */
  systemChangedFormValidate() {
    const redirectUrl = this.configurationForm.get('redirectUrl');
    const integratedPayableUserIds = this.configurationForm.get('integratedPayableUserId');
    if (this.showRedirectUrl) {
      redirectUrl.setValidators([Validators.required]);
    } else {
      redirectUrl.reset();
      redirectUrl.clearValidators();
    }
    redirectUrl.updateValueAndValidity();

    if (this.showIntegratedPayableUserIds) {
      integratedPayableUserIds.setValidators([Validators.required]);
    } else {
      integratedPayableUserIds.reset();
      integratedPayableUserIds.clearValidators();
    }
    integratedPayableUserIds.updateValueAndValidity();
  }

  /**
   * Reset
   */
  reset() {
    if (this.editView) {
      this.getDataToEdit();
    } else {
      this.configurationForm.reset();
    }
  }

  /**
   * this method can be used to validate integrated tenant id / company name
   * @param e to auth type id
   */
  validateFields(e) {
    const integratedTenantId = this.configurationForm.get('tenantId');
    const integratedCompanyName = this.configurationForm.get('systemId');
    const tpEnvironment = this.configurationForm.get('tpEnvironment');
    this.isViewBasicAuthDetails = (AppConstant.BASIC_AUTH_TYPE_ID === e);
    if (e === AppConstant.BASIC_AUTH_TYPE_ID) {
      integratedTenantId.setValidators(Validators.required);
      integratedCompanyName.setValidators(Validators.required);
    } else {
      integratedTenantId.clearValidators();
      integratedCompanyName.clearValidators();
    }
    if (integratedCompanyName.value == AppConstant.SYSTEM_BUISNESS_CENTRAL_CLOUD) {
      tpEnvironment.setValidators(Validators.required);
    } else {
      tpEnvironment.clearValidators();
    }
    integratedTenantId.updateValueAndValidity();
    integratedCompanyName.updateValueAndValidity();
    tpEnvironment.updateValueAndValidity();
  }

  /**
   * This method can be used to get integrated Payable User id list
   */
  getIntegrationUserTypes() {
    this.integrationService.getIntegrationUserTypes().subscribe((res: any[]) => {
      this.integrationUserTypes.data = res;
    });
  }
}
