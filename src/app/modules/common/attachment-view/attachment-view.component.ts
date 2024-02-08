import {Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter, TemplateRef} from '@angular/core';
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {InboxService} from "../../../shared/services/inbox/inbox.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {InboxUtility} from "../../inbox/inbox-utility";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-attachment-view',
  templateUrl: './attachment-view.component.html',
  styleUrls: ['./attachment-view.component.scss']
})
export class AttachmentViewComponent implements OnInit {

  @Input() public attachmentUrl: any;
  @Input() public attachmentId: any;
  @Input() public fileName: any;
  @Input() public tabIndex: any;
  @Input() templateRef: TemplateRef<any>;
  @Input() actionBtnList: TemplateRef<any>;
  @Input() public isSendToBillButtonStatusIsDisabled = false;
  @ViewChild('pageFrom') public pageFrom: ElementRef;
  @ViewChild('pageTo') public pageTo: ElementRef;
  @ViewChild('INBOX_SEGREGATE', { static: true }) inboxSegregateTemplate: TemplateRef<any>;
  @Output() public isSegregatedSuccessfully = new EventEmitter();
  @Output() public disabledInboxActionsWhenProgressSplitAction = new EventEmitter();
  @Output() public pageRangeToBill = new EventEmitter();
  @Output() public isConvertToBillFromAttachmentView = new EventEmitter();
  @Output() public isAttachmentMarkAsSegregated = new EventEmitter();
  @Output() isProgressSplitClickEventToHome = new EventEmitter();
  @Output() servePageRange = new EventEmitter();
  @Output() fileFromAttachmentView = new EventEmitter();
  @Output() triggerSendToBillFromAttachmentView = new EventEmitter();

  public appAuthorities = AppAuthorities;
  public inboxUtility: InboxUtility = new InboxUtility(this.inboxService, this.notificationService, this.billSubmitService, this.billsService);

  isOn = false;
  isSplit = false;
  isSplitedSuccess = false;
  isDisabledRevertLink: boolean;
  isRevertLinkEnabled: boolean;
  emailedBy: any;
  selectRecordInvoiceNumber: any;
  receivedDateTime: any;
  pageCount: any;
  isProgressSplitClickEvent = false;
  fileType: any;
  isVisibleToModal = false;
  public isUpload: any;

  constructor(public privilegeService: PrivilegeService, public inboxService: InboxService, public billsService: BillsService,
              public notificationService: NotificationService, public billSubmitService: BillSubmitService) {
  }

  ngOnInit(): void {
    this.getAttachmentViewProgressStatus();
    this.getRevertLinkProgressStatus();
    this.getEmailDetail();
    this.getAttachmentId();
  }

  /**
   * this method can be used to get emailed by and file name
   */
  getEmailDetail() {
    this.inboxService.emailedByFileName.subscribe((emailDetail: any) => {
      if (emailDetail) {
        this.selectRecordInvoiceNumber = emailDetail.fileName;
        this.fileType = emailDetail.fileType;
        this.emailedBy = emailDetail.emailedBy;
        this.receivedDateTime = emailDetail.receivedDateTime;
        this.isUpload = emailDetail.isUpload;
      }
    });
  }

  /**
   * validate split function
   */

