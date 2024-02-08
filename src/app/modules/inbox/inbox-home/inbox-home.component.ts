import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {InboxService} from '../../../shared/services/inbox/inbox.service';
import {ToProcessListComponent} from '../to-process-list/to-process-list.component';
import {ProcessedListComponent} from '../processed-list/processed-list.component';
import {DeletedListComponent} from '../deleted-list/deleted-list.component';
import {InboxDataFilterDto} from '../../../shared/dto/inbox/inbox-data-filter-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {OverlayPanel} from 'primeng/overlaypanel';
import {InboxUtility} from '../inbox-utility';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {TabView} from 'primeng/tabview';
import {
  NotificationEventEmitterService
} from '../../../shared/services/common/notification-event-emitter/notification-event-emitter.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {Subscription} from 'rxjs';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AttachmentViewComponent} from '../../common/attachment-view/attachment-view.component';

@Component({
  selector: 'app-inbox-home',
  templateUrl: './inbox-home.component.html',
  styleUrls: ['./inbox-home.component.scss'],
  encapsulation: ViewEncapsulation.None
})



export class InboxHomeComponent implements OnInit, AfterViewInit {
  public tabIndex = AppConstant.TO_PROCESS_TAB_INDEX;
  public searchValue: any;
  public isEnabledButton = false;
  public isOpenReviewPage = false;
  public isCopied = false;
  public attachmentUrl: any;
  public isAllowedToEditCustomerEmail = false;
  public isEnabledToProcessTabButton = false;
  public isVisibleProgressBar: boolean;
  public isSendToProcessBill: boolean;
  public isViewEmailBodyInToProcessList = false;
  public isViewEmailBodyInProcessList = false;
  public isViewEmailBodyInDeletedList = false;
  public customerEmailAddress: any;
  public customerEmailAddressSplit: any;
  public isProgressSendRequest = false;
  public isAllowedToSendToBillOption = false;
  public isEnabled = false;
  public isSegregatedAttachment = false;
  public attId: any;
  public file: File;
  public segregatedFile: any;
  public fileName: any;
  public unReadEmailCount: any;
  public emailBodyDetail: any;
  public hideAttachmentView = false;
  public splitEventIsInProgress = false;
  public currentInboxAttachmentIndexHome = AppConstant.ZERO;
  public attachmentIdFromInboxHome: any;
  public isProgressSendToBillSegregated = false;
  public isProgressSendToBillNotSegregated = false;
  public isProgressPermanentDeleteAction = false;
  public isProgressRecoverAction = false;
  public isProgressToProcessDeleteAction = false;
  public isButtonEnabledOnload = false;
  public isValidEmail = true;
  public originalValue: any;
  public selectedAttachmentFileType: any;
  public isPdfFileType = false;
  public isDisabledDownloadLink = false;
  public selectedAttachmentName: any;
  public toProcessListLength: number;
  public processListLength: number;
  public deletedListLength: number;

  public filterValues: InboxDataFilterDto = new InboxDataFilterDto();
  public inboxUtility: InboxUtility = new InboxUtility(this.inboxService, this.notificationService, this.billSubmitService, this.billsService);
  public appAuthorities = AppAuthorities;
  public appConstant = new AppConstant();
  public subscription: Subscription;

  public attachmentListFromTab: any [] = [];
  public listObject: any;
  public emailIdList: any [] = [];
  public pageRange: any [] = [];
  public isUploadScreen: boolean;
  public isUploadingScreen: boolean;

  public attachmentFile: any[] = [];
  public tempAttachmentIDs: any[] = [];
  public uploadedFilesId: any[] = [];

  @ViewChild(AppConstant.COMPONENT_TO_PROCESS) public toProcessListComponent: ToProcessListComponent;
  @ViewChild(AppConstant.COMPONENT_PROCESSED) public processedListComponent: ProcessedListComponent;
  @ViewChild(AppConstant.COMPONENT_DELETED) public deletedListComponent: DeletedListComponent;
  @ViewChild('attachmentViewComponent') public attachmentViewComponent: AttachmentViewComponent;
  @ViewChild('overlayPanel') public overlayPanel: OverlayPanel;
  @ViewChild('editOverlay') public editOverlay: OverlayPanel;
  @ViewChild('tabSet') public pTabView: TabView;
  @ViewChild('inputEmail') public inputEmail: ElementRef;
  @ViewChild('inputValue') public inputValue: ElementRef;
  public searchValues: any [] = [];
  public uploadingStatus = false;

