import {Component, OnInit} from '@angular/core';
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';

@Component({
  selector: 'app-bulk-notifications',
  templateUrl: './bulk-notifications.component.html',
  styleUrls: ['./bulk-notifications.component.scss']
})
export class BulkNotificationsComponent implements OnInit {

  public responseData;
  public errors: any [] = [];

  constructor(public bulkNotificationDialogService: BulkNotificationDialogService) {
  }

  ngOnInit(): void {
    this.responseData = this.bulkNotificationDialogService.responseBody;
  }

}
