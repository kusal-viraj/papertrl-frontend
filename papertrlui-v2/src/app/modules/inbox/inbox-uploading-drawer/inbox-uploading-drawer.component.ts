import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {InboxService} from '../../../shared/services/inbox/inbox.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';


@Component({
  selector: 'app-inbox-uploading-drawer',
  templateUrl: './inbox-uploading-drawer.component.html',
  styleUrls: ['./inbox-uploading-drawer.component.scss']
})
export class InboxUploadingDrawerComponent implements OnInit {

  @Output() isClickBackButton = new EventEmitter<boolean>();
  @Output() loadToProcessingQueue = new EventEmitter<boolean>();
  @Input() files: any [] = [];
  public tempFile: any [] = [];
  @Input() tempAttachmentIDs: any [] = [];
  @Input() uploadingStatus = false;
  @Input() progressValue = 0;
  @Input() uploadedFilesId: any[] = [];



  constructor(public notificationService: NotificationService,
              public inboxService: InboxService) {
  }

  ngOnInit(): void {

  }

  backToList() {
    if (this.uploadingStatus) {
      this.tempAttachmentIDs = [];
      this.uploadingStatus = false;
      this.isClickBackButton.emit(true);
      this.loadToProcessingQueue.emit(true);
    } else if (this.uploadingStatus) {
      this.tempAttachmentIDs = [];
      this.isClickBackButton.emit(true);
      this.uploadingStatus = false;
      this.loadToProcessingQueue.emit(true);
    } else {
      this.notificationService.infoMessage(AppConstant.PENDING_FILE_UPLOADS);
    }
  }

  uploadFiledList({addedFiles, rejectedFiles}) {
    if (rejectedFiles.length !== 0 && addedFiles.length === 0) {
      this.notificationService.infoMessage(AppConstant.INVALID_FILE_FORMAT_MSG);
      return;
    }
    this.uploadingStatus = false;
    const status = this.uploadingStatus;


    for (const file of addedFiles) {
      let uniqueId;
      do {
        uniqueId = Math.floor(Math.random() * 100);
      } while (this.files.some(item => item.uniqueId === uniqueId));

      this.files.push({ file, uniqueId, fileName: file.name, status });
      this.tempFile.push(
        {file, uniqueId, fileName: file.name}
      );
    }
    const attachmentFiles = {
      attachmentDtoList: this.tempFile
    };

    this.inboxService.uploadEmails(attachmentFiles).subscribe(
      (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.uploadingStatus = true;
          this.tempFile = [];
          res.body.attachmentList.forEach(tempAttachment => {
            this.tempAttachmentIDs.push(tempAttachment);
            if (tempAttachment.message){
              this.notificationService.infoMessage(tempAttachment.message);
            }
            for (const temp of this.tempAttachmentIDs) {
                const matchingFile = this.files.find(file => file.uniqueId === temp.timeStamp);
                matchingFile.id = temp.id;
                if (temp.status === AppConstant.FAIL) {
                  matchingFile.status = AppConstant.UPLOADED_FILE_FAIL_STATUS;
                  }else if (temp.status === AppConstant.SUCCESS_STATUS){
                  matchingFile.status = AppConstant.UPLOADED_FILE_SUCCESS_STATUS;
                }
              }
            this.disableButtons();
          });
        } else {
          this.notificationService.infoMessage(res.body.message);
          this.tempFile = [];
        }
      },
      error => {
        this.notificationService.errorMessage(error);
        this.tempFile = [];
      }
    );
  }


  sendToProcessUploadedFiles() {
    this.uploadedFilesId = [];
    const uploadedFilterIds: any[] = this.files.filter(x => x.status !== AppConstant.FAIL_STATUS);
    uploadedFilterIds?.forEach(temp => {
         if (temp.id != null){
            this.uploadedFilesId.push(temp.id);
          }
      });

    this.inboxService.sendToIdListUploadedFiles(this.uploadedFilesId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {

        this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
        this.loadToProcessingQueue.emit(true);
        this.isClickBackButton.emit(true);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });

  }


  closeUploading(fileId) {
    const index = this.files.findIndex(f => f.id === fileId);
    // const attachmentID = this.uploadedFilesId.findIndex(f => f.id === fileId);
    if (index !== -1) {
      this.files.splice(index, 1);
      // this.uploadedFilesId.splice(attachmentID, 1);
    }
    console.log(this.files);
  }


  cancelAllUploadedList() {
    this.tempAttachmentIDs = [];
    this.uploadingStatus = false;
    this.uploadedFilesId = [];
    this.isClickBackButton.emit(true);
    this.loadToProcessingQueue.emit(true);
  }

  disableButtons(){
    const uploadStatus = this.tempAttachmentIDs.find(file => file.uploadStatus === 'I');
    const status = this.tempAttachmentIDs.find(file =>  file.status === 'D');
    if (uploadStatus?.uploadStatus || status?.status){
      this.uploadingStatus = true;
    }
  }

}
