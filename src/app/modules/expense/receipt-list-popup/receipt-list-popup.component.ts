import {Component, EventEmitter, HostListener, Input, OnInit, Output, Sanitizer, ViewChild} from '@angular/core';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CommonMessage} from '../../../shared/utility/common-message';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {Table} from 'primeng/table';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {DataView} from "primeng/dataview/dataview";
import {AppActionLabel} from "../../../shared/enums/app-action-label";
import {AppIcons} from "../../../shared/enums/app-icons";

@Component({
  selector: 'app-receipt-list-popup',
  templateUrl: './receipt-list-popup.component.html',
  styleUrls: ['./receipt-list-popup.component.scss']
})
export class ReceiptListPopupComponent implements OnInit {

  @Input() selectedReceiptId; // The Selected Receipt id of the transaction which is coloured in light green
  @Input() receiptId;
  @Input() viewDetail = false;
  @Input() fromExpense = false;
  @Input() transactionDate;
  @Input() prevReceiptId;
  @Input() expenseLineItems: any = [];
  @Output() receiptAttached = new EventEmitter(); // Emits the selected receipt id for transaction
  @Output() attachMissingReceipt = new EventEmitter(); // Missing receipt screen toggle

  public appAuthorities = AppAuthorities;
  public tableSupportBase = new TableSupportBase();
  public enums = AppEnumConstants;
  public tableKeyEnum = AppTableKeysData;
  public selectedReceipt: any;
  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();
  public loading = false;
  public uploadView = false;
  public showUsedReceipts = false;
  public attachments = [];
  public searchValue = '';
  public singleAttachment: any;
  public displayedAttachmentId: any;
  public prevSelectedReceiptId: any;
  public expenseLineItemReceiptIds = [];
  public singleAttachmentLoading = false;
  public actionMenuItems = [];
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public selectedActionForDelete;

  /**
   * Columns Show/ Hide Drop down clicked
   */
  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @ViewChild('columnSelect') columnSelect: any;
  @ViewChild('dt') table: DataView | any;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  constructor(public gridService: GridService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, private expenseService: ExpenseService,
              public confirmationService: ConfirmationService) {
  }

  ngOnInit(): void {
    if (this.fromExpense) {
      this.expenseLineItemReceiptIds = this.expenseLineItems.filter(x => x.value.receiptId !== null).map(x => x.value.receiptId);
    }
    this.prevSelectedReceiptId = this.selectedReceiptId;
    if (this.viewDetail) {
      // this.getReceiptList();
      this.viewImage({id: this.selectedReceiptId});
    } else {
      // this.getDataFromBackend();
    }
    this.actionMenuItems = [
      {
        label: this.actionLabelEnum.ACTION_LABEL_DELETE,
        icon: this.iconEnum.ICON_DELETE,
        command: () => {
          this.deleteReceipt();
        }
      }
    ];
  }

