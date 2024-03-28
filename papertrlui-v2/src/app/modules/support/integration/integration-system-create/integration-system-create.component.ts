import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {IntegrationUiUtility} from '../integration-ui-utility';
import {IntegrationService} from '../../../../shared/services/support/integration.service';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../../shared/utility/common-utility';

@Component({
  selector: 'app-integration-system-create',
  templateUrl: './integration-system-create.component.html',
  styleUrls: ['./integration-system-create.component.scss']
})
export class IntegrationSystemCreateComponent implements OnInit {


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public integrationService: IntegrationService) {
  }

  public systemForm: UntypedFormGroup;
  public integrationUiUtility: IntegrationUiUtility = new IntegrationUiUtility(this.integrationService, this.notificationService);
  public loading = false;
  public isOAuth = false;
  public systemNameExists = false;

  @Input() editView;
  @Input() systemId;
  @Output() success: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.systemForm = this.formBuilder.group({
      id: [],
      name: [null, Validators.required],
      authTypeId: [null, Validators.required],
      typeId: [null, Validators.required],
      clientId: [null],
      clientSecret: [null],
      grantTypeId: [null],
      scope: [null],
      apiSubscriptionKey: [null],
    });

    if (this.editView) {
      this.getDataToEdit();
    }

  }


  /**
   * remove space if empty space typed
   */
  removeSpace(fieldName) {
    if (this.systemForm.get(fieldName).value) {
      if (this.systemForm.get(fieldName).value[0] === ' ') {
        this.systemForm.get(fieldName).patchValue('');
      } else if (fieldName === 'name') {
        this.systemId = this.editView ? this.systemId : 0;
        this.integrationService.getSystemExists(this.systemForm.get(fieldName).value, this.systemId).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.systemNameExists = res.body;
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }

    }
  }

  /**
   * Validate form when Auth dropdown changed
   */
  authDropdownChanged() {
    const clientId = this.systemForm.get('clientId');
    const clientSecret = this.systemForm.get('clientSecret');
    const grantType = this.systemForm.get('grantTypeId');
    const scopes = this.systemForm.get('scope');
    const apiSubscriptionKey = this.systemForm.get('apiSubscriptionKey');

    if (this.isOAuth) {
      clientId.setValidators([Validators.required]);
      clientSecret.setValidators([Validators.required]);
      grantType.setValidators([Validators.required]);
      scopes.setValidators([Validators.required]);
    } else {

      clientId.reset();
      clientSecret.reset();
      grantType.reset();
      scopes.reset();
      apiSubscriptionKey.reset();

      clientId.clearValidators();
      clientSecret.clearValidators();
      grantType.clearValidators();
      scopes.clearValidators();

    }
    clientId.updateValueAndValidity();
    clientSecret.updateValueAndValidity();
    grantType.updateValueAndValidity();
    scopes.updateValueAndValidity();
  }

  /**
   * Add New System Submission
   */
  addSystem() {
    this.loading = true;
    if (this.systemForm.valid && !this.systemNameExists) {
      let scopes;
      if (this.systemForm.get('scope').value) {
        for (const item of this.systemForm.get('scope').value) {
          if (!scopes) {
            scopes = item;
          } else {
            scopes = scopes + ',' + item;
          }
        }
      }
      if (this.editView) {
        this.editSystem(scopes);
      } else {
        this.createSystem(scopes);
      }
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.systemForm);
    }
  }

  /**
   * Create a new System
   */
  createSystem(scopes) {
    const obj = this.systemForm.value;
    obj.scope = scopes;
    this.integrationService.createIntegrationSystem(obj).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.INTEGRATION_SYSTEM_CREATED_SUCCESSFULLY);
        this.systemForm.reset();
        this.success.emit();
        this.loading = false;
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Edit System
   */
  editSystem(scopes) {
    const obj = this.systemForm.value;
    obj.scope = scopes;
    this.integrationService.createIntegrationSystem(obj).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.INTEGRATION_SYSTEM_UPDATED_SUCCESSFULLY);
        this.success.emit();
        this.loading = false;
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Change Selected Auth Types
   */
  authTypeChanged(e) {
    this.isOAuth = e.value === AppConstant.OAUTH_AUTH_TYPE_ID;
    this.authDropdownChanged();
  }

  /**
   * Get Data to Edit From Backend
   */
  getDataToEdit() {
    this.integrationService.getIntegrationSystem(this.systemId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isOAuth = res.body.authTypeId === AppConstant.OAUTH_AUTH_TYPE_ID;
        this.systemForm.patchValue(res.body);
        let arr;
        if (res.body.scope){
          arr = res.body.scope.split(',');
        }
        this.systemForm.get('scope').patchValue(arr);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Edit Form
   */
  reset() {
    if (this.editView) {
      this.getDataToEdit();
    } else {
      this.systemForm.reset();
    }
  }
}
