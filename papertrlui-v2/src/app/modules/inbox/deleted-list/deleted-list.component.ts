import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppConstant} from '../../../shared/utility/app-constant';
import {InboxDataFilterDto} from '../../../shared/dto/inbox/inbox-data-filter-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {InboxService} from '../../../shared/services/inbox/inbox.service';
import {VirtualScroller} from 'primeng/virtualscroller';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {InboxUtility} from '../inbox-utility';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppIcons} from '../../../shared/enums/app-icons';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-deleted-list',
  templateUrl: './deleted-list.component.html',
  styleUrls: ['./deleted-list.component.scss']
})
export class DeletedListComponent implements OnInit {

  public clickIndexInDelete = AppConstant.ZERO;
  public attachmentIndex = AppConstant.ZERO;

  public totalRecords: any;
  public isProgressViewInDeleteTab: boolean;
  public screenHeight: number;
  public deletedDataListLength: number;
  public clickDeletedListAttachmentId = AppConstant.ZERO;

  public filterValue: InboxDataFilterDto = new InboxDataFilterDto();
  public appConstant = new AppConstant();
  public inboxUtility: InboxUtility = new InboxUtility(this.inboxService, this.notificationService, this.billSubmitService, this.billsService);

  public appAuthorities = AppAuthorities;
  public statusEnums = AppEnumConstants;
  public iconEnum = AppIcons;

  public deletedList: any [] = [];
  public idListFromDeletedList: any [] = [];
  public deletedActions: any [] = [];
  public tempEmailIdList: any [] = [];

