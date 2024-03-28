import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PaymentService} from '../../../shared/services/payments/payment.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {UntypedFormBuilder} from '@angular/forms';
import {GoogleAnalyticsService} from '../../../shared/services/google-analytics/google-analytics.service';
import {DetailViewService} from '../../../shared/helpers/detail-view.service';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppConstant} from '../../../shared/utility/app-constant';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {LazyLoadEvent} from 'primeng/api';
import {Table} from 'primeng/table';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {UploadNotificationsComponent} from '../../common/upload-notifications/upload-notifications.component';
import {CommonUploadIssueService} from '../../../shared/services/common/upload-issues/common-upload-issue.service';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {TableColumnFiltersComponent} from "../../common/table-column-filters/table-column-filters.component";
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";

@Component({
  selector: 'app-process-payment-request',
  templateUrl: './process-payment-request.component.html',
  styleUrls: ['./process-payment-request.component.scss']
})
export class ProcessPaymentRequestComponent implements OnInit {

  @Output() closeEmit = new EventEmitter();
  @Output() successEmit = new EventEmitter();

  set selectedColumns(val: any[]) {
    this.tableSupportBase.columnChange(val);
  }

  @Input() get selectedColumns(): any[] {
    return this.tableSupportBase.selectedColumns;
  }

  @Input() isFileUploadType = true;

  @ViewChild('tableColumnFiltersComponent') public tableColumnFiltersComponent: TableColumnFiltersComponent;
  @ViewChild('columnSelect') public columnSelect: any;
  @ViewChild('dt') public table: Table;
  @ViewChild('fileInput') fileInput: ElementRef;
  public paymentTypes: DropdownDto = new DropdownDto();
  public downloadLoading = false;
  public uploadLoading = false;
  public payments: any[];
  public tableSupportBase = new TableSupportBase();
  public tableKeyEnum = AppTableKeysData;
  public enums = AppEnumConstants;
  public appDocumentType = AppDocumentType;
  public appConstant: AppConstant = new AppConstant();
  public paymentFileId: any;
  public timeInterval: any;
  public isDisabled = false;
  public responsePercentage = 0;
  public availableHeaderActions = [];
  public showFilter = false;
  public showFilterColumns = false;
  public viewSummaryBool = false;
  public appAnalyticsConstants = AppAnalyticsConstants;
  public loading = false;
  public showSummary = false;
  public paymentObj: any;

  constructor(public notificationService: NotificationService, public paymentService: PaymentService,
              public gridService: GridService, public billPaymentService: BillPaymentService, public billsService: BillsService,
              public privilegeService: PrivilegeService, public formBuilder: UntypedFormBuilder, public gaService: GoogleAnalyticsService,
              public detailViewService: DetailViewService, public bulkNotificationDialogService: BulkNotificationDialogService,
              public commonUploadIssueService: CommonUploadIssueService) {
    this.isRowSelectable = this.isRowSelectable.bind(this);
  }

