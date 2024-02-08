import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ProjectCodeService} from '../../../shared/services/project-code/project-code.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {MessageService} from 'primeng/api';
import {DataTableImportMst} from '../../../shared/dto/data-table-import-mst/data-table-import-mst';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {CommonMessage} from '../../../shared/utility/common-message';
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-upload-project-code',
  templateUrl: './upload-project-code.component.html',
  styleUrls: ['./upload-project-code.component.scss']
})
export class UploadProjectCodeComponent implements OnInit, OnDestroy {
  public uploadCodeForm: UntypedFormGroup;
  public files: File;
  public dataTableImportMst: DataTableImportMst = new DataTableImportMst();
  public issuesArrayLength: any;
  uuid: any;
  timeInterval: any;
  responsePercentage: any;
  public isDisabled = false;

  constructor(public formBuilder: UntypedFormBuilder, public codeService: ProjectCodeService,
              public gaService: GoogleAnalyticsService,
              public messageService: MessageService, public notificationService: NotificationService,
              public commonUploadIssueService: CommonUploadIssueService) {
    this.uploadCodeForm = this.formBuilder.group({
      codeListController: ['', Validators.required],
      file: []
    });
  }

  ngOnInit(): void {
  }

  /**
   * This method can be used to select file
   * @param event to change event
   */
  changeProjectCodeUpload(event) {

    if (!event.target.files[0]) {
      new CommonUtility().validateForm(this.uploadCodeForm);
      return;
    }

    if ((event.target.files[0].size / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
      setTimeout(() => {
        this.uploadCodeForm.reset();
      }, 100);
      return this.notificationService.infoMessage(CommonMessage.INVALID_FILE_SIZE);
    }


    const targetFile = event.target.files[0];
    this.uploadCodeForm.patchValue({
      file: targetFile
    });
  }

  /**
   * This method use for download user list upload template
   */
  downloadProjectCodeTemplate() {
    this.codeService.downloadApprovalCodeTemplate().subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'papertrl_project_upload_template');
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
   * This method can be used to upload user list
   */
  uploadProjectCodeList() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.UPLOAD_PROJECT_CODE,
      AppAnalyticsConstants.MODULE_NAME_PROJECT_CODE,
      AppAnalyticsConstants.UPLOAD_PROJECT_CODE,
      AppAnalyticsConstants.UPLOAD_SCREEN,
    );
    this.isDisabled = true;
    const file = this.uploadCodeForm.get('file').value;
    if (this.uploadCodeForm.valid) {
      this.codeService.uploadCodeList(file).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.dataTableImportMst = res.body;
          this.uuid = res.body.uuid;
          this.timeInterval = setInterval(() => {
            this.getUploadedPercentage();
          }, 1000);
          this.uploadCodeForm.reset();
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
      new CommonUtility().validateForm(this.uploadCodeForm);
    }
  }

  /**
   * this method can be used to get uploaded percentage
   */
  getUploadedPercentage() {
    this.codeService.getUploadedPercentage(this.uuid).subscribe((res: any) => {
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
    this.codeService.getUploadedFileIssue(this.uuid).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isDisabled = false;
        this.responsePercentage = 0;
        if (res.body.errors.length > 0) {
          this.commonUploadIssueService.show(UploadNotificationsComponent, res.body);
        } else {
          this.notificationService.successMessage(HttpResponseMessage.FILE_UPLOADED_SUCCESSFULLY);
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
