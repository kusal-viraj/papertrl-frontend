import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DataTableImportMst} from '../../../shared/dto/data-table-import-mst/data-table-import-mst';
import {ItemService} from '../../../shared/services/items/item.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {MessageService} from 'primeng/api';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CommonMessage} from '../../../shared/utility/common-message';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';
import {CustomerInvoiceService} from '../../../shared/services/customer-invoice/customer-invoice.service';

@Component({
  selector: 'app-upload-customer-invoice',
  templateUrl: './upload-customer-invoice.component.html',
  styleUrls: ['./upload-customer-invoice.component.scss']
})
export class UploadCustomerInvoiceComponent implements OnInit, OnDestroy {
  @Output() successEmitter = new EventEmitter();
  public uploadInvoiceForm: UntypedFormGroup;
  public dataTableImportMst: DataTableImportMst = new DataTableImportMst();

  public files: any;
  public uuid: any;
  public timeInterval: any;
  public responsePercentage: any;
  public isDisabled = false;

  constructor(public formBuilder: UntypedFormBuilder, public itemService: ItemService, public notificationService: NotificationService,
              public messageService: MessageService, public commonUploadIssueService: CommonUploadIssueService,
              public customerInvoiceService: CustomerInvoiceService) {
    this.uploadInvoiceForm = this.formBuilder.group({
      importAttachment: ['', Validators.required],
      file: []
    });
  }

  /**
   * This method can be used to select file
   * @param event to change event
   */
  customerInvoiceFileChange(event) {
    if (!event.target.files[0]) {
      new CommonUtility().validateForm(this.uploadInvoiceForm);
      return;
    }

    if ((event.target.files[0].size / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
      setTimeout(() => {
        this.uploadInvoiceForm.reset();
      }, 100);
      return this.notificationService.infoMessage(CommonMessage.INVALID_FILE_SIZE);
    }

    const targetFile = event.target.files[0];
    this.uploadInvoiceForm.patchValue({
      file: targetFile
    });
  }

  /**
   * This method can be used to upload customer invoice list
   */
  uploadCustomerInvoiceList() {
    this.isDisabled = true;
    const file = this.uploadInvoiceForm.get('file').value;
    if (this.uploadInvoiceForm.valid) {
      this.customerInvoiceService.uploadCustomerInvoiceList(file).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.dataTableImportMst = res.body;
          this.dataTableImportMst = res.body;
          this.uuid = res.body.uuid;
          this.timeInterval = setInterval(() => {
            this.getUploadedPercentage();
          }, 1000);
          this.uploadInvoiceForm.reset();
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
      new CommonUtility().validateForm(this.uploadInvoiceForm);
    }
  }

  ngOnInit(): void {
  }

  /**
   * this method can be used to download item template
   */
  downloadCustomerInvoiceTemplate() {
    this.customerInvoiceService.downloadFileFormat().subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'customer_invoice_upload_template');
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
    this.customerInvoiceService.getUploadedPercentage(this.uuid).subscribe((res: any) => {
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
    this.customerInvoiceService.getUploadedFileIssue(this.uuid).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isDisabled = false;
        this.responsePercentage = 0;
        if (res.body.errors.length > 0) {
          this.commonUploadIssueService.show(UploadNotificationsComponent, res.body);
        } else {
          this.notificationService.successMessage(HttpResponseMessage.FILE_UPLOADED_SUCCESSFULLY);
          this.successEmitter.emit(true);
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
