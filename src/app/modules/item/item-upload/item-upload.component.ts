import {Component, HostListener, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {DataTableImportMst} from '../../../shared/dto/data-table-import-mst/data-table-import-mst';
import {MessageService} from 'primeng/api';
import {ItemService} from '../../../shared/services/items/item.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {CommonMessage} from "../../../shared/utility/common-message";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-item-upload',
  templateUrl: './item-upload.component.html',
  styleUrls: ['./item-upload.component.scss']
})
export class ItemUploadComponent implements OnInit, OnDestroy {

  public uploadItemForm: UntypedFormGroup;
  public dataTableImportMst: DataTableImportMst = new DataTableImportMst();
  public files: any;
  issuesArrayLength: any;
  uuid: any;
  timeInterval: any;
  responsePercentage: any;
  public isDisabled = false;
  @Output() successEmitter = new EventEmitter();
  constructor(public formBuilder: UntypedFormBuilder, public gaService: GoogleAnalyticsService, public itemService: ItemService, public notificationService: NotificationService,
              public messageService: MessageService, public commonUploadIssueService: CommonUploadIssueService) {
    this.uploadItemForm = this.formBuilder.group({
      itemListController: ['', Validators.required],
      file: []
    });
  }

  /**
   * This method can be used to select file
   * @param event to change event
   */
  itemFileChange(event) {
    if (!event.target.files[0]) {
      new CommonUtility().validateForm(this.uploadItemForm);
      return;
    }

    if ((event.target.files[0].size / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
      setTimeout(() => {
        this.uploadItemForm.reset();
      }, 100);
      return this.notificationService.infoMessage(CommonMessage.INVALID_FILE_SIZE);
    }

    const targetFile = event.target.files[0];
    this.uploadItemForm.patchValue({
      file: targetFile
    });
  }

  /**
   * This method can be used to upload Item list
   */
  uploadItemList() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.UPLOAD_ITEM,
      AppAnalyticsConstants.MODULE_NAME_ITEM,
      AppAnalyticsConstants.UPLOAD_ITEM,
      AppAnalyticsConstants.UPLOAD_SCREEN,
    );
    this.isDisabled = true;
    const file = this.uploadItemForm.get('file').value;
    if (this.uploadItemForm.valid) {
      this.itemService.uploadItemList(file).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.dataTableImportMst = res.body;
          this.dataTableImportMst = res.body;
          this.uuid = res.body.uuid;
          this.timeInterval = setInterval(() => {
            this.getUploadedPercentage();
          }, 1000);
          this.uploadItemForm.reset();
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
      new CommonUtility().validateForm(this.uploadItemForm);
    }
  }

  ngOnInit(): void {
  }

  /**
   * this method can be used to download item template
   */
  downloadItemUploadTemplate() {
    this.itemService.downloadFileFormat().subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'papertrl_item_upload_template');
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
    this.itemService.getUploadedPercentage(this.uuid).subscribe((res: any) => {
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
    this.itemService.getUploadedFileIssue(this.uuid).subscribe((res: any) => {
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
