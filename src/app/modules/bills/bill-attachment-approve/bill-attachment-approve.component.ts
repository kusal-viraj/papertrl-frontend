import {Component, Input, OnInit} from '@angular/core';
import {BillApproveDto} from '../../../shared/dto/bill/bill-approve-dto';
import {AppMessageService} from '../../../shared/enums/app-message-service';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';

@Component({
  selector: 'app-attachment-approve',
  templateUrl: './bill-attachment-approve.component.html',
  styleUrls: ['./bill-attachment-approve.component.scss']
})
export class BillAttachmentApproveComponent implements OnInit {

  @Input() billId;
  @Input() attachmentId;
  @Input() billDetail: BillApproveDto;
  billUrl: any;
  private originalFileName: string;

  constructor(public billSubmitService: BillSubmitService, public notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.generateBillUrl(false, this.attachmentId);
  }

  /**
   * This method use for generate Bill receipt url
   * @param isDownload boolean
   * * @param id to id
   */
  generateBillUrl(isDownload: boolean, id) {
    if (id === undefined || id === null) {
      return
    } else {
      this.billSubmitService.getBillAttachment(id).subscribe(res => {
        const url = window.URL.createObjectURL(res.data);
        if (isDownload) {
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', this.originalFileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this.billUrl = url;
        }
      }, error => {
        this.notificationService.errorMessage({
          severity: AppMessageService.SUMMARY_ERROR,
          summary: AppMessageService.SUMMARY_ERROR,
          detail: error.message
        });
      });
    }
  }
}
