import {Component, OnInit} from '@angular/core';
import {AccountSyncService} from '../../../shared/services/sync-dashboard/account-sync.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {NotificationService} from '../../../shared/services/notification/notification.service';

@Component({
  selector: 'app-sync-dashboard-home',
  templateUrl: './sync-dashboard-home.component.html',
  styleUrls: ['./sync-dashboard-home.component.scss']
})
export class SyncDashboardHomeComponent implements OnInit {

  constructor(public accountSyncService: AccountSyncService, public notificationService: NotificationService) {
  }

  public tabName = 'Accounting';
  public isDc: boolean; // Is the System QB
  public isQbConnected: boolean; // Status of QB Sync
  public systemId: any; // Status of QB Sync
  public authTypeId: any;
  public categoryList: any[] = []; // Category List
  public showNoIntegrationSystems = false; // Message for Empty Systems

  ngOnInit(): void {
    this.accountSyncService.getCategoryList().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.categoryList = res.body;
        this.showNoIntegrationSystems = !this.categoryList.length;
        this.tabName = res.body[0].name;
        this.isDc = res.body[0].authTypeId === AppConstant.CONNECTOR_AUTH_TYPE_ID;
        this.isQbConnected = res.body[0].tokenStatus !== null  && res.body[0].tokenStatus === 'A';
        this.systemId = res.body[0].id;
        this.authTypeId = res.body[0].authTypeId;
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

}
