import {Component, Input, OnInit} from '@angular/core';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-expense-pdf-view',
  templateUrl: './expense-pdf-view.component.html',
  styleUrls: ['./expense-pdf-view.component.scss']
})
export class ExpensePdfViewComponent implements OnInit {

  @Input() attachmentId: any;
  @Input() expenseMasterDto;
  public expenseAttachmentUrl: any;
  public originalFileName: string;

  constructor(public notificationService: NotificationService, public expenseService: ExpenseService,
              public sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.generateExpenseAttachmentUrl(false);
  }

  /**
   * This method use for  download attachment
   */
  generateExpenseAttachmentUrl(isDownload: boolean) {
    if (!this.attachmentId) {
      return;
    } else {
      this.expenseService.downloadExpenseAttachment(this.attachmentId).subscribe(res => {
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
          this.expenseAttachmentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#zoom=70');
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

}
