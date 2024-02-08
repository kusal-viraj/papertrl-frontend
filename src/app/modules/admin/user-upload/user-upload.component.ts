import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../shared/services/user/user.service';
import {MessageService} from 'primeng/api';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';

@Component({
  selector: 'app-user-upload',
  templateUrl: './user-upload.component.html',
  styleUrls: ['./user-upload.component.scss']
})
export class UserUploadComponent implements OnInit, OnDestroy {
  public uploadUserForm: UntypedFormGroup;
  private files: any;
  responsePercentage: any;
  isBlocked = false;
  userId: any;
  timeInterval: any;
  value: any;
  isDisabled = false;

  constructor(public formBuilder: UntypedFormBuilder, public userService: UserService, public messageService: MessageService,
              public notificationService: NotificationService, public commonUploadIssueService: CommonUploadIssueService) {
    this.uploadUserForm = this.formBuilder.group({
      userListController: ['', Validators.required],
      file: []
    });
  }

  ngOnInit(): void {
  }

  /**
   * This method use for download user list upload template
   */
  downloadUserListTemplate() {
    this.userService.downloadUserListUploadTemplate().subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'papertrl_user_upload_template');
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
  uploadUserList() {
    this.isDisabled = true;
    const file = this.uploadUserForm.get('file').value;
    if (this.uploadUserForm.valid) {
      this.userService.uploadUserList(file).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.userId = res.body.uuid;
          this.timeInterval = setInterval(() => {
            this.getUploadedPercentage();
          }, 1000);
          this.uploadUserForm.reset();
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
      new CommonUtility().validateForm(this.uploadUserForm);
    }
  }

  /**
   * When change the user list
   * @param event to change event
   */

  userListChange(event) {
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      this.uploadUserForm.patchValue({
        file: targetFile
      });
    } else if (event.target.files[0] === undefined) {
      new CommonUtility().validateForm(this.uploadUserForm);
    }
  }

  /**
   * this method can be used to get uploaded percentage
   */

  getUploadedPercentage() {
    this.userService.getUploadedPercentage(this.userId).subscribe((res: any) => {
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
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      clearInterval(this.timeInterval);
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get upload issues
   */
  getUploadIssues() {
    this.userService.getUploadedFileIssue(this.userId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isDisabled = false;
        this.responsePercentage = 0;
        if (res.body.errors.length > 0) {
          this.commonUploadIssueService.show(UploadNotificationsComponent, res.body);
        } else {
          this.userService.updateTableData.next(true);
          this.notificationService.successMessage(HttpResponseMessage.FILE_UPLOADED_SUCCESSFULLY);
        }
      } else {
        this.isDisabled = false;
        this.notificationService.errorMessage(res.body.message);
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