  validateSplitFunction(attachmentId, from, to) {
    this.isAttachmentMarkAsSegregated.emit(false);
    this.disabledInboxActionsWhenProgressSplitAction.emit(true);
    this.isProgressSplitClickEventToHome.emit(true) ;
    this.isProgressSplitClickEvent = true;
    let pageRange: number [] = [];
    if (from) {
      pageRange.push(parseInt(from));
    }
    if (to) {
      pageRange.push(parseInt(to));
    }
    this.inboxService.validateSplitFunction(attachmentId, pageRange).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.splitAttachment(this.attachmentId, from, to);
      } else {
        this.isAttachmentMarkAsSegregated.emit(false);
        this.isProgressSplitClickEvent = false;
        this.isProgressSplitClickEventToHome.emit(false) ;
        this.disabledInboxActionsWhenProgressSplitAction.emit(false)
        this.notificationService.infoMessage(res.body.message)
      }
    }, error => {
      this.isAttachmentMarkAsSegregated.emit(false);
      this.isProgressSplitClickEvent = false;
      this.isProgressSplitClickEventToHome.emit(false) ;
      this.disabledInboxActionsWhenProgressSplitAction.emit(false)
      this.notificationService.errorMessage(error);
    })
  }

  /**
   * this method can be used to split the attachment
   */
  splitAttachment(attachmentId, from, to) {
    let pageRange: number [] = [];
    if (from) {
      pageRange.push(parseInt(from));
    }
    if (to) {
      pageRange.push(parseInt(to));
    }
    this.isAttachmentMarkAsSegregated.emit(false);
    this.pageRangeToBill.emit(pageRange);
    if (!(this.attachmentId && pageRange.length > 0)) {
      this.isProgressSplitClickEvent = false;
      this.isAttachmentMarkAsSegregated.emit(false);
      this.isProgressSplitClickEventToHome.emit(false);
      return
    } else {
      this.servePageRange.emit(pageRange);
      this.inboxService.splitAttachment(attachmentId, pageRange).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isAttachmentMarkAsSegregated.emit(true);
          this.isProgressSplitClickEvent = false;
          console.log('start download:', res);
          this.isProgressSplitClickEventToHome.emit(false);
          this.attachmentUrl = window.URL.createObjectURL(res.data);
          const formData = new FormData();
          formData.set('file', res.data);
          this.fileFromAttachmentView.emit(formData);
          this.inboxService.fileFromInbox.next(formData);
        } else {
          this.isProgressSplitClickEvent = false;
          this.isProgressSplitClickEventToHome.emit(false);
          this.notificationService.infoMessage(res.result.body.message);
        }

      }, error => {
        this.isAttachmentMarkAsSegregated.emit(false);
        this.isProgressSplitClickEvent = false;
        this.isProgressSplitClickEventToHome.emit(false);
        this.disabledInboxActionsWhenProgressSplitAction.emit(false)
        this.notificationService.errorMessage(HttpResponseMessage.FAILED_TO_DOWNLOAD_FILE);
      }, () => {
        this.isProgressSplitClickEvent = false;
        this.isSegregatedSuccessfully.emit();
        this.disabledInboxActionsWhenProgressSplitAction.emit(false)
        this.isProgressSplitClickEventToHome.emit(false);
        this.pageTo.nativeElement.value = null;
        this.pageFrom.nativeElement.value = null;
        this.isSplitedSuccess = true;
        this.isVisibleToModal = false;
        this.isOn = false;
        this.isRevertLinkEnabled = true;
      });
    }
  }

  /**
   * this method can be used to get attachment inprogress status
   */
  getAttachmentViewProgressStatus() {
    this.inboxService.isChangeAttachmentUrl.subscribe(isProgress => {
      this.isDisabledRevertLink = isProgress;
    })
  }

  /**
   * this method can be used to revert attachment changes
   */
  revertAttachmentChanges() {
    if (this.attachmentId === null) {
      return
    } else {
      this.inboxService.isRevertProgress.next(true);
      this.inboxUtility.generateInboxAttachment(false, this.attachmentId, this.fileName, this.fileType)
    }
  }

  /**
   * this method can be used to get revert action status
   */
  getRevertLinkProgressStatus() {
    this.inboxService.isRevertProgress.subscribe(isEnabled => {
      this.isRevertLinkEnabled = isEnabled;
    })
  }

  /**
   * this method can be used to get page number count
   */
  getPageCount(event) {
    if (event.pagesCount !== null) {
      this.pageCount = event.pagesCount;
    }
  }

  /**
   * this method can be used to get attachment id from home
   */
  getAttachmentId() {
    this.inboxService.attachmentIdInToProcessData.subscribe(attId =>{
      this.attachmentId = attId;
    });
  }

  /**
   * this method can be used to send to bill
   */
  sendToBill() {
    this.triggerSendToBillFromAttachmentView.emit(this.attachmentId);
  }

  showFullText(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.title = this.selectRecordInvoiceNumber;
  }
}
