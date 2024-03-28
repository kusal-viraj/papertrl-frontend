import {Component, HostListener, OnDestroy, OnInit, Output, EventEmitter} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AccountService} from '../../../shared/services/accounts/account.service';
import {DataTableImportMst} from '../../../shared/dto/data-table-import-mst/data-table-import-mst';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {CommonMessage} from '../../../shared/utility/common-message';
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-account-upload',
  templateUrl: './account-upload.component.html',
  styleUrls: ['./account-upload.component.scss']
})
export class AccountUploadComponent implements OnInit, OnDestroy {
  public accountUploadForm: UntypedFormGroup;
  public dataTableImportMst: DataTableImportMst = new DataTableImportMst();
  public issuesArrayLength: any;
  public isDisabled = false;
  uuid: any;
  timeInterval: any;
  responsePercentage: any;
  @Output() successEmitter = new EventEmitter();

  constructor(public formBuilder: UntypedFormBuilder, public accountService: AccountService,
              public notificationService: NotificationService, public gaService: GoogleAnalyticsService,
              public messageService: MessageService,
              public commonUploadIssueService: CommonUploadIssueService) {
  }

  ngOnInit(): void {
    this.accountUploadForm = this.formBuilder.group({
      accountListController: ['', Validators.required],
      file: []
    });
  }

  /**
   * This method use for download account template
   */
  downloadAccountListTemplate() {
    this.accountService.downloadAccountListUploadTemplate().subscribe(res => {
      const url = window.URL.createObjectURL(res.data);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'papertrl_chart_of_account_upload_template');
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
   * This method can be used to upload account list
   */
  uploadAccountList() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.UPLOAD_ACCOUNT,
      AppAnalyticsConstants.MODULE_NAME_ACCOUNT,
      AppAnalyticsConstants.UPLOAD_ACCOUNT,
      AppAnalyticsConstants.UPLOAD_SCREEN,
    );
    this.isDisabled = true;
    const file = this.accountUploadForm.get('file').value;
    if (this.accountUploadForm.valid) {
      this.accountService.uploadAccountList(file).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.dataTableImportMst = res.body;
          this.uuid = res.body.uuid;
          this.timeInterval = setInterval(() => {
            this.getUploadedPercentage();
          }, 1000);
          this.accountUploadForm.reset();
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
      new CommonUtility().validateForm(this.accountUploadForm);
    }
  }


  changeFileInput(event: any, field) {
    field.get(AppConstant.ATTACHMENT).reset();


  }


  /**
   * When change the user list
   * @param event to change event
   */

  changeAccountList(event) {
    if (!event.target.files[0]) {
      new CommonUtility().validateForm(this.accountUploadForm);
      return;
    }

    if ((event.target.files[0].size / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
      setTimeout(() => {
        this.accountUploadForm.reset();
      }, 100);
      return this.notificationService.infoMessage(CommonMessage.INVALID_FILE_SIZE);
    }


    const targetFile = event.target.files[0];
    this.accountUploadForm.patchValue({
      file: targetFile
    });
  }

  /**
   * this method can be used to get uploaded percentage
   */
  getUploadedPercentage() {
    this.accountService.getUploadedPercentage(this.uuid).subscribe((res: any) => {
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
    this.accountService.getUploadedFileIssue(this.uuid).subscribe((res: any) => {
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