  @ViewChild(AppConstant.VIRTUAL_SCROLLER_DELETED_LIST) deletedListRef: VirtualScroller;
  @Input() searchValue: any;
  @Input() attachmentIdFromToProcess: any;
  @Input() isDisabledWhenProgressSplitEvent = false;
  @Input() isProgressOtherFileDownload = false;
  @Output() emailBOdyDetailDeletedList = new EventEmitter();
  @Output() isButtonEnabledFromDeletedTabOnload = new EventEmitter();
  @Output() attachmentListToHomeScreenFromDeleteTab = new EventEmitter();
  @Output() deletedListObject = new EventEmitter();
  @Output() emitAttachmentIndexInDeletedTab = new EventEmitter();
  @Output() isProgressPermanentDelete = new EventEmitter();
  @Output() isProgressRecover = new EventEmitter();
  @Output() emitDeletedListLength = new EventEmitter();
  public title: string;


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenHeight = window.innerHeight - 350;
  }

  constructor(public notificationService: NotificationService, public billSubmitService: BillSubmitService, public billsService: BillsService,
              public inboxService: InboxService, public confirmationService: ConfirmationService, public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.refreshTab();
    this.getAttachmentViewProgressStatus();
    this.getDeletedAction();
    this.onResize();
  }

  /**
   * this method can be used to get attachment in progress status
   */
  getAttachmentViewProgressStatus() {
    this.inboxService.isChangeAttachmentUrl.subscribe(isProgress => {
      this.isProgressViewInDeleteTab = isProgress;
    });
  }


  /**
   * this method can be used to catch deleted event in the list
   * @param i to index
   * @param deletedData to deletedData
   */
  listDataClick(i: any, deletedData: any) {
    this.deletedListObject.emit(deletedData);
    this.title = deletedData.title;
    this.attachmentListToHomeScreenFromDeleteTab.emit(deletedData.attachmentList);
    this.emailBOdyDetailDeletedList.emit(null);
    if (this.clickIndexInDelete === i && this.clickIndexInDelete !== undefined) {
      return;
    }
    this.clickIndexInDelete = i;
    this.attachmentIndex = AppConstant.ZERO;
    this.emitAttachmentIndexInDeletedTab.emit(this.attachmentIndex);
    if (this.deletedList[i].attachmentList.length > AppConstant.ZERO) {
      this.clickDeletedListAttachmentId = this.deletedList[i].attachmentList[AppConstant.ZERO].id;
      this.inboxUtility.generateInboxAttachment(false, this.deletedList[i].attachmentList[AppConstant.ZERO].id,
        this.deletedList[i].attachmentList[AppConstant.ZERO].fileName, this.deletedList[i].attachmentList[AppConstant.ZERO].fileType);
      this.inboxUtility.getListWiseEmailedByAndFileNameOnClickAttachment(this.deletedList[this.clickIndexInDelete],
        this.deletedList[this.clickIndexInDelete].attachmentList[AppConstant.ZERO]);
    }
  }

  /**
   * This method execute load data to view
   * @param event to lazy load event
   */
  loadDeletedList(event: any) {
    this.filterValue.first = event.first;
    this.filterValue.rows = event.rows;
    this.inboxService.loadDeletedTabData(this.filterValue).then((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.deletedList = Array.from({length: res.body.totalRecords});
          this.totalRecords = res.body.totalRecords;
          const loadedProducts = res.body.data;
          this.deletedList = Array.from({length: res.body.totalRecords});
          Array.prototype.splice.apply(this.deletedList, [
            ...[event.first, event.rows],
            ...loadedProducts
          ]);
          try {
            event.forceUpdate();
          } catch (e) {
          }
          this.deletedList = [...this.deletedList];
          this.emitDeletedListLength.emit(this.deletedList.filter(x => x !== undefined).length);
          this.deletedDataListLength = this.deletedList.filter(x => x !== undefined).length;
          this.inboxUtility.manageCheckBoxEmailWise(this.deletedList, this.tempEmailIdList);
          this.tempEmailIdList.length > AppConstant.ZERO ? this.isButtonEnabledFromDeletedTabOnload.emit(true) :
            this.isButtonEnabledFromDeletedTabOnload.emit(false);
          if (this.deletedList.length > AppConstant.ZERO) {
            this.inboxService.isViewEmptyAttachmentContent.next(false);
            this.inboxUtility.getSelectedAttachmentOnloadPage(this.deletedList[this.clickIndexInDelete].attachmentList);
            this.clickDeletedListAttachmentId = this.deletedList[this.clickIndexInDelete].attachmentList[AppConstant.ZERO].id;
            this.deletedListObject.emit(this.deletedList[this.clickIndexInDelete]);
            this.attachmentListToHomeScreenFromDeleteTab.emit(this.deletedList[this.clickIndexInDelete].attachmentList);
            if (this.deletedList[this.clickIndexInDelete].attachmentList) {
              this.inboxService.attachmentIdInToProcessData.next(this.deletedList[this.clickIndexInDelete].attachmentList[AppConstant.ZERO].id);
            }
            this.inboxUtility.getListWiseEmailedByAndFileNameOnClickAttachment(this.deletedList[this.clickIndexInDelete],
              this.deletedList[this.clickIndexInDelete].attachmentList[AppConstant.ZERO]);
          } else {
            this.inboxService.isViewEmptyAttachmentContent.next(true);
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * add ids to list
   * @param i to row index
   * @param checkBox to checkbox
   * @param data to row data
   */
  addIdToList(i, data) {
    if (data.isChecked) {
      this.tempEmailIdList.push(data.id);
    } else {
      this.tempEmailIdList.splice(this.tempEmailIdList.findIndex(x => x == data.id), AppConstant.ONE);
    }
    this.tempEmailIdList.length > AppConstant.ZERO ? this.isButtonEnabledFromDeletedTabOnload.emit(true) :
      this.isButtonEnabledFromDeletedTabOnload.emit(false);
  }

  /**
   * this method can be used to delete to process record
   * @param ids) to selected Ids
   */
  deleteAsPermanentEmail(ids) {
    if (ids.length > AppConstant.ZERO) {
      this.confirmationService.confirm({
        message: HttpResponseMessage.WANT_TO_DELETE_SELECTED_EMAIL,
        key: AppConstant.KEY_DELETED_LIST,
        accept: () => {
          this.isProgressPermanentDelete.emit(true);
          this.inboxService.deleteAsPermanent(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
              this.isProgressPermanentDelete.emit(false);
              this.idListFromDeletedList = [];
              this.tempEmailIdList = [];
              this.loadDeletedList(this.filterValue);
            } else {
              this.isProgressPermanentDelete.emit(false);
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.isProgressPermanentDelete.emit(false);
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  /**
   * this method can be used to delete to process record
   * @param ids) to selected Ids
   */
  recoverEmail(ids) {
    if (ids.length > AppConstant.ZERO) {
      this.isProgressRecover.emit(true);
      this.inboxService.recoverEmail(ids).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
          this.isProgressRecover.emit(false);
          this.idListFromDeletedList = [];
          this.tempEmailIdList = [];
          this.loadDeletedList(this.filterValue);
        } else {
          this.isProgressRecover.emit(false);
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isProgressRecover.emit(false);
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to delete "deleted list" attachment
   * @param id to attachment id
   */
  attachmentDeleteAsPermanent(id) {
    if (id === null) {
      return;
    } else {
      this.confirmationService.confirm({
        message: HttpResponseMessage.WANT_TO_DELETE_SELECTED_ATTACHMENT,
        key: AppConstant.KEY_DELETED_LIST,
        accept: () => {
          this.inboxService.deleteAttachmentFromDeletedList(id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
              this.idListFromDeletedList.splice(this.idListFromDeletedList.findIndex(x => x === id), AppConstant.ONE);
              this.tempEmailIdList.splice(this.tempEmailIdList.findIndex(x => x === id), AppConstant.ONE);
              this.loadDeletedList(this.filterValue);
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }


  /**
   * this method can be used to recover attachment from deleted list
   * @param id to selected attachment id
   */
  recoverSingleAttachment(id) {
    if (id === null) {
      return;
    } else {
      this.inboxService.recoverAttachmentFromDeletedList(id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
          this.idListFromDeletedList.splice(this.idListFromDeletedList.findIndex(x => x === id), AppConstant.ONE);
          this.tempEmailIdList.splice(this.tempEmailIdList.findIndex(x => x === id), AppConstant.ONE);
          this.loadDeletedList(this.filterValue);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * this method can be used to download attachment
   * @param attachment to attachment object
   * @param i to attachment index
   * @param deletedList to deleted list
   */
  attachmentOnClick(attachment, i, deletedList) {
    this.emailBOdyDetailDeletedList.emit(null);
    this.attachmentIndex = i;
    if (attachment.id === null) {
      return;
    } else {
      this.clickDeletedListAttachmentId = attachment.id;
      this.emitAttachmentIndexInDeletedTab.emit(this.attachmentIndex);
      this.attachmentIdFromToProcess = attachment.id;
      this.inboxUtility.generateInboxAttachment(false, attachment.id, attachment.fileName, attachment.fileType);
    }
    this.inboxUtility.getListWiseEmailedByAndFileNameOnClickAttachment(deletedList, attachment);
  }

  /**
   * refresh to process data list after delete tab action success
   */
  refreshTab() {
    this.inboxService.refreshDeletedTabList.subscribe(isAllowedToRefresh => {
      if (!isAllowedToRefresh) {
        return;
      } else {
        this.loadDeletedList(this.filterValue);
      }
    });
  }

  /**
   * this method can be used to get deleted attachments
   */
  getDeletedAction() {
    this.deletedActions = [];
    this.deletedActions.push({
        label: AppActionLabel.DELETED_LIST_DELETE,
        icon: this.iconEnum.ICON_DELETE,
        status: this.statusEnums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INBOX_DELETE),
        command: () => {
          this.attachmentDeleteAsPermanent(this.clickDeletedListAttachmentId);
        }
      },
      {separator: true},
      {
        label: AppActionLabel.DELETED_LIST_RECOVER,
        icon: this.iconEnum.RECOVER_ICON,
        status: this.statusEnums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INBOX_RECOVER),
        command: () => {
          this.recoverSingleAttachment(this.clickDeletedListAttachmentId);
        }
      });
  }

  /**
   * Change action button array list according to status
   */
  actionButtonList() {
    return this.deletedActions.filter(this.isActionMatch(AppEnumConstants.STATUS_COMMON));
  }


  /**
   * This method use for filter table action match by element status
   * @param common to status common
   */
  isActionMatch(common) {
    return function f(element) {
      return (element.status === common && element.authCode);
    };
  }

  showFullText(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.title = this.title;
  }
}