  close() {
    this.closeEmit.emit();
  }


  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);
    this.getOfflinePaymentType();
    this.getPendingPaymentsList();
  }

  getPendingPaymentsList() {
    this.payments = this.paymentService.getData();
    this.loadTableData();
  }


  getOfflinePaymentType() {
    this.billPaymentService.getPaymentTypeList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.paymentTypes.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Handles the file download logic.
   */
  downloadTemplate() {
    this.paymentService.downloadPaymentFileListUploadTemplate().subscribe(res => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'payment_request_upload_template');
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
   * Handles the file upload logic.
   * @param file The selected file to upload.
   */
  uploadTemplate(file: File) {
    this.isDisabled = true;
    this.paymentService.uploadPaymentFileList(file).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.paymentFileId = res.body.uuid;
          this.timeInterval = setInterval(() => {
            this.getUploadedPercentage();
          }, 1000);
          this.fileInput.nativeElement.value = '';
          this.loadData(this.tableSupportBase.searchFilterDto, true);
        } else {
          clearInterval(this.timeInterval);
          this.notificationService.infoMessage(res.body.message);
          this.responsePercentage = 0;
        }
        this.isDisabled = false;
        this.fileInput.nativeElement.value = '';
      },
      error => {
        clearInterval(this.timeInterval);
        this.notificationService.errorMessage(error);
        this.responsePercentage = 0;
        this.isDisabled = false;
        this.fileInput.nativeElement.value = '';
      }
    );
  }

  /**
   * Triggers the file input to open when the button is clicked.
   */
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handles the file selection event.
   * @param event The file selection event.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadTemplate(file);
    }
  }

  /**
   * Gets the uploaded percentage and updates the progress.
   */
  getUploadedPercentage() {
    this.paymentService.getUploadedPercentage(this.paymentFileId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.responsePercentage = res.body;
        this.responsePercentage = Math.floor(this.responsePercentage);
        if (this.responsePercentage === 100.0) {
          clearInterval(this.timeInterval);
          setTimeout(() => {
            this.getUploadIssues();
          }, 1000);
        }
      } else {
        clearInterval(this.timeInterval);
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      clearInterval(this.timeInterval);
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Gets upload issues after file upload.
   */
  getUploadIssues() {
    this.paymentService.getUploadedFileIssue(this.paymentFileId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {

        if (res.body.errors.length > 0) {
          this.commonUploadIssueService.show(UploadNotificationsComponent, res.body);
          this.notificationService.successMessage(HttpResponseMessage.FILE_UPLOADED_SUCCESSFULLY);
        } else {
          this.notificationService.successMessage(HttpResponseMessage.FILE_UPLOADED_SUCCESSFULLY);
        }
        setTimeout(() => {
          this.isDisabled = false;
          this.responsePercentage = 0;
          this.loadData(this.tableSupportBase.searchFilterDto, true);
        }, 3000);
      } else {
        this.isDisabled = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isDisabled = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to save table state
   */
  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PROCESS_PAYMENT_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_PROCESS_PAYMENT_REQUEST_LIST;
      this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true) {
          this.loadTableData();
        }
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    });
  }

  /**
   * Loads Table Data (Settings)
   */
  loadTableData() {
    this.selectedColumns = [];
    // Check for Responsiveness
    this.onTableResize();
    // Removes table Storage on load if present
    sessionStorage.removeItem(AppTableKeysData.PROCESS_PAYMENT_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_PROCESS_PAYMENT_REQUEST_LIST).subscribe((res: any) => {
      this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PROCESS_PAYMENT_TABLE_KEY, this.columnSelect);
    });
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   * @param clearRows clear the rows after response
   */
  loadData(event: LazyLoadEvent, clearRows?) {
    this.tableSupportBase.searchFilterDto = event;
    this.paymentService.getProcessPaymentRequestList(this.tableSupportBase.searchFilterDto, this.isFileUploadType).subscribe((res: any) => {
      if (clearRows) {
        this.tableSupportBase.rows = [];
      }
      this.tableSupportBase.dataSource = res.body.data;
      this.tableSupportBase.totalRecords = res.body.totalRecords;
      this.tableSupportBase.rowSelected(null, null);
      if (this.tableSupportBase.totalRecords === 0) {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
      } else {
        this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
      }
    });
  }

  syncNow() {

  }

  isRowSelectable(event: any) {
    return !this.isRowDisabled(event.data);
  }

  isRowDisabled(data) {
    return data.rowDisabled;
  }

  viewSummary() {
    this.viewSummaryBool = true;
  }

  /**
   * Return the total in array for summary
   */
  getTotal() {
    return this.tableSupportBase.rows.reduce((a, b) => a + (b.amount || 0), 0);
  }

  /**
   * Submit, Schedule or Pay a transaction
   */
  submitPayment() {
    const selections = this.tableSupportBase.rows;
    selections.forEach(value => {
      value.paymentChannel = value['pPaymentReq.paymentChannel'];
      value.referenceNumber = value['pPaymentReq.referenceNumber'];
    });
    this.showSummary = false;
    this.paymentService.getSummaryForProcessPayment(selections).subscribe({
      next: (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.paymentObj = res.body;
          this.showSummary = true;
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.loading = false;
      }, error: (err) => {
        this.notificationService.errorMessage(err);
        this.loading = false;
      }
    });
  }

  /**
   * Create Api
   */
  create() {
    const selections = this.tableSupportBase.rows;
    this.paymentService.createProcessPayment(selections).subscribe({
      next: (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.PAYMENT_CREATED_SUCCESSFULLY);
          this.loadData(this.tableSupportBase.searchFilterDto);
          this.tableSupportBase.rows = [];
          this.showSummary = false;
          this.successEmit.emit(true);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.loading = false;
      }, error: (err) => {
        this.notificationService.errorMessage(err);
        this.loading = false;
        this.paymentService.updatePaymentSummaryBtnStatus.next(true);
      }
    });
  }

  reset() {
    this.tableSupportBase.rows = [];
  }

  getButtonDetailsForSummary() {
    return {label: 'Pay', icon: 'fa-solid fa-coins'};
  }
}
