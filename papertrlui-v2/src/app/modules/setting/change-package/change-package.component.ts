import {Component, OnInit} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {ChangePackage} from '../../../shared/dto/company-profile/change-package';
import {CompanyProfileService} from '../../../shared/services/company-profile/company-profile.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';

@Component({
  selector: 'app-change-package',
  templateUrl: './change-package.component.html',
  styleUrls: ['./change-package.component.scss']
})
export class ChangePackageComponent implements OnInit {
  public changePackage: ChangePackage[];
  public tableSupportBase = new TableSupportBase();
  public anyRequested = false;
  public enums = AppEnumConstants;

  constructor(public companyProfileService: CompanyProfileService, public  messageService: MessageService,
              public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.getTableData();
  }

  getTableData() {
    this.companyProfileService.getPackageDetails().subscribe((res: any) => {
      for (const item of res.body) {
        if (item.status === AppEnumConstants.STATUS_PENDING) {
          this.anyRequested = true;
          break;
        }
      }
      this.changePackage = res.body;
    }, (error) => {
      this.notificationService.errorMessage(error);
    });
  }

  packageChange(item: ChangePackage, i) {

    const packages: ChangePackage[] = this.changePackage;
    packages[i] = item;
    const obj: any = {};
    obj.id = item.id;

    this.companyProfileService.updatePackageDetails(obj).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_CREATED === res.status) {
        this.getTableData();
        this.changePackage = packages;
        this.notificationService.successMessage(HttpResponseMessage.PACKAGE_CHANGE_REQUEST_SEND_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  changeButtonLabels(item) {
    if (item.status === AppEnumConstants.STATUS_PENDING) {
      item.status = AppEnumConstants.STATUS_INACTIVE;
      this.anyRequested = false;
    } else if (item.status === AppEnumConstants.STATUS_INACTIVE) {
      item.status = AppEnumConstants.STATUS_PENDING;
      this.anyRequested = true;
    }
  }

  getStatus(status: any) {
    switch (status) {
      case AppEnumConstants.STATUS_ACTIVE: {
        return AppEnumConstants.LABEL_ACTIVE;
      }
      case AppEnumConstants.STATUS_PENDING: {
        return AppEnumConstants.LABEL_REQUESTED;
      }
      case AppEnumConstants.STATUS_INACTIVE: {
        return AppEnumConstants.LABEL_INACTIVE;
      }
    }
  }

  deleteRequest(item: any, i: any) {
    const packages: ChangePackage[] = this.changePackage;
    packages[i] = item;

    this.companyProfileService.deleteChangeRequest(item.requestId).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.changeButtonLabels(item);
        this.changePackage = packages;
        this.notificationService.successMessage(HttpResponseMessage.PACKAGE_CHANGE_REQUEST_DELETED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }
}