  constructor(public notificationService: NotificationService, public inboxService: InboxService,
              public billSubmitService: BillSubmitService, public privilegeService: PrivilegeService,
              public notificationEventEmitter: NotificationEventEmitterService, public billsService: BillsService) {
  }

  ngAfterViewInit(): void {
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.INBOX_REVIEW,
      AppAuthorities.INBOX_DELETE])) {
      this.tabIndex = AppConstant.TAB_INDEX_TO_PROCESS;
      return;
    }
    if (this.privilegeService.isAuthorized(AppAuthorities.INBOX_MOVE_TO_TO_PROCESS)) {
      this.tabIndex = AppConstant.TAB_INDEX_PROCESSED;
      return;
    }
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.INBOX_DELETE,
      AppAuthorities.INBOX_RECOVER])) {
      this.tabIndex = AppConstant.TAB_INDEX_DELETED;
      return;
    }
  }



  ngOnInit(): void {
    this.enabledDisabledHOmeButton();
    this.getAttachmentUrl();
    this.getAttachmentViewProgressStatus();
    this.getUnreadEmailCount();
    this.getCustomerEmailAddress();
    this.isViewEmptyAttachmentContent();
    this.getAttachmentId();
    this.getEmailDetail();
    this.getDownloadStatus();
    this.getSortOrderAction();
  }

  /**
   * this method can be used to get emailed by and file name
   */
  getEmailDetail() {
    this.inboxService.emailedByFileName.subscribe((emailDetail: any) => {
      if (emailDetail !== undefined) {
        this.selectedAttachmentFileType = emailDetail.fileType;
        this.selectedAttachmentName = emailDetail.fileName;
        this.isPdfFileType = (this.selectedAttachmentFileType === AppConstant.PDF);
        if (!this.isPdfFileType) {
          this.inboxService.isChangeAttachmentUrl.next(false);
        }
      }
    });
  }

  /**
   * this method can be used to get emailed by and file name
   */
  getDownloadStatus() {
    this.inboxService.isDownloadAttachment.subscribe(isDisabledDownloadLink => {
      this.isDisabledDownloadLink = isDisabledDownloadLink;
    });
  }


  /**
   * this method can be used to enabled and disabled home buttons
   */
  enabledDisabledHOmeButton() {
    this.inboxService.isButtonEnabled.subscribe(isActiveButton => {
      this.isEnabledButton = isActiveButton;
    });
  }

  /**
   * this method can be used to get attachment url
   */
  getAttachmentUrl() {
    this.inboxService.attachmentUrl.subscribe(url => {
      if (url != null) {
        this.attachmentUrl = url;
      }
    });
  }

  /**
   * This method trigger the when tab changed
   * @param tabIndex to tab index
   */
  onTabChange(tabIndex: any) {
    this.tabIndex = tabIndex;
    switch (tabIndex) {
      case AppConstant.ZERO:
        this.getSortOrderAction();
        this.resetInputValue();
        this.refreshTabCurrentData();
        this.toProcessListComponent.filterValue.clearSorting();

        break;
      case AppConstant.ONE:
        this.getSortOrderAction();
        this.resetInputValue();
        this.refreshTabCurrentData();
        this.processedListComponent.filterValues.clearSorting();
        break;
      case AppConstant.TWO:
        this.getSortOrderAction();
        this.resetInputValue();
        this.refreshTabCurrentData();
        this.deletedListComponent.filterValue.clearSorting();
        break;
    }


    this.isViewEmailBodyInToProcessList = false;
    this.isViewEmailBodyInProcessList = false;
    this.isViewEmailBodyInDeletedList = false;
    this.isPdfFileType = true;
    this.searchData(this.inputValue.nativeElement.value);
    this.currentInboxAttachmentIndexHome = AppConstant.ZERO;
  }

  /**
   * this method can be used to refresh current ta data
   */
  refreshTabCurrentData() {
    this.resetInputValue();
    const values = this.searchValues.find(x => x.label === 'Sort order');
    values.items[0].label = 'Newest on top';
    values.items[1].label = 'Oldest on top';

    if (this.tabIndex === AppConstant.TO_PROCESS_TAB_INDEX && this.toProcessListComponent) {
      this.inboxService.attachmentUrl.next(null);
      this.toProcessListComponent.filterValue.clearSorting();
      this.toProcessListComponent.loadToProcessList(this.toProcessListComponent.filterValue);
    }

    if (this.tabIndex === AppConstant.PROCESS_TAB_INDEX && this.processedListComponent) {
      this.inboxService.attachmentUrl.next(null);
      this.processedListComponent.filterValues.clearSorting();
      this.processedListComponent.loadProcessedData(this.processedListComponent.filterValues);
    }

    if (this.tabIndex === AppConstant.DELETED_TAB_INDEX && this.deletedListComponent) {
      this.inboxService.attachmentUrl.next(null);
      this.deletedListComponent.filterValue.clearSorting();
      this.deletedListComponent.loadDeletedList(this.deletedListComponent.filterValue);
    }

  }

  /**
   * this method can be used to search data
   * @param value to enter value
   */
  searchData(value) {
    if (value === AppConstant.EMPTY_SPACE) {
      this.inputValue.nativeElement.value = AppConstant.EMPTY_STRING;
    }
    if (this.inputValue.nativeElement.value === AppConstant.EMPTY_STRING) {
      value = null;
      this.inputValue.nativeElement.value = null;
    }
    if (this.tabIndex === AppConstant.TO_PROCESS_TAB_INDEX && this.toProcessListComponent) {
      this.toProcessListComponent.filterValue.searchValue = value;
      this.toProcessListComponent.loadToProcessList(this.toProcessListComponent.filterValue);
    }
    if (this.tabIndex === AppConstant.PROCESS_TAB_INDEX && this.processedListComponent) {
      this.processedListComponent.filterValues.searchValue = value;
      this.processedListComponent.loadProcessedData(this.processedListComponent.filterValues);
    }
    if (this.tabIndex === AppConstant.DELETED_TAB_INDEX && this.deletedListComponent) {
      this.deletedListComponent.filterValue.searchValue = value;
      this.deletedListComponent.loadDeletedList(this.deletedListComponent.filterValue);
    }
  }

  /**
   * this method can be used to delete selected mails
   */
  deleteSelectedMail() {
    if (this.tabIndex === AppConstant.TO_PROCESS_TAB_INDEX) {
      this.toProcessListComponent.deleteToProcessEmailWise(this.toProcessListComponent.attachmentIds);
    }
    if (this.tabIndex === AppConstant.DELETED_TAB_INDEX) {
      this.deletedListComponent.deleteAsPermanentEmail(this.deletedListComponent.tempEmailIdList);
    }

  }

  /**
   * this method can be used to recover email
   */
  recoverEmail() {
    if (this.tabIndex === AppConstant.DELETED_TAB_INDEX) {
      this.deletedListComponent.recoverEmail(this.deletedListComponent.tempEmailIdList);
    }
  }

  /**
   * this method can be used to copy customer email address
   * @param clickEvent to click event
   */
  copyEmailAddress(clickEvent) {
    if (this.isCopied) {
      setTimeout(() => {
        this.overlayPanel.hide();
      }, AppConstant.CLIP_BORD_COPY_OVERLAY_CLOSED_TIME_OUT);
    }
  }

  /**
   * emitted button disable status
   * @param event to boolean
   */
  getButtonStatusFromToProcessTab(event) {
    this.isEnabledToProcessTabButton = event;
  }

  /**
   * this method can be used to get attachment inprogress status
   */
  getAttachmentViewProgressStatus() {
    this.inboxService.isChangeAttachmentUrl.subscribe(isProgress => {
      this.isVisibleProgressBar = isProgress;
    });
  }

  /**
   * this method used to get unread email count
   */
  getUnreadEmailCount() {
    this.notificationEventEmitter.notificationsSubscription =
      this.notificationEventEmitter.invokeLoadNotifications.subscribe((notifications) => {
        this.unReadEmailCount = notifications.notReadMail;
      });
  }

  /**
   * this method emit email body value
   * @param event to emit value
   */
  getEmailBodyDetailToProcess(event) {
    if (event) {
      this.isViewEmailBodyInToProcessList = true;
      this.isViewEmailBodyInProcessList = false;
      this.isViewEmailBodyInDeletedList = false;
      this.emailBodyDetail = event;
    } else {
      this.isViewEmailBodyInToProcessList = false;
      this.isViewEmailBodyInProcessList = false;
      this.isViewEmailBodyInDeletedList = false;
    }
  }

  /**
   * this method emit email body value
   * @param event to emit value
   */
  getEmailBodyDetailProcessList(event) {
    if (event) {
      this.isViewEmailBodyInToProcessList = false;
      this.isViewEmailBodyInProcessList = true;
      this.isViewEmailBodyInDeletedList = false;
      this.emailBodyDetail = event;
    } else {
      this.isViewEmailBodyInToProcessList = false;
      this.isViewEmailBodyInProcessList = false;
      this.isViewEmailBodyInDeletedList = false;
    }
  }

  /**
   * this method emit email body value
   * @param event to emit value
   */
  getEmailBodyDeletedList(event) {
    if (event) {
      this.isViewEmailBodyInToProcessList = false;
      this.isViewEmailBodyInProcessList = false;
      this.isViewEmailBodyInDeletedList = true;
      this.emailBodyDetail = event;
    } else {
      this.isViewEmailBodyInToProcessList = false;
      this.isViewEmailBodyInProcessList = false;
      this.isViewEmailBodyInDeletedList = false;
    }
  }

  /**
   * this method can be used to get customer email address
   */
  getCustomerEmailAddress() {
    this.inboxService.getCustomerEmailAddress().subscribe((cusEmail: any) => {
      if (cusEmail.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.customerEmailAddress = cusEmail.body.username;
        if (this.customerEmailAddress !== null) {
          const tempEmailValue = this.customerEmailAddress.split('@');
          this.customerEmailAddressSplit = tempEmailValue[0];
          this.originalValue = tempEmailValue[0];
        }
      } else {
        this.notificationService.infoMessage(cusEmail.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Next Button Enable
   */
  isNextDisable() {
    if (this.attachmentListFromTab === null || this.attachmentListFromTab === undefined ||
      this.attachmentListFromTab.length === 0) {
      return false;
    }
    return (this.attachmentListFromTab.length <= ((this.currentInboxAttachmentIndexHome + 1)));
  }

  /**
   * Previous Button Enable
   */
  isPreviousDisable() {
    if (this.attachmentListFromTab === null || this.attachmentListFromTab === undefined ||
      this.attachmentListFromTab.length === 0) {
      return false;
    }
    return (this.attachmentListFromTab.indexOf(Number(this.attachmentListFromTab[(this.currentInboxAttachmentIndexHome)]))) === 0;
  }

  /**
   * Get next Po Details
   */
  attachmentNext() {
    this.currentInboxAttachmentIndexHome++;
    if (this.attachmentListFromTab[this.currentInboxAttachmentIndexHome].id === null ||
      this.attachmentListFromTab[this.currentInboxAttachmentIndexHome].id === undefined) {
      return;
    } else {
      if (this.tabIndex === AppConstant.TO_PROCESS_TAB_INDEX && this.toProcessListComponent) {
        this.toProcessListComponent.attachmentOnClick(this.attachmentListFromTab[this.currentInboxAttachmentIndexHome],
          this.currentInboxAttachmentIndexHome, this.listObject);
      }
      if (this.tabIndex === AppConstant.PROCESS_TAB_INDEX && this.processedListComponent) {
        this.processedListComponent.attachmentOnClick(this.attachmentListFromTab[this.currentInboxAttachmentIndexHome],
          this.currentInboxAttachmentIndexHome, this.listObject);
      }
      if (this.tabIndex === AppConstant.DELETED_TAB_INDEX && this.deletedListComponent) {
        this.deletedListComponent.attachmentOnClick(this.attachmentListFromTab[this.currentInboxAttachmentIndexHome],
          this.currentInboxAttachmentIndexHome, this.listObject);
      }
    }
  }

  /**
   * Get previous Po Details
   */
  attachmentPrevious() {
    this.currentInboxAttachmentIndexHome--;
    if (this.attachmentListFromTab[this.currentInboxAttachmentIndexHome].id === null ||
      this.attachmentListFromTab[this.currentInboxAttachmentIndexHome].id === undefined) {
      return;
    } else {
      if (this.tabIndex === AppConstant.TO_PROCESS_TAB_INDEX && this.toProcessListComponent) {
        this.toProcessListComponent.attachmentOnClick(this.attachmentListFromTab[this.currentInboxAttachmentIndexHome],
          this.currentInboxAttachmentIndexHome, this.listObject);
      }
      if (this.tabIndex === AppConstant.PROCESS_TAB_INDEX && this.processedListComponent) {
        this.processedListComponent.attachmentOnClick(this.attachmentListFromTab[this.currentInboxAttachmentIndexHome],
          this.currentInboxAttachmentIndexHome, this.listObject);
      }
      if (this.tabIndex === AppConstant.DELETED_TAB_INDEX && this.deletedListComponent) {
        this.deletedListComponent.attachmentOnClick(this.attachmentListFromTab[this.currentInboxAttachmentIndexHome],
          this.currentInboxAttachmentIndexHome, this.listObject);
      }
    }
  }

  /**
   * this method can be used to get click email attachments
   * @param attachments to attachment list
   */
  getClickEmailAttachment(attachments) {
    this.attachmentListFromTab = [];
    this.attachmentListFromTab = attachments;
  }

  /**
   * this method can be used to send request to support team user
   * @param value to enter value
   */
  sendRequestToEditEmail(value) {
    this.isProgressSendRequest = true;
    if (value === null || value === undefined) {
      this.isProgressSendRequest = false;
      return;
    } else {
      this.inboxService.reQuestToUpdateEmail(value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.SEND_REQUEST_TO_EDIT_EMAIL_SUCCESSFULLY);
          this.isProgressSendRequest = false;
          this.editOverlay.hide();

        } else {
          this.isProgressSendRequest = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isProgressSendRequest = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method emit list object onclick/load email
   * @param event to list object
   */
  getListObject(event) {
    this.listObject = null;
    this.listObject = event;
  }


  /**
   * this method get attachment index from tab component
   * @param event to emitted value
   */
  getAttachmentIndex(event) {
    this.currentInboxAttachmentIndexHome = event;
  }

  /**
   * this method subscribe whether empty attachment content view
   */
  isViewEmptyAttachmentContent() {
    this.inboxService.isViewEmptyAttachmentContent.subscribe(isView => {
      if (isView !== null) {
        return this.hideAttachmentView = isView;
      }
    });
  }

  /**
   * this method can be used to get attachment id from home
   */
  getAttachmentId() {
    this.inboxService.attachmentIdInToProcessData.subscribe(attId => {
      this.attachmentIdFromInboxHome = attId;
    });
  }

  /**
   * this metho can be used to get split event status
   * @param event to out put value
   */
  getSplitEventStatus(event) {
    this.splitEventIsInProgress = event;
  }

  /**
   * this method can be used to send data to bill
   */
  sendAttachmentToBill(isFromAttachmentView: boolean, attId) {
    if (!this.isSegregatedAttachment) {
      this.isProgressSendToBillNotSegregated = true;
      this.isSendToProcessBill = true;
      let tempAttachmentIds: any [] = [];
      (isFromAttachmentView && attId) ? tempAttachmentIds.push(attId) : tempAttachmentIds =
        this.toProcessListComponent.attachmentIds;
      if (tempAttachmentIds.length > AppConstant.ZERO) {
        this.inboxService.sendToBill(tempAttachmentIds).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
            tempAttachmentIds = [];
            this.isSegregatedAttachment = false;
            this.isProgressSendToBillNotSegregated = false;
            this.isSendToProcessBill = false;
            this.toProcessListComponent.attachmentIds = [];
            this.toProcessListComponent.loadToProcessList(this.toProcessListComponent.filterValue);
          } else {
            this.isProgressSendToBillNotSegregated = false;
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.isProgressSendToBillNotSegregated = false;
          this.notificationService.errorMessage(error);
        });
      } else {
        return;
      }
    } else {
      this.isProgressSendToBillSegregated = true;
      const tempAttachment: any = new Object();
      tempAttachment.attachmentId = this.attachmentIdFromInboxHome;
      tempAttachment.pageRange = this.pageRange;
      tempAttachment.attachment = this.segregatedFile;
      this.inboxService.sendSegregratedAttachmentToBill(tempAttachment).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isSegregatedAttachment = false;
          this.isProgressSendToBillSegregated = false;
          this.toProcessListComponent.attachmentIds = [];
          this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
          this.toProcessListComponent.loadToProcessList(this.toProcessListComponent.filterValue);
        } else {
          this.isProgressSendToBillSegregated = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isProgressSendToBillSegregated = false;
        this.notificationService.errorMessage(error);
      });
    }

  }

  /**
   * this method get segregrate status
   * @param event to whether is segregrate
   */
  isSegregateAttachment(event) {
    this.isSegregatedAttachment = event;
  }

  /**
   * this method can be used get page range
   * @param event to page range
   */
  getPageRange(event) {
    this.pageRange = event;
  }

  /**
   * this method can be used to get segregrated attachment
   */
  getSplitAttachment(event) {
    this.segregatedFile = event.get('file');
  }

  /**
   * this method can be used to remove empty space
   * @param customerEmailAddressSplit to input value
   */
  removeSpace(customerEmailAddressSplit) {
    if (customerEmailAddressSplit === AppConstant.EMPTY_SPACE) {
      this.customerEmailAddressSplit = AppConstant.EMPTY_STRING;
    }
  }

  /**
   * this method can be used for currant view send to bill
   * @param attId emit to selected attachment id
   */
  sendToBillFromAttachmentView(attId) {
    if (attId) {
      this.sendAttachmentToBill(true, attId);
    }
  }

  /**
   * this method used to get permanent delete status from deleted list
   * @param event to delete status
   */
  getPermanentDeleteStatus(event) {
    this.isProgressPermanentDeleteAction = event;
  }

  /**
   * this method used to get recover status from deleted list
   * @param event to recover status
   */
  getRecoverStatus(event) {
    this.isProgressRecoverAction = event;
  }

  /**
   * this method can be used for get delete action status
   * @param event
   */
  getToProcessDeleteActionStatus(event) {
    this.isProgressToProcessDeleteAction = event;
  }

  /**
   * this method used to emit boolean according to email length onload
   * @param event to boolean value
   */
  getTempEmailLengthOnLoad(event) {
    this.isButtonEnabledOnload = event;
  }

  /**
   * this method validate email address
   * @param enteredValue to entered value
   */
  isValidEmailAddress(enteredValue: string) {
    const email = enteredValue.concat(AppConstant.PAPERTRL_DOMAIN);
    const emailPattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    this.isValidEmail = emailPattern.test(String(email).toLowerCase());
    return this.isValidEmail;
  }

  /**
   * this method can be used to download attachment not file type as pdf
   */
  downloadNotVisibleAttachment() {
    if (this.attachmentIdFromInboxHome) {
      this.inboxUtility.downloadOtherFileAttachment(true, this.attachmentIdFromInboxHome, this.selectedAttachmentName);
    }
  }

  /**
   * this method emit the file type check status
   * @param event to validate status with pdf files
   */
  isPdfFile(event) {
    this.isAllowedToSendToBillOption = event;
  }

  /**
   * this method get to-process list length
   * @param event to emitted value
   */
  getToProcessListLength(event) {
    this.toProcessListLength = event;
  }

  /**
   * this method get process list length
   * @param event to emitted value
   */
  getProcessListLength(event) {
    this.processListLength = event;
  }

  public getSortOrderAction() {
    this.searchValues = [
      {
        label: AppConstant.FLITER_VALUE_SORT_BY,
        items: [
          {
            label: AppConstant.FLITER_LABEL_DATE,
            icon: 'fa-solid fa-check',
            command: () => {
              this.updateSortOrder(AppConstant.FLITER_VALUE_SORT_BY, AppConstant.FLITER_LABEL_DATE);
              this.searchByDate();
            }
          },
          {
            label: AppConstant.FLITER_LABEL_SUBMITED_BY,
            icon: '',
            command: () => {
              this.updateSortOrder(AppConstant.FLITER_VALUE_SORT_BY, AppConstant.FLITER_LABEL_SUBMITED_BY);
              this.searchByFrom();
            }
          },
        ]
      },
      {
        label: AppConstant.FLITER_VALUE_SORT_ORDER,
        items: [
          {
            label: AppConstant.FLITER_LABEL_NEWEST_ON_TOP,
            icon: 'fa-solid fa-check',
            command: () => {
              this.updateSortOrder(AppConstant.FLITER_VALUE_SORT_ORDER, AppConstant.FLITER_LABEL_NEWEST_ON_TOP, AppConstant.FILTER_LABEL_A_TO_Z);
              this.searchByNewsOnTop(this.searchValues[1].items[0].label);
            }
          },
          {
            label: AppConstant.FLITER_LABEL_OLDEST_ON_TOP,
            command: () => {
              this.updateSortOrder(AppConstant.FLITER_VALUE_SORT_ORDER, AppConstant.FLITER_LABEL_OLDEST_ON_TOP, AppConstant.FILTER_LABEL_Z_TO_A);
              this.searchByOldestOnTop(this.searchValues[1].items[1].label);
            }
          }
        ]
      }
    ];
  }

  /**
   * this method get deleted list length
   * @param event to emitted value
   */
  getDeletedListLength(event) {
    this.deletedListLength = event;
  }

  loadingToUploadScreen(upload: string) {
    if (upload === 'upload') {
      this.isUploadScreen = true;
      this.attachmentFile = [];
      this.tempAttachmentIDs = [];
      this.uploadedFilesId = [];
    }
  }

  loadBillSubmitDrawer() {
    this.isUploadingScreen = true;
    this.uploadingStatus = false;
    const uploadStatus = this.tempAttachmentIDs.find(file => file.uploadStatus === 'I');
    const status = this.tempAttachmentIDs.find(file =>  file.status === 'D');
    if (uploadStatus?.uploadStatus || status?.status){
      this.uploadingStatus = true;
    }
  }

  private updateSortOrder(categoryLabel: string, selectedLabel: string, lable?: string) {
    const values = this.searchValues.find(x => x.label === AppConstant.FLITER_VALUE_SORT_ORDER);
    if (selectedLabel === AppConstant.FLITER_LABEL_SUBMITED_BY){
     values.items[0].label = AppConstant.FILTER_LABEL_A_TO_Z;
     values.items[1].label = AppConstant.FILTER_LABEL_Z_TO_A;
    }else if (selectedLabel === AppConstant.FLITER_LABEL_DATE){
      values.items[0].label = AppConstant.FLITER_LABEL_NEWEST_ON_TOP;
      values.items[1].label = AppConstant.FLITER_LABEL_OLDEST_ON_TOP;
    }

    this.searchValues.forEach(category => {
      if (category.label === categoryLabel) {
        category.items.forEach(item => {
          item.icon = (item.label === selectedLabel) || (item.label === lable) ? 'fa-solid fa-check' : '';
        });
      }
    });
  }

  public searchByDate() {
    if (this.toProcessListComponent) {
      this.toProcessListComponent.filterValue.sortValue = AppConstant.FILTER_VALUE_INBOX_CREATED_ON;
      this.toProcessListComponent.loadToProcessList(this.toProcessListComponent.filterValue);
    }

    if (this.processedListComponent) {
      this.processedListComponent.filterValues.sortValue = AppConstant.FILTER_VALUE_INBOX_CREATED_ON;
      this.processedListComponent.loadProcessedData(this.processedListComponent.filterValues);
    }

    if (this.deletedListComponent) {
      this.deletedListComponent.filterValue.sortValue = AppConstant.FILTER_VALUE_INBOX_CREATED_ON;
      this.deletedListComponent.loadDeletedList(this.deletedListComponent.filterValue);
    }
  }

  public searchByFrom() {
    if (this.toProcessListComponent) {
      this.toProcessListComponent.filterValue.sortValue = AppConstant.FILTER_VALUE_INBOX_CREATED_BY;
      this.toProcessListComponent.filterValue.sortOrder = AppConstant.TWO;
      this.toProcessListComponent.loadToProcessList(this.toProcessListComponent.filterValue);
    }

    if (this.processedListComponent) {
      this.processedListComponent.filterValues.sortValue = AppConstant.FILTER_VALUE_INBOX_CREATED_BY;
      this.processedListComponent.filterValues.sortOrder = AppConstant.TWO;
      this.processedListComponent.loadProcessedData(this.processedListComponent.filterValues);
    }

    if (this.deletedListComponent) {
      this.deletedListComponent.filterValue.sortValue = AppConstant.FILTER_VALUE_INBOX_CREATED_BY;
      this.deletedListComponent.filterValue.sortOrder = AppConstant.TWO;
      this.deletedListComponent.loadDeletedList(this.deletedListComponent.filterValue);
    }
  }

  public searchByNewsOnTop(value) {
    if (this.toProcessListComponent) {
      if (value === AppConstant.FLITER_LABEL_NEWEST_ON_TOP){
        this.toProcessListComponent.filterValue.sortOrder = AppConstant.ONE;
      }else if (value === AppConstant.FILTER_LABEL_A_TO_Z){
        this.toProcessListComponent.filterValue.sortOrder = AppConstant.TWO;
      }
      if(this.tabIndex === 0){
        this.toProcessListComponent.loadToProcessList(this.toProcessListComponent.filterValue);
      }
    }

    if (this.processedListComponent) {
      if (value === AppConstant.FLITER_LABEL_NEWEST_ON_TOP){
        this.processedListComponent.filterValues.sortOrder = AppConstant.ONE;
      }else if (value === AppConstant.FILTER_LABEL_A_TO_Z){
        this.processedListComponent.filterValues.sortOrder = AppConstant.TWO;
      }
      if(this.tabIndex === 1) {
        this.processedListComponent.loadProcessedData(this.processedListComponent.filterValues);
      }
    }

    if (this.deletedListComponent) {
      if (value === AppConstant.FLITER_LABEL_NEWEST_ON_TOP){
        this.deletedListComponent.filterValue.sortOrder = AppConstant.ONE;
      }else if (value === AppConstant.FILTER_LABEL_A_TO_Z){
        this.deletedListComponent.filterValue.sortOrder = AppConstant.TWO;
      }
      if(this.tabIndex === 2) {
        this.deletedListComponent.loadDeletedList(this.deletedListComponent.filterValue);
      }
    }
  }

  public searchByOldestOnTop(value) {
    if (this.toProcessListComponent) {
      if (value === AppConstant.FLITER_LABEL_OLDEST_ON_TOP) {
        this.toProcessListComponent.filterValue.sortOrder = AppConstant.TWO;
      } else if (value === AppConstant.FILTER_LABEL_Z_TO_A) {
        this.toProcessListComponent.filterValue.sortOrder = AppConstant.ONE;
      }
      if(this.tabIndex === 0) {
        this.toProcessListComponent.loadToProcessList(this.toProcessListComponent.filterValue);
      }
    }

    if (this.processedListComponent) {
      if (value === AppConstant.FLITER_LABEL_OLDEST_ON_TOP) {
        this.processedListComponent.filterValues.sortOrder = AppConstant.TWO;
      } else if (value === AppConstant.FILTER_LABEL_Z_TO_A) {
        this.processedListComponent.filterValues.sortOrder = AppConstant.ONE;
      }
      if(this.tabIndex === 1) {
        this.processedListComponent.loadProcessedData(this.processedListComponent.filterValues);
      }
    }

    if (this.deletedListComponent) {
      if (value === AppConstant.FLITER_LABEL_OLDEST_ON_TOP) {
        this.deletedListComponent.filterValue.sortOrder = AppConstant.TWO;
      } else if (value === AppConstant.FILTER_LABEL_Z_TO_A) {
        this.deletedListComponent.filterValue.sortOrder = AppConstant.ONE;
      }
      if(this.tabIndex === 2) {
        this.deletedListComponent.loadDeletedList(this.deletedListComponent.filterValue);
      }
    }
  }

  resetInputValue() {
    if (this.inputValue.nativeElement?.value){
      this.inputValue.nativeElement.value = AppConstant.EMPTY_STRING;
      if (this.tabIndex === AppConstant.TO_PROCESS_TAB_INDEX && this.toProcessListComponent) {
        this.toProcessListComponent.filterValue.searchValue = AppConstant.EMPTY_STRING;
      }
      if (this.tabIndex === AppConstant.PROCESS_TAB_INDEX && this.processedListComponent) {
        this.processedListComponent.filterValues.searchValue = AppConstant.EMPTY_STRING;
      }
      if (this.tabIndex === AppConstant.DELETED_TAB_INDEX && this.deletedListComponent) {
        this.deletedListComponent.filterValue.searchValue = AppConstant.EMPTY_STRING;
      }
    }

  }

  onClearSearch(inputElement) {
    inputElement.value = '';
      if (this.tabIndex === AppConstant.TO_PROCESS_TAB_INDEX && this.toProcessListComponent) {
        if(inputElement.value){
          this.toProcessListComponent.loadToProcessList(
            this.toProcessListComponent.filterValue.searchValue = AppConstant.EMPTY_STRING);
        }
      }
      if (this.tabIndex === AppConstant.PROCESS_TAB_INDEX && this.processedListComponent) {
        if(inputElement.value) {
          this.processedListComponent.loadProcessedData(
            this.processedListComponent.filterValues.searchValue = AppConstant.EMPTY_STRING)
        }
      }
      if (this.tabIndex === AppConstant.DELETED_TAB_INDEX && this.deletedListComponent) {
        if(inputElement.value) {
          this.deletedListComponent.loadDeletedList(
            this.deletedListComponent.filterValue.searchValue = AppConstant.EMPTY_STRING)
        }
      }
    }
}
