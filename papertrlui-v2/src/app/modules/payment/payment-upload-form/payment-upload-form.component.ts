import {Component, Input, OnDestroy} from '@angular/core';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';
import {NgxDropzoneChangeEvent} from 'ngx-dropzone';

@Component({
  selector: 'app-payment-upload-form',
  templateUrl: './payment-upload-form.component.html',
  styleUrls: ['./payment-upload-form.component.scss']
})
export class PaymentUploadFormComponent implements OnDestroy {

  @Input() documentId;
  public responsePercentage = 0;
  public isDisabled = false;
  public uuid: any;
  public timeInterval: any;
  public attachments = [];

  constructor(public messageService: MessageService, public notificationService: NotificationService,
              public billPaymentService: BillPaymentService, public commonUploadIssueService: CommonUploadIssueService) {

  }

  /**
   * This method can be used to upload user list
   */
  uploadPayments() {
    this.isDisabled = true;
    if (this.attachments.length === 1) {
      this.billPaymentService.uploadPayment(this.attachments[0], this.documentId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.uuid = res.body.uuid;
          this.timeInterval = setInterval(() => {
            this.getUploadedPercentage();
          }, 1000);
        } else {
          this.isDisabled = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isDisabled = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.isDisabled = false;
      this.notificationService.infoMessage(AppConstant.UPLOAD_TEMPLATE_FILE);
    }
  }

  /**
   * This method use for download user list upload template
   */
  downloadUserListTemplate() {
    this.billPaymentService.downloadBillPaymentTemplate(this.documentId).subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download',
        this.documentId === AppDocumentType.EXPENSE_PAYMENT ? 'papertrl_expense_payment_upload_template' : 'papertrl_bill_payment_upload_template');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    }, error => {
      this.notificationService.errorMessage(error);
    }, () => {
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    });
  }

  /**
   * this method can be used to get uploaded percentage
   */
  getUploadedPercentage() {
    this.billPaymentService.getUploadedPercentage(this.uuid).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.responsePercentage = res.body;
        this.responsePercentage = Math.floor(this.responsePercentage);
        if (this.responsePercentage === 100.0) {
          clearInterval(this.timeInterval);
          setTimeout(() => {
            this.getUploadIssues();
          }, 1000);
        }
      } else {
        clearInterval(this.timeInterval);
        this.isDisabled = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      clearInterval(this.timeInterval);
      this.isDisabled = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get upload issues
   */
  getUploadIssues() {
    this.billPaymentService.getUploadedFileIssue(this.uuid).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isDisabled = false;
        this.responsePercentage = 0;
        if (res.body.errors.length > 0) {
          this.commonUploadIssueService.show(UploadNotificationsComponent, res.body);
        } else {
          this.notificationService.successMessage(HttpResponseMessage.FILE_UPLOADED_SUCCESSFULLY);
          this.billPaymentService.offlinePayTableRefresh.next(true);
          this.attachments = [];
        }
      } else {
        this.isDisabled = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isDisabled = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * when leave component clear time interval
   */
  ngOnDestroy() {
    clearInterval(this.timeInterval);
  }

  onRemove(f: any) {
    this.attachments.splice(this.attachments.indexOf(f), 1);
  }

  changeFileList(event: NgxDropzoneChangeEvent) {
    if (event.rejectedFiles.length !== 0) {
      this.notificationService.infoMessage(AppConstant.INVALID_FILE_FORMAT_MSG);
      return;
    }
    this.attachments = event.addedFiles;
  }

  reset() {
    this.attachments = [];
  }
}
