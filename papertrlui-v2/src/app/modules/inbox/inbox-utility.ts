import {DropdownDto} from "../../shared/dto/common/dropDown/dropdown-dto";
import {InboxService} from "../../shared/services/inbox/inbox.service";
import {AppConstant} from "../../shared/utility/app-constant";
import {NotificationService} from "../../shared/services/notification/notification.service";
import {BillSubmitService} from "../../shared/services/bills/bill-submit.service";
import {BillsService} from '../../shared/services/bills/bills.service';

export class InboxUtility {
  public sectionList: DropdownDto = new DropdownDto();
  public documentIdList = new DropdownDto();
  public isAttachmentDownloadRequestInProgress = false;

  constructor(public inboxService: InboxService, public notificationService: NotificationService,
              public billSubmitService: BillSubmitService, public billsService: BillsService) {
    this.getSectionList();
  }


  /**
   * this method can be used to get section list
   */
  getSectionList() {
    this.inboxService.getSectionList().subscribe((response: any) => {
      if (response.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        const sections: DropdownDto [] = response.body;
        sections.forEach((section: any, i)=>{
          if(section.id === 5){
            sections.splice(i, 1)
          }
        })
        this.sectionList.data = sections;
      } else {
        this.notificationService.infoMessage(response.body.message);
      }
    }, error => {
      this.notificationService.infoMessage(error);
    })
  }

  /**
   * this method can be used to get section related documents list
   */
  getSectionRelatedDocumentTypeList(moduleId, vendorID) {
    if(moduleId === null || moduleId === undefined){
      return
    }else {
      this.inboxService.getSelectedSectionDocumentList(moduleId, vendorID).subscribe((response: any) => {
        if (response.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.documentIdList.data = response.body;
        } else {
          this.notificationService.infoMessage(response.body.message);
        }
      }, error => {
        this.notificationService.infoMessage(error);
      })
    }
  }

  /**
   * This method use for generate po receipt attachment url
   * @param isDownload boolean is download
   * @param fileName to file name
   * @param fileType to fileType
   * @param id to id
   */
  generateInboxAttachment(isDownload: boolean, id, fileName, fileType) {
    if(fileType !== AppConstant.PDF){
      return;
    }else {
      this.inboxService.isChangeAttachmentUrl.next(true);
      this.inboxService.getInboxAttachment(id).subscribe(res => {
        const formData = new FormData();
        formData.set('file', res.data);
        const file = formData
        this.inboxService.attIdFromInbox.next(id);
        this.inboxService.fileFromInbox.next(file);
        const url = window.URL.createObjectURL(res.data);
        if (isDownload) {
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', fileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this.inboxService.attUrl = url;
          this.isAttachmentDownloadRequestInProgress = false;
          this.inboxService.attachmentUrl.next(this.inboxService.attUrl);
          this.inboxService.isChangeAttachmentUrl.next(false);
          this.inboxService.isRevertProgress.next(false);
        }
      }, error => {
        this.inboxService.isChangeAttachmentUrl.next(false);
        this.inboxService.isRevertProgress.next(true);
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method use for download excel/word file
   * @param isDownload boolean is download
   * @param fileName to file name
   * @param id to id
   */
  downloadOtherFileAttachment(isDownload: boolean, id, fileName) {
    this.inboxService.isDownloadAttachment.next(true);
    this.inboxService.getInboxAttachment(id).subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      if (isDownload) {
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.inboxService.isDownloadAttachment.next(false);
      } else {
        this.inboxService.isDownloadAttachment.next(false);
      }
    }, error => {
      this.inboxService.isDownloadAttachment.next(false);
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used for getSelectedAttachment
   * @param attachmentList to attachment list
   */

  getSelectedAttachmentOnloadPage(attachmentList) {
    if (attachmentList && attachmentList.length >= AppConstant.ONE) {
      this.generateInboxAttachment(false, attachmentList[AppConstant.ZERO].id, attachmentList[AppConstant.ZERO].fileName
      ,attachmentList[AppConstant.ZERO].fileType);
    }
  }

  /**
   * this method can be used to get emailed by and file name attachment wise
   * @param list to tab data list for get emailed user name
   * @param attachment to attachment instance for get file name
   */
  getListWiseEmailedByAndFileNameOnClickAttachment(list, attachment){
    if(attachment === undefined){
      return;
    }else {
      const emailedBy = list.emailAddress;
      const receivedDateTime = list.createdOn;
      const fileName = attachment.fileName;
      const fileType = attachment.fileType;
      const isUpload = list.isUpload;
      this.inboxService.emailedByFileName.next({emailedBy, fileName, receivedDateTime, fileType, isUpload});
    }
  }

  /**
   * this method can be used to manage email check box status
   * @param listData to list items
   * @param idList selected item list
   */

  manageCheckBoxEmailWise(listData: any [], idList: any []){
    listData.forEach(toProcessItem => {
      if (toProcessItem != undefined) {
         return toProcessItem.isChecked = idList.includes(toProcessItem.id);
      }
    })
  }

  /**
   * used for manage check box
   * @param listData to list
   * @param selectedItems to selected attachment list
   */
  manageCheckBox(listData: any [], selectedItems) {
    listData.forEach(toProcessItem => {
      if (toProcessItem != undefined) {
        if (toProcessItem.attachmentList.length > AppConstant.ZERO) {
          this.expandChildrenCheckBox(toProcessItem, toProcessItem.attachmentList, selectedItems);
        }
      }
    })
  }

  /**
   * manage children check box
   * @param toProcessItem to to process data
   * @param attachmentList to attachment list
   * @param selectedItems to selected attachment list
   */
  expandChildrenCheckBox(toProcessItem, attachmentList: any [], selectedItems) {
    attachmentList.forEach(lazyAttachment => {
      return lazyAttachment.isChecked = selectedItems.includes(lazyAttachment.id);
    })
    toProcessItem.isChecked = toProcessItem.attachmentList.every(function (item: any) {
      return item.isChecked == true;
    });
  }
}
