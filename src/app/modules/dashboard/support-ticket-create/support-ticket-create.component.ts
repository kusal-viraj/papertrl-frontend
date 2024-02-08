import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DashboardService} from '../../../shared/services/dashboard/dashboard.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {TaskSettingsService} from '../../../shared/services/support/task-settings-service';
import {IntegrationService} from '../../../shared/services/support/integration.service';
import {FormGuardService} from '../../../shared/guards/form-guard.service';

@Component({
  selector: 'app-support-ticket-create',
  templateUrl: './support-ticket-create.component.html',
  styleUrls: ['./support-ticket-create.component.scss']
})
export class SupportTicketCreateComponent implements OnInit, OnDestroy {

  public formGroup: UntypedFormGroup
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public featureList: DropdownDto = new DropdownDto();
  public tenantIdList: DropdownDto = new DropdownDto();
  public categoryList = [];
  public loading = false;
  public attachments: File[] = [];
  private readonly defaultType = 9;
  @Input() editView = false;
  @Output() onComplete = new EventEmitter()
  public otherFeatureId = 11;

  constructor(public dashboardService: DashboardService, public formBuilder: UntypedFormBuilder,
              public notificationService: NotificationService, public privilegeService: PrivilegeService,
              public taskSettingsService: TaskSettingsService, public integrationService: IntegrationService,
              public formGuardService: FormGuardService) {
  }

  ngOnDestroy(): void {
    this.dashboardService.supportDialogRef.destroy();
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group(
      {
        title: [null],
        summary: [null, Validators.required],
        description: [null, Validators.required],
        customerId: [null],
        attachment: [null],
        typeId: [null],
        featureId: [null, Validators.required],
        otherFeatureDetail: [null],
      })

    this.formGroup.get('featureId').valueChanges.subscribe(data => {
      if (data && data !== this.otherFeatureId) {
        this.formGroup.get('otherFeatureDetail').clearValidators();
        this.formGroup.get('otherFeatureDetail').reset();
      }
    });
    this.getFeatures();
    this.getCategoryList();
    if (this.privilegeService.isSupport()) {
      this.getTenants();
    }
  }

  getFeatures() {
    this.dashboardService.getFeatureList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.featureList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getCategoryList() {
    this.dashboardService.getCategoryList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.categoryList = res.body;
        this.formGroup.get('typeId').patchValue(this.defaultType);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Get tenants in support page
   */
  getTenants() {
    this.integrationService.getTenantIdList().subscribe((res: any[]) => {
        this.tenantIdList.data = res;
        // this.tenantIdList.data.splice(0, 1);
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  closeDrawer() {
    if (this.dashboardService.supportDialogRef) {
      this.dashboardService.supportDialogRef.close();
    }
  }

  reset() {
    this.formGroup.reset();
    this.attachments = [];
    this.formGroup.get('typeId').patchValue(this.defaultType);
  }


  changeFileList(event) {
    this.attachments.push(...event.addedFiles);
  }

  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.attachments.splice(this.attachments.indexOf(event), 1);
  }

  /**
   * Submit Form
   */
  submitForm() {
    this.loading = true;
    if (this.formGroup.valid) {
      this.createTicket();
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.formGroup);
    }
  }

  /**
   * Create Ticket
   * @private
   */
  private createTicket() {
    this.formGroup.get('attachment').patchValue(this.attachments)
    this.dashboardService.createTicket(this.formGroup.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.SUPPORT_TICKET_CREATED_SUCCESSFULLY);
        this.reset();
        this.onComplete.emit();
        this.dashboardService.supportTableList.next(true);
        this.closeDrawer();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }
}
