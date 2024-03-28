import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AppConstant} from "../../../shared/utility/app-constant";
import {InboxDataFilterDto} from "../../../shared/dto/inbox/inbox-data-filter-dto";
import {InboxUtility} from "../inbox-utility";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {AppIcons} from "../../../shared/enums/app-icons";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {VirtualScroller} from "primeng/virtualscroller";
import {Checkbox} from "primeng/checkbox";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {InboxService} from "../../../shared/services/inbox/inbox.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppActionLabel} from "../../../shared/enums/app-action-label";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {CommonUtility} from "../../../shared/utility/common-utility";

@Component({
  selector: 'app-processing-queue-list',
  templateUrl: './processing-queue-list.component.html',
  styleUrls: ['./processing-queue-list.component.scss']
})
export class ProcessingQueueListComponent implements OnInit{

  public isVisibleAttachedToModal = false;
  public isSaveButtonEventInProgress = false;

  public isProgressView: boolean;
  public vendorName: any;
  public tabIndex: any;
  public totalRecords: any;
  public attachmentId: any;
  public attId: any;
  public screenHeight: number;
  public toProcessDataLength: number;

  public clickToProcessedListAttachmentId = AppConstant.ZERO;
  public clickIndexInToProcess = AppConstant.ZERO;
  public attachmentIndex = AppConstant.ZERO;

  public toProcessedList: any [] = [];

  public tpProcessedOptions: any [] = [];
  public attachmentsList: any [] = [];
  public emailIdList: any [] = [];
  public attachmentList: any[];
  public attachmentIds: any [] = [];
  public numberOfPdfFileTypes: any [] = [];

  public filterValue: InboxDataFilterDto = new InboxDataFilterDto();
  public inboxUtility: InboxUtility = new InboxUtility(this.inboxService, this.notificationService, this.billSubmitService, this.billsService);
  public attachedToForm: UntypedFormGroup;

  public iconEnum = AppIcons;
  public appAuthorities = AppAuthorities;
  public statusEnums = AppEnumConstants;
  public appConstant = new AppConstant();
  public vendors: DropdownDto = new DropdownDto();

  @ViewChild(AppConstant.VIRTUAL_SCROLLER_TO_PROCESS_LIST) toProcessed: VirtualScroller;
  @ViewChild(AppConstant.CHECK_BOX_REFERENCE) checkbox: Checkbox;
  @Input() searchValue: any;
  @Output() isButtonEnabledFromToProcessTab = new EventEmitter();

