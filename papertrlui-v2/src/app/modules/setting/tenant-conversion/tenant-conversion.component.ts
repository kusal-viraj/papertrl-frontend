import {Component, OnInit} from '@angular/core';
import {CompanyProfileService} from '../../../shared/services/company-profile/company-profile.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppConstant} from '../../../shared/utility/app-constant';
import {LoginLogoutService} from '../../../shared/services/auth/login-logout.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';

@Component({
  selector: 'app-tenant-conversion',
  templateUrl: './tenant-conversion.component.html',
  styleUrls: ['./tenant-conversion.component.scss']
})
export class TenantConversionComponent implements OnInit {

  constructor(public service: CompanyProfileService, public confirmationService: ConfirmationService,
              public loginService: LoginLogoutService, public messageService: MessageService,
              public notificationService: NotificationService) {
  }

  public tenantDetails: any;
  public loader = false;

  ngOnInit(): void {
    this.service.getTenantDetails().subscribe((res: any) => {
      this.tenantDetails = res.body;
    });
  }

  tenantConversion() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.loader = true;
        this.service.tenantConversion(this.tenantDetails.tenantId).subscribe((res: any) => {
          if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
            this.loader = false;
            this.notificationService.successMessage(HttpResponseMessage.CONVERT_TO_PORTAL_SUCCESSFULLY_DONE);
            this.loginService.logOut(false);
          } else {
            this.notificationService.infoMessage(res.body.message);
            this.loader = false;
          }
        }, error => {
          this.notificationService.errorMessage(error);
          this.loader = false;
        });
      }
    });
  }
}
