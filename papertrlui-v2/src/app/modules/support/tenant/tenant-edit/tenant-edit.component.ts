import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {MessageService} from 'primeng/api';
import {TenantDto} from '../../../../shared/dto/tenant/tenant-dto';
import {TenantService} from '../../../../shared/services/support/tenant.service';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {DropdownDto} from '../../../../shared/dto/common/dropDown/dropdown-dto';

@Component({
  selector: 'app-tenant-edit',
  templateUrl: './tenant-edit.component.html',
  styleUrls: ['./tenant-edit.component.scss']
})
export class TenantEditComponent implements OnInit {

  public tenantEditForm: UntypedFormGroup;

  public tenantDto: TenantDto = new TenantDto();
  public loading = false;
  public packageList: DropdownDto = new DropdownDto();

  @Input() isEditForm: boolean;
  @Input() panel: boolean;
  @Input() id: any;
  @Output() refreshTable = new EventEmitter();

  constructor(public formBuilder: UntypedFormBuilder, public tenantService: TenantService,
              public notificationService: NotificationService, public messageService: MessageService) {
  }


  ngOnInit(): void {
    this.initFormGroup();
    this.getTenantData(this.id);
    this.getTenantPackage();
  }

  /**
   * this method can be used to initialize form tenant
   */
  initFormGroup() {
    this.tenantEditForm = this.formBuilder.group({
      packageId: [null, Validators.compose([Validators.required])],
    });
  }

  /**
   * This method use for Submit Edit Form
   */
  onSubmit(form) {
    this.loading = true;
    if (this.tenantEditForm.valid) {
      this.tenantDto = Object.assign(this.tenantDto, form);
      this.updateTenant(this.tenantDto);
    } else {
      this.loading = false;
    }
  }

  /**
   * Update Tenant Data
   * @param tenantDto to tenantEditForm instance
   */
  updateTenant(tenantDto) {
    const tenantId = this.id;
    const packageId = tenantDto.packageId;

    if (this.tenantEditForm.valid) {
      this.tenantService.updateTenant(tenantId, packageId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.loading = false;
          this.notificationService.successMessage(HttpResponseMessage.TENANT_UPDATED_SUCCESSFULLY);
          this.refreshTable.emit();
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
      new CommonUtility().validateForm(this.tenantEditForm);
    }
  }

  /**
   * This method use for load tenant package data to dropdown
   */
  getTenantPackage() {
    this.tenantService.getPackagesDetails().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.packageList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get tenant data form service
   */
  getTenantData(id) {
      this.tenantService.getTenantData(id).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.tenantEditForm.patchValue({
            packageId: res.body.id
          });
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * This method use for reset tenant form
   */
  resetForm() {
    this.tenantEditForm.reset();
    this.getTenantData(this.id);
  }
}