  @Output() isPdfFile = new EventEmitter();
  @Input() attachmentIdFromToProcess: any;
  @Input() toProcessedListValue: string;
  @Input() processedListValue: string;
  @Input() fileFromToProcess: any;
  @Input() attIdFromToProcess: any;
  @Input() isDisabledWhenProgressSplitEvent = false;
  @Input() isProgressOtherFileDownload = false;
  @Input() selectedEmailIdList: any;
  @Output() emailBOdyDetail = new EventEmitter();
  @Output() toProcessListObject = new EventEmitter();
  @Output() emitAttachmentIndexInToProcess = new EventEmitter();
  @Output() attachmentListToHomeScreenFromToProcessTab = new EventEmitter();
  @Output() isProgressToProcessAction = new EventEmitter();
  @Output() emitToProcesslistLength = new EventEmitter();
  public sortOrder: string;
  public sortValue: string;
  public clickProcessedListAttachmentId = AppConstant.ZERO;
  public processedValue: any;


  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenHeight = window.innerHeight - 280;
  }

  constructor(public notificationService: NotificationService, public inboxService: InboxService,
              public formBuilder: UntypedFormBuilder, public billsService: BillsService,
              public billSubmitService: BillSubmitService, public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.filterValue.rows = 10;
    this.initAttachedToForm();
    this.refreshAfterDeleteAttachmentFromView();
    this.refreshTab();
    this.getVendorList();
    this.getAttachmentViewProgressStatus();
    this.getToProcessOption();
    this.getAttachmentId();
    this.onResize();
  }

  /**
   * this method can be used to get system all vendors
   */
  getVendorList() {
    this.billsService.getVendorList(true).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.vendors.data = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get attachment inprogress status
   */
  getAttachmentViewProgressStatus() {
    this.inboxService.isChangeAttachmentUrl.subscribe(isProgress => {
      this.isProgressView = isProgress;
    });
  }

  /**
   * This method execute load data to view
   * @param event to lazy load event
   */
  loadToProcessList(event: any, toProcessedListValue?,processedListValue?,filterByDate?,
                    filterByFrom?,sortOrder?,htmlloader?) {
    this.filterValue.first = event.first;
    this.filterValue.rows =  event.rows || 10;
    this.filterValue.searchValue = event.searchValue;
    // if(!htmlloader){
    //   if(toProcessedListValue){
    //     this.filterValue.status = AppConstant.TO_PROCESSED_LIST;
    //   }else if (processedListValue){
    //     this.filterValue.status = AppConstant.PROCESSES_LIST;
    //   }else if (filterByDate){
    //     this.filterValue.sortValue = AppConstant.CREATED_ON;
    //   }else if (filterByFrom) {
    //     this.filterValue.sortValue = AppConstant.CREATED_FROM;
    //   }else if (sortOrder) {
    //     this.filterValue.sortOrder = AppConstant.ONE;
    //   }else if(sortOrder === false){
    //     this.filterValue.sortOrder = AppConstant.TWO;
    //   }else {
    //     this.filterValue.status = AppConstant.NULL_VALUE;
    //   }
    // }
    this.inboxService.searchInboxData(this.filterValue).then((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.toProcessedList = Array.from({length: res.body.totalRecords});
          const loadedProducts = res.body.data;
          this.totalRecords = res.body.totalRecords;
          Array.prototype.splice.apply(this.toProcessedList, [
            ...[event.first, event.rows],
            ...loadedProducts
          ]);
          this.toProcessedList = [...this.toProcessedList];
          try {
            event.forceUpdate();
          } catch (e){}
          this.emitToProcesslistLength.emit(this.toProcessedList.filter(x => x !== undefined).length);
          this.toProcessDataLength = this.toProcessedList.filter(x => x !== undefined).length;
          this.inboxUtility.manageCheckBox(this.toProcessedList, this.attachmentIds);
          this.emailIdList = [];
          this.isButtonEnabledFromToProcessTab.emit(false);
          const filteredList = this.toProcessedList
            .filter(item => item.attachmentList)
            .flatMap(item => item.attachmentList);
          filteredList.forEach(attachment => {
            this.processedValue = attachment.status;
          });
          if (this.toProcessedList.length > AppConstant.ZERO && this.toProcessedList[AppConstant.ZERO] !== undefined) {
            this.inboxService.getActiveAttachmentDetailsUsingEmailId.next(this.toProcessedList[AppConstant.ZERO].id);
            this.inboxService.isViewEmptyAttachmentContent.next(false);
            this.attachmentIds.length > AppConstant.ZERO ? this.isButtonEnabledFromToProcessTab.emit(true) :
              this.isButtonEnabledFromToProcessTab.emit(false);
            this.inboxUtility.getSelectedAttachmentOnloadPage(this.toProcessedList[this.clickIndexInToProcess].attachmentList);
            this.toProcessListObject.emit(this.toProcessedList[this.clickIndexInToProcess]);
            this.clickToProcessedListAttachmentId =
              this.toProcessedList[this.clickIndexInToProcess].attachmentList[AppConstant.ZERO].id;
            this.attachmentListToHomeScreenFromToProcessTab.emit(this.toProcessedList[this.clickIndexInToProcess].attachmentList);
            if (this.toProcessedList[this.clickIndexInToProcess].attachmentList) {
              this.inboxService.attachmentIdInToProcessData.next(this.toProcessedList[this.clickIndexInToProcess].attachmentList[AppConstant.ZERO].id);
            }
            this.inboxUtility.getListWiseEmailedByAndFileNameOnClickAttachment(this.toProcessedList[this.clickIndexInToProcess],
              this.toProcessedList[this.clickIndexInToProcess].attachmentList[AppConstant.ZERO]);
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
   * this method trigger when click the process data row
   * @param i to index
   * @param toProcessData to process data object
   */
  toProcessedDataClick(i: any, toProcessData: any) {
    this.toProcessListObject.emit(toProcessData);
    this.attachmentListToHomeScreenFromToProcessTab.emit(toProcessData.attachmentList);
    this.inboxService.getActiveAttachmentDetailsUsingEmailId.next(toProcessData.id);
    this.emailBOdyDetail.emit(null);
    if (!toProcessData.isRead) {
      this.markMailAsRead(toProcessData, this.clickIndexInToProcess, false);
    }
    if (this.clickIndexInToProcess === i && this.clickIndexInToProcess !== undefined) {
      return;
    }
    this.clickIndexInToProcess = i;
    this.attachmentIndex = AppConstant.ZERO;
    this.emitAttachmentIndexInToProcess.emit(this.attachmentIndex);
    if (this.toProcessedList[i].attachmentList.length > AppConstant.ZERO) {
      this.clickToProcessedListAttachmentId = this.toProcessedList[i].attachmentList[AppConstant.ZERO].id;
      this.inboxUtility.generateInboxAttachment(false, this.toProcessedList[i].attachmentList[AppConstant.ZERO].id,
        this.toProcessedList[i].attachmentList[AppConstant.ZERO].fileName, this.toProcessedList[i].attachmentList[AppConstant.ZERO].fileType);
      this.inboxService.attachmentIdInToProcessData.next(this.toProcessedList[this.clickIndexInToProcess].attachmentList[AppConstant.ZERO].id);
      this.inboxUtility.getListWiseEmailedByAndFileNameOnClickAttachment(this.toProcessedList[this.clickIndexInToProcess],
        this.toProcessedList[this.clickIndexInToProcess].attachmentList[AppConstant.ZERO]);
    }
  }


  /**
   * this method can be used to get process singal record actions
   */
  getToProcessOption() {
    this.tpProcessedOptions = [];
    this.tpProcessedOptions.push({
        label: AppActionLabel.TO_PROCESS_ATTACHED_TO,
        status: this.statusEnums.STATUS_COMMON,
        icon: this.iconEnum.ICON_ATTACH_TO_DOCUMENT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INBOX_ATTACH_TO),
        command: () => {
          this.isVisibleAttachedToModal = true;
        }
      },
      {separator: true},
      {
        label: AppActionLabel.TO_PROCESS_DELETE,
        status: this.statusEnums.STATUS_COMMON,
        icon: this.iconEnum.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.INBOX_DELETE),
        command: () => {
          this.deleteToProcessAttachment(this.clickToProcessedListAttachmentId);
        }
      });
  }

  /**
   * Change action button array list according to status
   */
  actionButtonList() {
    return this.tpProcessedOptions.filter(this.isActionMatch(AppEnumConstants.STATUS_COMMON));
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

  /**
   * this method can be used to delete to process record
   * @param attachmentId to attachment Id
   */
  deleteToProcessAttachment(attachmentId) {
    let attachmentIds: any [] = [];
    attachmentIds.push(attachmentId);
    this.inboxService.deleteToProcessItem(attachmentIds).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
        this.attachmentIds.splice(this.attachmentIds.findIndex(x => x === attachmentId), AppConstant.ONE);
        this.loadToProcessList(this.filterValue);
        this.inboxService.refreshDeletedTabList.next(true);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to delete to process email record
   * @param attachmentIds to attachment id array
   */
  deleteToProcessEmailWise(attachmentIds: any []) {
    this.isProgressToProcessAction.emit(true);
    this.inboxService.deleteToProcessItem(attachmentIds).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
        this.isProgressToProcessAction.emit(false);
        this.attachmentIds = [];
        this.loadToProcessList(this.filterValue);
        this.inboxService.refreshDeletedTabList.next(true);
      } else {
        this.isProgressToProcessAction.emit(false);
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isProgressToProcessAction.emit(false);
      this.notificationService.errorMessage(error);
    });
  }

  /**.l
   * this method can be used to initialize attached to form
   */
  initAttachedToForm() {
    this.attachedToForm = this.formBuilder.group({
      documentType: [AppConstant.NULL_VALUE, Validators.required],
      documentId: [AppConstant.NULL_VALUE],
      vendorId: [AppConstant.NULL_VALUE],
      attachment: [AppConstant.NULL_VALUE],
      attachmentId: [AppConstant.NULL_VALUE],
      vendorAttachmentTypeId: [AppConstant.NULL_VALUE]
    });
  }

  /**
   * this method can be used to reset the attached to form
   */
  resetAttachedToForm() {
    this.attachedToForm.reset();
  }

  /**
   * This method can be used to get section related document type list
   * @param sectionId to section id
   */
  getSectionRelatedDocumentType(sectionId) {
    if (sectionId === null) {
      return;
    } else {
      const tempSectionListMap = new Map();
      this.inboxUtility.sectionList.data.forEach(section => {
        tempSectionListMap.set(section.id, section.name);
      });
      return tempSectionListMap.get(sectionId);
    }
  }

  /**
   * this method can be used to save attached to form data
   */
  saveAttachedToFormData() {
    this.isSaveButtonEventInProgress = true;
    if (this.attachedToForm.invalid) {
      this.isSaveButtonEventInProgress = false;
      new CommonUtility().validateForm(this.attachedToForm);
    } else {
      this.inboxService.fileFromInbox.subscribe(file => {
        if (file != null) {
          this.attachedToForm.get(AppConstant.INBOX_ATTACHMENT).patchValue(file.get(AppConstant.FILE));
        }
      });
      if (this.attachmentId != null) {
        this.attachedToForm.get(AppConstant.ATTACHMENT_ID).patchValue(this.attachmentId);
      }

      this.inboxService.saveAttachedToFormData(this.attachedToForm.value).subscribe((response: any) => {
        if (response.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.ATTACHED_TO_DOCUMENT_SUCCESSFULLY);
          this.isVisibleAttachedToModal = false;
          this.isSaveButtonEventInProgress = false;
          this.attachedToForm.reset();
          this.loadToProcessList(this.filterValue);
        } else {
          this.isSaveButtonEventInProgress = false;
          this.notificationService.infoMessage(response.body.message);
        }
      }, error => {
        this.isSaveButtonEventInProgress = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to download attachment
   * @param attachment to attachment object
   * @param i to attachment index
   * @param toProcessList to to process object
   */
  attachmentOnClick(attachment, i, toProcessList) {
    this.emailBOdyDetail.emit(null);
    this.attachmentIndex = i;
    if (attachment.id === null || attachment.id === undefined) {
      return;
    } else {
      this.clickToProcessedListAttachmentId = attachment.id;
      this.emitAttachmentIndexInToProcess.emit(this.attachmentIndex);
      this.attachmentIdFromToProcess = toProcessList.attachmentList[i].id;
      this.inboxUtility.generateInboxAttachment(false, toProcessList.attachmentList[this.attachmentIndex].id,
        toProcessList.attachmentList[this.attachmentIndex].fileName, toProcessList.attachmentList[this.attachmentIndex].fileType);
      this.inboxService.attachmentIdInToProcessData.next(toProcessList.attachmentList[this.attachmentIndex].id);
    }
    this.inboxUtility.getListWiseEmailedByAndFileNameOnClickAttachment(toProcessList, attachment);
  }

  /**
   * refresh attachment list after delete the attachment from view
   */
  refreshAfterDeleteAttachmentFromView() {
    this.inboxService.deletedSuccessEvent.subscribe(isDeleteSuccess => {
      if (!isDeleteSuccess) {
        return;
      } else {
        this.loadToProcessList(this.filterValue);
      }
    });
  }

  /**
   * refresh to process data list after delete tab action success
   */
  refreshTab() {
    this.inboxService.refreshToProcessTabList.subscribe(isAllowedToRefresh => {
      if (!isAllowedToRefresh) {
        return;
      } else {
        this.loadToProcessList(this.filterValue);
      }
    });
  }

  /**
   * this method can be used to mark mail as read
   * @param toProcessData to to process data object
   * @param isFromExpandIconClick to isFromExpandIconClick
   * @param i to index
   */
  markMailAsRead(toProcessData, i, isFromExpandIconClick: boolean) {
    if ((toProcessData.id === null || toProcessData.id === undefined) && !toProcessData.isRead) {
      return;
    } else {
      this.inboxService.markMailAsRead(toProcessData.id).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          toProcessData.isRead = true;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to get documents relevant to the module id
   * @param id to section id(module id/document type id)
   * @param venId to venId
   */
  getModuleRelatedDocument(id, venId) {
    if (id === null) {
      return;
    } else {
      this.inboxUtility.getSectionRelatedDocumentTypeList(id, venId);
    }
  }

  /**
   * this method can be used get attachment id
   */
  getAttachmentId() {
    this.inboxService.attachmentIdInToProcessData.subscribe(attachmentId => {
      if (attachmentId != null) {
        this.attachmentId = attachmentId;
      }
    });
  }

  /**
   * this method can be used to add attachment id to list
   * @param toProcessData
   * @param attId to attachment id
   * @param fileType to fileType
   * @param isChecked
   */
  addAttachmentToList(toProcessData, attId, fileType, isChecked) {
    if (attId !== null && isChecked && attId !== undefined && !this.attachmentIds.includes(attId)) {
      this.attachmentIds.push(attId);
    } else {
      this.attachmentIds.splice(this.attachmentIds.findIndex(x => x == attId), AppConstant.ONE);
    }

    if (fileType !== AppConstant.PDF && !this.numberOfPdfFileTypes.includes(attId) && isChecked) {
      this.numberOfPdfFileTypes.push(attId);
    } else if (!isChecked && fileType !== AppConstant.PDF) {
      this.numberOfPdfFileTypes.splice(this.numberOfPdfFileTypes.findIndex(x => x == attId), AppConstant.ONE);
    }

    this.attachmentIds.length > AppConstant.ZERO ? this.isButtonEnabledFromToProcessTab.emit(true) :
      this.isButtonEnabledFromToProcessTab.emit(false);
    this.numberOfPdfFileTypes.length > AppConstant.ZERO ? this.isPdfFile.emit(false) :
      this.isPdfFile.emit(true);
  }

  /**
   * this method can be used to check all and un checked all
   * @param isChecked parent check box status
   * @param toProcessData to to process data object
   */

  checkUncheckAll(isChecked, toProcessData: any) {
    if (isChecked) {
      toProcessData.attachmentList.forEach(attachment => {
        attachment.isChecked = true;
        if (!this.attachmentIds.includes(attachment.id)) {
          this.attachmentIds.push(attachment.id);
        }
        if (!this.numberOfPdfFileTypes.includes(attachment.id) && attachment.fileType !== AppConstant.PDF) {
          const attId = attachment.id;
          this.numberOfPdfFileTypes.push(attId);
        }

      });
    } else {
      toProcessData.attachmentList.forEach(attachment => {
        this.attachmentIds.splice(this.attachmentIds.findIndex(x => x == attachment.id), AppConstant.ONE);
        attachment.isChecked = false;
        if (attachment.fileType !== AppConstant.PDF) {
          this.numberOfPdfFileTypes.splice(this.numberOfPdfFileTypes.findIndex(x => x == attachment.id), AppConstant.ONE);
        }
      });
    }
    this.attachmentIds.length > AppConstant.ZERO ? this.isButtonEnabledFromToProcessTab.emit(true) :
      this.isButtonEnabledFromToProcessTab.emit(false);
    this.numberOfPdfFileTypes.length > AppConstant.ZERO ? this.isPdfFile.emit(false) :
      this.isPdfFile.emit(true);
  }

  /**
   * this method can be used to when checked all children check box select main check box as checked
   * @param toProcessData to to process data object
   */
  checkAttachment(toProcessData) {
    toProcessData.isChecked = toProcessData.attachmentList.every(function(item: any) {
      return item.isChecked == true;
    });
  }

  /**
   * validate field  on change document type dropdown
   */
  validateFieldOnChangeDocumentType() {
    const documentType = this.attachedToForm.get(AppConstant.DOCUMENT_TYPE);
    const vendorId = this.attachedToForm.get(AppConstant.VENDOR_ID);
    const documentId = this.attachedToForm.get(AppConstant.DOCUMENT_ID);
    const vendorAttachmentTypeId = this.attachedToForm.get(AppConstant.ATTACHMENT_TYPE_ID_FOR_VENDOR);

    vendorAttachmentTypeId.clearValidators();
    vendorAttachmentTypeId.updateValueAndValidity();

    if (documentType.value === null) {
      return;
    } else {
      documentId.reset();
      documentId.setValidators(Validators.required);
    }
    if (documentType.value !== AppConstant.EXPENSE_SECTION_ID) {
      vendorId.reset();
      vendorId.setValidators(Validators.required);
    } else {
      vendorId.clearValidators();
      vendorId.updateValueAndValidity();
    }
  }

  /**
   * this method can be used to validate vendor id
   * @param venId to vendor id
   */
  validateFieldOnChangeVendor(venId) {
    const vendorAttachmentTypeId = this.attachedToForm.get(AppConstant.ATTACHMENT_TYPE_ID_FOR_VENDOR);
    const documentId = this.attachedToForm.get(AppConstant.DOCUMENT_ID);
    const documentType = this.attachedToForm.get(AppConstant.DOCUMENT_TYPE);
    documentId.reset();
    if (venId === null || venId === AppConstant.ZERO) {
      return;
    } else {
      documentId.clearValidators();
      documentId.updateValueAndValidity();
      vendorAttachmentTypeId.setValidators(Validators.required);
    }
    if (documentType.value !== AppConstant.EXPENSE_SECTION_ID && venId) {
      documentId.setValidators(Validators.required);
    }
  }

  moveToProcess(attId) {
    this.inboxService.moveToProcess(attId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.ACTION_COMPLETED_SUCCESSFULLY);
        this.loadToProcessList(this.filterValue);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }
}
