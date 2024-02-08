import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {MessageService} from 'primeng/api';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {VendorHomeComponent} from "../vendor-home/vendor-home.component";

@Component({
  selector: 'app-vendor-upload',
  templateUrl: './vendor-upload.component.html',
  styleUrls: ['./vendor-upload.component.scss']
})
export class VendorUploadComponent implements OnInit, OnDestroy {

  responsePercentage: any;
  uuid: any;
  timeInterval: any;
  value: any;
  public appAuthorities = AppAuthorities;
  public uploadVendorForm: UntypedFormGroup;
  public isDisabledUploadButton = false;
  public isDisabledUploadAndSendInvitationButton = false;
  public sendInvitation: boolean;


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public vendorService: VendorService, public messageService: MessageService, public vendorHome: VendorHomeComponent,
              public commonUploadIssueService: CommonUploadIssueService, public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.uploadVendorForm = this.formBuilder.group({
      vendorListController: ['', Validators.required],
      file: [null]
    });
  }


  /**
   * This method can be used to upload vendor list
   * @param event to file change event
   */
  vendorListUpload(event) {
    this.uploadVendorForm.get('vendorListController').setValidators(Validators.required);
    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      this.uploadVendorForm.patchValue({
        file: targetFile
      });
    } else {
      this.uploadVendorForm.get('file').patchValue(null);
    }
  }

  /**
   * This method use for download user list upload template
   */
  downloadTemplate() {
    this.vendorService.downloadVendorUploadTemplate().subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'papertrl_vendor_upload_template');
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
   * Upload Vendor List
   */
  uploadVendorList(isUploadAndSendInvitation: boolean) {
    this.sendInvitation = isUploadAndSendInvitation;
    isUploadAndSendInvitation ? this.isDisabledUploadAndSendInvitationButton = true : this.isDisabledUploadButton = true;
    if (this.uploadVendorForm.valid) {
      this.vendorService.uploadVendors(this.uploadVendorForm.value, isUploadAndSendInvitation).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.uuid = res.body.uuid;
            this.timeInterval = setInterval(() => {
              this.getUploadedPercentage();
            }, 1000);
            this.uploadVendorForm.reset();
            this.vendorHome.refreshVendorList();
          } else {
            this.isDisabledUploadButton = false;
            this.isDisabledUploadAndSendInvitationButton = false;
            this.notificationService.infoMessage(res.body.message);
          }
        }, (error => {
          this.isDisabledUploadButton = false;
          this.isDisabledUploadAndSendInvitationButton = false;
          this.notificationService.errorMessage(error);
        })
      );
    } else {
      this.isDisabledUploadButton = false;
      this.isDisabledUploadAndSendInvitationButton = false;
      new CommonUtility().validateForm(this.uploadVendorForm);
    }
  }

  /**
   * this method can be used to get uploaded percentage
   */
  getUploadedPercentage() {
    this.vendorService.getUploadedPercentage(this.uuid).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.responsePercentage = res.body;
        this.responsePercentage = Math.floor(this.responsePercentage);
        if (this.responsePercentage === 100.0) {
          this.isDisabledUploadButton = false;
          this.isDisabledUploadAndSendInvitationButton = false;
          clearInterval(this.timeInterval);
          setTimeout(() => {
            this.getUploadIssues();
          }, 1000);
        }
      } else {
        clearInterval(this.timeInterval);
        this.isDisabledUploadButton = false;
        this.isDisabledUploadAndSendInvitationButton = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      clearInterval(this.timeInterval);
      this.isDisabledUploadButton = false;
      this.isDisabledUploadAndSendInvitationButton = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get upload issues
   */
  getUploadIssues() {
    this.vendorService.getUploadedFileIssue(this.uuid).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isDisabledUploadButton = false;
        this.isDisabledUploadAndSendInvitationButton = false;
        this.responsePercentage = 0;
        if (res.body.errors.length > 0) {
          this.commonUploadIssueService.show(UploadNotificationsComponent, res.body);
        } else {
          if (this.sendInvitation) {
            this.notificationService.successMessage(HttpResponseMessage.FILE_UPLOADED_AND_SEND_INVITATION_SUCCESSFULLY);
          } else {
            this.notificationService.successMessage(HttpResponseMessage.FILE_UPLOADED_SUCCESSFULLY);
          }
        }
      } else {
        this.isDisabledUploadButton = false;
        this.isDisabledUploadAndSendInvitationButton = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isDisabledUploadButton = false;
      this.isDisabledUploadAndSendInvitationButton = false;
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
