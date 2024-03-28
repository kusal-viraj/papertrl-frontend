import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {LazyLoadEvent} from 'primeng/api';
import {AppConstant} from '../../../shared/utility/app-constant';
import {InboxDataFilterDto} from '../../../shared/dto/inbox/inbox-data-filter-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {InboxService} from '../../../shared/services/inbox/inbox.service';
import {VirtualScroller} from 'primeng/virtualscroller';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {InboxUtility} from '../inbox-utility';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-processed-list',
  templateUrl: './processed-list.component.html',
  styleUrls: ['./processed-list.component.scss']
})
export class ProcessedListComponent implements OnInit {

  public screenHeight: number;
  public totalRecords: any;
  public isProgressViewInProcessTab: boolean;
  public processDataListLength: number;

  public clickProcessedListAttachmentId = AppConstant.ZERO;
  public attachmentIndex = AppConstant.ZERO;
  public clickIndexInProcess = AppConstant.ZERO;

  public processesList: any [] = [];

  public appAuthorities = AppAuthorities;
  public statusEnums = AppEnumConstants;
  public appConstant = new AppConstant();
  public filterValues: InboxDataFilterDto = new InboxDataFilterDto();
  public inboxUtility: InboxUtility = new InboxUtility(this.inboxService,
    this.notificationService, this.billSubmitService, this.billsService);

  @Input() attachmentIdFromToProcess: any;
  @Input() searchValue: any;
  @Input() isProgressOtherFileDownload = false;
  @Output() emailBodyDetailInProcessList = new EventEmitter();
  @Output() emitAttachmentIndexInProcess = new EventEmitter();
  @Output() attachmentListToHomeScreenFromProcessTab = new EventEmitter();
  @Output() processListObject = new EventEmitter();
  @Output() emitProcesslistLength = new EventEmitter();
  @ViewChild(AppConstant.VIRTUAL_SCROLLER_PROCESS_LIST) processData: VirtualScroller;
  public title: any;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenHeight = window.innerHeight - 350;
  }

  constructor(public notificationService: NotificationService, public inboxService: InboxService, public billsService: BillsService,
              public billSubmitService: BillSubmitService, public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.getAttachmentViewProgressStatus();
    this.onResize();
  }

  /**
   * this method can be used to get attachment inprogress status
   */
  getAttachmentViewProgressStatus() {
    this.inboxService.isChangeAttachmentUrl.subscribe(isProgress => {
      this.isProgressViewInProcessTab = isProgress;
    });
  }

  /**
   * This method execute load data to view
   * @param event to lazy load event
   */
  loadProcessedData(event: any) {
    this.filterValues.first = event.first;
    this.filterValues.rows = event.rows;
    this.filterValues.status = AppConstant.PROCESSES_LIST;
    this.inboxService.searchInboxData(this.filterValues).then((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.processesList = Array.from({length: res.body.totalRecords});
          this.totalRecords = res.body.totalRecords;
          const loadedProducts = res.body.data;

          Array.prototype.splice.apply(this.processesList, [
            ...[event.first, event.rows],
            ...loadedProducts
          ]);
          this.processesList = [...this.processesList];
          this.emitProcesslistLength.emit(this.processesList.filter(x => x !== undefined).length);
          this.processDataListLength = this.processesList.filter(x => x !== undefined).length;
          if (this.processesList.length > AppConstant.ZERO) {
            this.inboxService.isViewEmptyAttachmentContent.next(false);
            this.inboxUtility.getSelectedAttachmentOnloadPage(this.processesList[this.clickIndexInProcess]
              .attachmentList);
            this.clickProcessedListAttachmentId = this.processesList[this.clickIndexInProcess].attachmentList[AppConstant.ZERO].id;
            this.processListObject.emit(this.processesList[this.clickIndexInProcess]);
            this.attachmentListToHomeScreenFromProcessTab.emit(this.processesList[this.clickIndexInProcess]
              .attachmentList);
            if (this.processesList[this.clickIndexInProcess].attachmentList) {
              this.inboxService.attachmentIdInToProcessData.next(this.processesList[this.clickIndexInProcess]
                .attachmentList[AppConstant.ZERO].id);
            }
            this.inboxUtility.getListWiseEmailedByAndFileNameOnClickAttachment(this.processesList[this.clickIndexInProcess],
              this.processesList[this.clickIndexInProcess].attachmentList[AppConstant.ZERO]);
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
   * this method can be used to catch deleted event in the list
   * @param i to index
   * @param processList to deletedData
   */
  listDataClick(i: any, processList: any) {
    this.processListObject.emit(processList);
    this.title = processList.title;
    this.emailBodyDetailInProcessList.emit(null);
    this.attachmentListToHomeScreenFromProcessTab.emit(processList.attachmentList);
    if (this.clickIndexInProcess === i && this.clickIndexInProcess !== undefined) {
      return;
    }
    this.clickIndexInProcess = i;
    this.attachmentIndex = AppConstant.ZERO;
    this.emitAttachmentIndexInProcess.emit(this.attachmentIndex);
    if (this.processesList[i].attachmentList.length > AppConstant.ZERO) {
      this.clickProcessedListAttachmentId = this.processesList[i].attachmentList[AppConstant.ZERO].id;
      this.inboxUtility.generateInboxAttachment(false, this.processesList[i].attachmentList[AppConstant.ZERO].id,
        this.processesList[i].attachmentList[AppConstant.ZERO].fileName, this.processesList[i].attachmentList[AppConstant.ZERO].fileType);
      this.inboxUtility.getListWiseEmailedByAndFileNameOnClickAttachment(this.processesList[this.clickIndexInProcess],
        this.processesList[this.clickIndexInProcess].attachmentList[AppConstant.ZERO]);
    }
  }

  /**
   * this method can be used to move to to process
   * @param attId to attachment id
   */
  moveToProcess(attId) {
    this.inboxService.moveToProcess(attId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
        this.loadProcessedData(this.filterValues);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to download attachment
   * @param attachment to attachment object
   * @param i to attachment index
   * @param processList to process list instance
   */
  attachmentOnClick(attachment, i, processList) {
    this.emailBodyDetailInProcessList.emit(null);
    this.attachmentIndex = i;
    if (attachment.id === null) {
      return;
    } else {
      this.clickProcessedListAttachmentId = attachment.id;
      this.emitAttachmentIndexInProcess.emit(this.attachmentIndex);
      this.attachmentIdFromToProcess = attachment.id;
      this.inboxUtility.generateInboxAttachment(false, attachment.id, attachment.fileName, attachment.fileType);
    }
    this.inboxUtility.getListWiseEmailedByAndFileNameOnClickAttachment(processList, attachment);
  }

  showFullText(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.title = this.title;
  }
}