  /**
   * Get the receipt for specific Statement
   */
  getReceiptList() {
    if (!this.selectedReceiptId) {
      return;
    }
    this.expenseService.getSelectedReceipt(this.selectedReceiptId).subscribe(async (res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        this.tableSupportBase.dataSource = res.body;
        this.tableSupportBase.totalRecords = res.body?.length;
        const index = this.selectedReceiptId ? res.body?.findIndex(x => x.id === this.selectedReceiptId) : 0;
        if (res.body[index]) {
          this.viewImage(res.body[index]);
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = {
      first: event.first,
      rows: event.rows,
      sortOrder: 1,
      filters: {
        'receipt.fileName': {value: this.searchValue, matchMode: 'contains'},
        'receipt.attached': {value: !this.showUsedReceipts ? 'N' : '', matchMode: 'contains'}
      },
      globalFilter: null
    };
    this.getDataFromBackend();
  }

  /**
   * get search result
   */

  getDataFromBackend() {
    if (this.viewDetail) {
      return;
    }
    const receiptIdList = [];
    if (this.receiptId) {
      receiptIdList.push(this.receiptId);
    }
    if (this.prevReceiptId) {
      receiptIdList.push(this.prevReceiptId);
    }
    this.expenseService.getReceiptList(this.tableSupportBase.searchFilterDto, receiptIdList).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = res.body.data;
          this.tableSupportBase.totalRecords = res.body.totalRecords;
          if (!this.tableSupportBase.searchFilterDto.filters['receipt.fileName'].value && this.selectedReceiptId) {
            const index = this.selectedReceiptId ? res.body.data.findIndex(x => x.id === this.selectedReceiptId) : 0;
            if (res.body?.data[index]) {
              this.viewImage(res.body.data[index]);
            }
          }

        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  /**
   * View the attachment of the receipt
   * @param data
   * @param event
   */
  viewImage(data, event?) {
    if (event) {
      event.stopPropagation(); // to stop the click event of the parent card
    }
    data.loading = true;
    if (!data.id) {
      return;
    }
    this.singleAttachmentLoading = true;
    this.expenseService.downloadReceipt(data.id).subscribe(res => {
      this.displayedAttachmentId = data.id;
      this.singleAttachment = window.URL.createObjectURL(res.data);
      this.singleAttachmentLoading = false;
      data.loading = false;
    }, error => {
      data.loading = false;
      this.singleAttachmentLoading = false;
      this.notificationService.errorMessage(error);
    });
  }


  select(item: any) {
    this.selectedReceiptId = item.id;
    const obj = {
      receiptId: item.id,
      receiptFileName: item['receipt.fileName']
    };
    this.viewImage(item);
    this.selectedReceipt = obj;
  }

  /**
   * this method can be used to upload file list
   * @param event to event
   */
  changeFileList(event) {
    this.attachments.push(...event.addedFiles);

    this.loading = true;
    this.expenseService.uploadReceipts(this.attachments).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.FILES_UPLOADED_SUCCESSFULLY);
          this.attachments = [];
          this.getDataFromBackend();
        } else {
          this.notificationService.infoMessage(res.body.message);
          this.attachments = [];
        }
        this.loading = false;
        this.attachments = [];
        this.uploadView = false;
      },
      error => {
        this.notificationService.errorMessage(error);
        this.loading = false;
        this.uploadView = false;
        this.attachments = [];
      });
  }

  /**
   * This method can be used to remove selected file
   * @param event to remove event
   */
  onRemove(event) {
    this.attachments.splice(this.attachments.indexOf(event), 1);
  }

  applyAndClose() {
    this.receiptAttached.emit(this.selectedReceipt);
  }

  reset() {
    this.selectedReceiptId = this.prevSelectedReceiptId;
    this.singleAttachment = null;
    this.selectedReceipt = null;
    this.searchValue = '';
    if (this.viewDetail) {
      this.getReceiptList();
    } else {
      this.loadData(this.tableSupportBase.searchFilterDto);
      // this.getDataFromBackend();
    }
  }

  private deleteReceipt() {
    this.confirmationService.confirm({
      key: 'receiptDel',
      message: `You want to delete this receipt (${this.selectedActionForDelete['receipt.fileName']})`,
      accept: () => {
        this.expenseService.deleteReceipt(this.selectedActionForDelete.id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            // this.loadData(this.tableSupportBase.searchFilterDto);
            this.notificationService.successMessage(HttpResponseMessage.RECEIPT_DELETED_SUCCESSFULLY);
            if (this.selectedReceiptId === this.selectedActionForDelete.id) {
              this.reset();
            } else {
              this.getDataFromBackend();
            }
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  isDeleteMenuVisible(item: any) {
    if (!this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_RECEIPT_DELETE)){
      return true;
    }
    if (this.expenseLineItemReceiptIds.includes(item.id)) {
      return true;
    } else { return item.id === this.receiptId; }
  }

  toggleList() {
    this.singleAttachment = null;
    this.selectedReceipt = null;
  }
}
