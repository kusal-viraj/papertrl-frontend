import {Component, Input, OnInit} from '@angular/core';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-po-receipts-view',
  templateUrl: './po-receipts-view.component.html',
  styleUrls: ['./po-receipts-view.component.scss']
})
export class PoReceiptsViewComponent implements OnInit {
  @Input() receiptIds: any [] = [];
  receiptUrl: any;
  currentIndex = AppConstant.ZERO;
  public appConstant = new AppConstant();

  constructor(public billsService: BillsService, public notificationService: NotificationService,
              public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.loadSelectedAttachment(this.receiptIds[AppConstant.ZERO]);
  }

  /**
   * download receipt
   * @param receiptId to receipt id
   */
  loadSelectedAttachment(receiptId) {
    this.receiptUrl = null;
    this.billsService.viewReport(receiptId).subscribe((res: any) => {
      if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.receiptUrl = window.URL.createObjectURL(res.data);
        this.getSafeUrl(this.receiptUrl);
      } else {
        this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Security Bypass for PDF Url
   */
  getSafeUrl(url) {
      this.receiptUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
  }
}
