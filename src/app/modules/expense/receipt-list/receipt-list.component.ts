import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {ButtonPropertiesDto} from "../../../shared/dto/common/Buttons/button-properties-dto";
import {AuditTrialDto} from "../../../shared/dto/common/audit-trial/audit-trial-dto";
import {ExpenseMasterDto} from "../../../shared/dto/expense/expense-master-dto";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppTableKeysData} from "../../../shared/enums/app-table-keys-data";
import {AppActionLabel} from "../../../shared/enums/app-action-label";
import {AppIcons} from "../../../shared/enums/app-icons";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {Subscription} from "rxjs";
import {Table} from "primeng/table";
import {AppWindowResolution} from "../../../shared/enums/app-window-resolution";
import {UntypedFormBuilder} from "@angular/forms";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {BulkNotificationDialogService} from "../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {GridService} from "../../../shared/services/common/table/grid.service";
import {ConfirmationService, LazyLoadEvent} from "primeng/api";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppConstant} from "../../../shared/utility/app-constant";
import {ExpenseTableDto} from "../../../shared/dto/expense/expense-table-dto";
import {AppBulkButton} from "../../../shared/enums/app-bulk-button";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.component.html',
  styleUrls: ['./receipt-list.component.scss']
})
export class ReceiptListComponent implements OnInit, OnDestroy {

  public activeAction: any
  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public auditTrial: AuditTrialDto[] = [];
  public expenseMasterDto: ExpenseMasterDto = new ExpenseMasterDto();
  public bulkButtonListResponsive: any;
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public multiselectValues: any;
  public commonUtil = new CommonUtility();
  public appEnumConstants = AppEnumConstants;
  public editView: boolean;
  public subscription: Subscription;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();
  public detailView = false;
  public attachmentLoading = false;
  public attachmentUrl;

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
  @ViewChild('dt') table: Table;
  @ViewChild('menu') menu: Menu;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.onTableResize();
  }

  /**
   * Destroys Table session state when redirecting
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTableKeysData.RECEIPT_CARD_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public expenseService: ExpenseService, public billsService: BillsService,
              public bulkNotificationDialogService: BulkNotificationDialogService, public gaService: GoogleAnalyticsService,
              public privilegeService: PrivilegeService, public gridService: GridService,
              public confirmationService: ConfirmationService, public billSubmitService: BillSubmitService) {
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.actionButtonInit();
    this.loadTableData();
    this.subscription = this.expenseService.receiptListSubject.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.tableSupportBase.rows = [];
        this.getDataFromBackend();
      }
    });
  }

  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.RECEIPT_CARD_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_RECEIPT_CARD_LIST;
            this.gridService.updateTableState(this.tableSupportBase.tableDataOptions).subscribe((res: any) => {
        if (event === true){
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
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.RECEIPT_CARD_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_RECEIPT_CARD_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.RECEIPT_CARD_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }


  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_RECEIPT_DELETE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_RECEIPTS,
            AppActionLabel.ACTION_LABEL_DELETE,
          );
          this.deleteCard(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DOWNLOAD_ATTACHMENT,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DOWNLOAD_BILL_FONT_AWESOME,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_RECEIPT_DOWNLOAD_ATTACHMENT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DOWNLOAD_ATTACHMENT,
            AppAnalyticsConstants.MODULE_NAME_RECEIPTS,
            AppActionLabel.ACTION_LABEL_DOWNLOAD_ATTACHMENT,
          );
          this.downloadAttachment(this.activeAction.id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_VIEW_ATTACHMENT,
        icon: this.iconEnum.ICON_ATTACH_TO_DOCUMENT,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_VIEW_RECEIPT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_VIEW_ATTACHMENT,
            AppAnalyticsConstants.MODULE_NAME_RECEIPTS,
            this.actionLabelEnum.ACTION_LABEL_VIEW_ATTACHMENT,
          );
          this.viewAttachment(this.activeAction.id);
        }
      }
    ];
  }


  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.getDataFromBackend();
  }

  /**
   * get search result
   */

  getDataFromBackend() {
    this.expenseService.getReceiptTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.dataSource = res.body.data;
          this.tableSupportBase.totalRecords = res.body.totalRecords;
          if (this.tableSupportBase.totalRecords === 0) {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
          } else {
            this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
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
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: ExpenseTableDto) {
    this.activeAction = val;
  }


  downloadAttachment(id) {
    if (id != null) {
      this.expenseService.downloadReceipt(id).subscribe((res: any) => {
        if (res.result.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          const url = window.URL.createObjectURL(res.data);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', this.activeAction.fileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
        } else {
          this.notificationService.infoMessage(HttpResponseMessage.FILE_DOWNLOD_ERROR);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  deleteCard(id) {
    this.confirmationService.confirm({
      key: 'deleteRec',
      message: 'You want to delete this receipt',
      accept: () => {
        this.expenseService.deleteReceipt(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.loadData(this.tableSupportBase.searchFilterDto);
            this.notificationService.successMessage(HttpResponseMessage.RECEIPT_DELETED_SUCCESSFULLY);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }


  deleteBulkCards() {
    if (this.tableSupportBase.rows.length > 0) {
      const ids: any[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
      this.confirmationService.confirm({
        message: 'You want to delete the selected receipt(s)',
        key: 'deleteRec',
        accept: () => {
          this.expenseService.bulkReceiptDelete(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.RECEIPT_BULK_DELETED_SUCCESSFULLY);
              }
              this.getDataFromBackend();
              this.tableSupportBase.rows = [];
            } else {
              this.notificationService.errorMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  /**
   * Is the field is has data to show in overlay
   * @param field
   */
  isClassHover(field) {
    switch (field) {
      case 'receipt.fileName':
        return !!this.privilegeService.isAuthorized(AppAuthorities.EXPENSES_DETAIL_VIEW);
    }
  }

  /**
   * A Single value clicked from table
   * @param field to filed
   * @param obj to customer obj
   */
  tdClick(field, obj: any, event) {
    if (obj['expense.status'] === AppEnumConstants.STATUS_DRAFT){
      this.activeAction = obj;
      return ;
    }

    if (field === 'receipt.fileName') {
      this.viewAttachment(obj.id);
    }
  }

  viewAttachment(id) {
    this.detailView = true;
    this.attachmentLoading = true;
    this.expenseService.downloadReceipt(id).subscribe(res => {
      this.attachmentUrl = window.URL.createObjectURL(res.data);
      this.attachmentLoading = false;
    }, error => {
      this.attachmentLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

}
