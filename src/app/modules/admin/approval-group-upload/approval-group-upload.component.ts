import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {UserApprovalGroupService} from '../../../shared/services/approvalGroup/user-approval-group.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {AppConstant} from '../../../shared/utility/app-constant';
import {DataTableImportMst} from '../../../shared/dto/data-table-import-mst/data-table-import-mst';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';


@Component({
  selector: 'app-approval-group-upload',
  templateUrl: './approval-group-upload.component.html',
  styleUrls: ['./approval-group-upload.component.scss']
})
export class ApprovalGroupUploadComponent implements OnInit, OnDestroy {

  public uploadApprovalGroupForm: UntypedFormGroup;
  public files: File;
  public approvalGroupImportMst: DataTableImportMst = new DataTableImportMst();
  public issueLength: any;
  uuid: any;
  public isDisabled = false;
  timeInterval: any;
  responsePercentage: any;

  constructor(public formBuilder: UntypedFormBuilder, public approvalGroupService: UserApprovalGroupService,
              public messageService: MessageService, public notificationService: NotificationService,
              public commonUploadIssueService: CommonUploadIssueService) {
  }

  ngOnInit(): void {
    this.uploadApprovalGroupForm = this.formBuilder.group({
      fileController: [AppConstant.EMPTY_STRING, Validators.required],
      file: []
    });
  }

  /**
   * This method can be used to select file
   * @param event to change event
   */
  changeApprovalGroupFileUpload(event) {
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      this.uploadApprovalGroupForm.patchValue({
        file: targetFile
      });
    } else if (event.target.files[0] === undefined) {
      this.uploadApprovalGroupForm.get('file').markAsDirty();
    }
  }

  /**
   * This method can be used to upload user list
   */
  uploadApprovalGroupList() {
    this.isDisabled = true;
    const file = this.uploadApprovalGroupForm.get('file').value;
    if (this.uploadApprovalGroupForm.valid) {
      this.approvalGroupService.uploadApprovalGroupUploadTemplate(file).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.approvalGroupImportMst = res.body;
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.uuid = res.body.uuid;
            this.timeInterval = setInterval(() => {
              this.getUploadedPercentage();
            }, 1000);
            this.uploadApprovalGroupForm.reset();
          } else {
            this.isDisabled = false;
            this.notificationService.infoMessage(res.body.message);
          }

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
      new CommonUtility().validateForm(this.uploadApprovalGroupForm);
    }
  }

  /**
   * This method use for download approval group upload template
   */
  downloadApprovalGroupTemplate() {
    this.approvalGroupService.downloadApprovalGroupUploadTemplate().subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'papertrl_approval_group_upload_template');
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

  // /**
  //  * this method can be used to get uploaded percentage
  //  */
  //
  // getUploadedPercentage() {
  //   this.approvalGroupService.getUploadedPercentage(this.uuid).subscribe((res: any) => {
  //     if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
  //       this.responsePercentage = res.body;
  //       this.responsePercentage = Math.floor(this.responsePercentage);
  //       if (this.responsePercentage === 100) {
  //         clearInterval(this.timeInterval);
  //         this.getUploadIssues();
  //       }
  //     } else {
  //       this.isDisabled = false;
  //       clearInterval(this.timeInterval);
  //       this.notificationService.errorMessage(res.body.message);
  //     }
  //   }, error => {
  //     this.isDisabled = false;
  //     clearInterval(this.timeInterval);
  //     this.notificationService.errorMessage(error);
  //   });
  // }

  // /**
  //  * this method can be used to get upload issues
  //  */
  // getUploadIssues() {
  //   this.approvalGroupService.getUploadedFileIssue(this.userId).subscribe((res: any) => {
  //     if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
  //       setTimeout(() => {
  //         this.responsePercentage = 0;
  //       }, 1000);
  //       this.commonUploadIssueService.show(UploadNotificationsComponent, res.body);
  //     } else {
  //       this.notificationService.errorMessage(res.body.message);
  //     }
  //   }, error => {
  //     this.notificationService.errorMessage(error);
  //   });
  // }

  /**
   * this method can be used to get uploaded percentage
   */
  getUploadedPercentage() {
    this.approvalGroupService.getUploadedPercentage(this.uuid).subscribe((res: any) => {
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
    this.approvalGroupService.getUploadedFileIssue(this.uuid).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isDisabled = false;
        this.responsePercentage = 0;
        if (res.body.errors.length > 0) {
          this.commonUploadIssueService.show(UploadNotificationsComponent, res.body);
        } else {
          this.approvalGroupService.updateTableData.next(true);
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
