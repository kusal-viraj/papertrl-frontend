import {Component, EventEmitter, Input, Output} from '@angular/core';
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {InboxService} from "../../../shared/services/inbox/inbox.service";

@Component({
  selector: 'app-inbox-upload-drawer',
  templateUrl: './inbox-upload-drawer.component.html',
  styleUrls: ['./inbox-upload-drawer.component.scss']
})
export class InboxUploadDrawerComponent {

  @Input() fromProcess: boolean;
  @Input() files: any [] = [];
  public tempFile: any [] = [];
  @Input() tempAttachmentIDs: any [] = [];
  @Input() uploadedFilesId: any[] = [];
  @Input() uploadingStatus =  false;
  @Output() isUploadSuccess = new EventEmitter<boolean>();
  public loading = false;
  public matchingFile: any;



  constructor(public notificationService: NotificationService, public inboxService: InboxService) {
  }

  changeFiledList(event) {
    if (event.rejectedFiles.length !== 0 && event.addedFiles.length === 0) {
      this.notificationService.infoMessage(AppConstant.INVALID_FILE_FORMAT_MSG);
      this.loading = false;
      return;
    }
    this.loading = true;
    this.isUploadSuccess.emit(true);
    const status = this.uploadingStatus;

    for (const file of event.addedFiles) {
      let uniqueId;
      do {
        uniqueId = Math.floor(Math.random() * 100);
      } while (this.files.some(item => item.uniqueId === uniqueId));

      this.files.push({ file, uniqueId, fileName: file.name, status });
      this.tempFile.push({file, uniqueId, fileName: file.name});
    }


    const attachmentFiles = {
      attachmentDtoList: this.tempFile
    };


    this.inboxService.uploadEmails(attachmentFiles).subscribe(
      (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          res.body.attachmentList.forEach(tempAttachment => {
            this.files.find(x => x.id === tempAttachment.uniqueId).id = tempAttachment.id;
            this.tempAttachmentIDs.push(tempAttachment);
            this.tempFile = [];
            this.isUploadSuccess.emit(true);
            this.loading = false;
            if(tempAttachment.message){
                this.notificationService.infoMessage(tempAttachment.message);
            }
            for (const temp of this.tempAttachmentIDs) {
              const matchingFile = this.files.find(file => file.uniqueId === temp.timeStamp);
              matchingFile.id = temp.id;
              if (temp.status === AppConstant.FAIL) {
                matchingFile.status = AppConstant.UPLOADED_FILE_FAIL_STATUS;
              } else if (temp.status === AppConstant.SUCCESS_STATUS) {
                matchingFile.status = AppConstant.UPLOADED_FILE_SUCCESS_STATUS;
              }
            }
          });
        } else {
          this.notificationService.infoMessage(res.body.message);
          this.tempFile = [];
        }
      },
      error => {
        this.notificationService.errorMessage(error);
        this.files = [];
        this.tempFile = [];
      }
    );
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

}
