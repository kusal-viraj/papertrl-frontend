import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {MessageService} from 'primeng/api';
import {DataTableImportMst} from '../../../shared/dto/data-table-import-mst/data-table-import-mst';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {AppDocumentType} from "../../../shared/enums/app-document-type";

@Component({
  selector: 'app-payment-offline-upload',
  templateUrl: './payment-offline-upload.component.html',
  styleUrls: ['./payment-offline-upload.component.scss']
})
export class PaymentOfflineUploadComponent implements OnInit, OnDestroy {

  @Input() documentId;
  public uploadPaymentForm: UntypedFormGroup;
  public dataTableImportMst: DataTableImportMst = new DataTableImportMst();
  public issuesArrayLength: any;
  public responsePercentage: any;
  public isBlocked = false;
  public isDisabled = false;
  public uuid: any;
  public timeInterval: any;

  constructor(public formBuilder: UntypedFormBuilder, public messageService: MessageService, public notificationService: NotificationService,
              public billPaymentService: BillPaymentService, public commonUploadIssueService: CommonUploadIssueService) {

    this.uploadPaymentForm = this.formBuilder.group({
      paymentListController: [AppConstant.EMPTY_STRING, Validators.required],
      file: []
    });

  }

  ngOnInit(): void {
  }

  /**
   * This method can be used to select file
   * @param event to change event
   */
  paymentListChange(event) {
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      this.uploadPaymentForm.patchValue({
        file: targetFile
      });
    } else if (event.target.files[0] === undefined) {
      this.uploadPaymentForm.get('paymentListController').markAsDirty();
    }
  }

  /**
   * This method can be used to upload user list
   */
  uploadPayments() {
    this.isDisabled = true;
    if (this.uploadPaymentForm.valid) {
      const file = this.uploadPaymentForm.get('file').value;
      this.billPaymentService.uploadPayment(file, this.documentId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.uuid = res.body.uuid;
          this.timeInterval = setInterval(() => {
            this.getUploadedPercentage();
          }, 1000);
          this.uploadPaymentForm.reset();
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
      new CommonUtility().validateForm(this.uploadPaymentForm);
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
        this.documentId === AppDocumentType.EXPENSE_PAYMENT ?  'papertrl_expense_payment_upload_template' : 'papertrl_bill_payment_upload_template');
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
          this.isBlocked = false;
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
}
