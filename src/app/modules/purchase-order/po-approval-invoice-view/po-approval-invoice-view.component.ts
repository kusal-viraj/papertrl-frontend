import {Component, Input, OnInit} from '@angular/core';
import {PoService} from '../../../shared/services/po/po.service';
import {MessageService} from 'primeng/api';
import {AppMessageService} from '../../../shared/enums/app-message-service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-po-approval-invoice-view',
  templateUrl: './po-approval-invoice-view.component.html',
  styleUrls: ['./po-approval-invoice-view.component.scss']
})
export class PoApprovalInvoiceViewComponent implements OnInit {

  public originalFileName: string;
  public poUrl: any;
  @Input() attachmentId: any;

  constructor(public poService: PoService, public messageService: MessageService, public sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.generateReceiptUrl(false);
  }

  /**
   * This method use for generate po receipt attachemnt url
   * @param isDownload boolean
   */
  generateReceiptUrl(isDownload: boolean) {
    if (!this.attachmentId) {
      return;
    } else {
      this.poService.getPoAttachment(this.attachmentId).subscribe(res => {
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
          this.poUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
        }
      }, error => {
        this.messageService.add({
          severity: AppMessageService.SUMMARY_ERROR,
          summary: AppMessageService.SUMMARY_ERROR,
          detail: error.message
        });
      });
    }
  }


}
