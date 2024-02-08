import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
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
import {BillApprovalsService} from "../../../shared/services/bills/bill-approvals.service";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {ConfirmationService, LazyLoadEvent} from "primeng/api";
import {AppConstant} from "../../../shared/utility/app-constant";
import {TransactionDto} from "../../../shared/dto/expense/transactionDto";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppBulkButton} from "../../../shared/enums/app-bulk-button";
import {AppTableHeaderActions} from "../../../shared/enums/app-table-header-actions";
import {Menu} from "primeng/menu";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-credit-card-approved-list',
  templateUrl: './credit-card-approved-list.component.html',
  styleUrls: ['./credit-card-approved-list.component.scss']
})
export class CreditCardApprovedListComponent implements OnInit, OnDestroy {

  public activeAction: any

  public tableSupportBase = new TableSupportBase();
  public auditTrial: AuditTrialDto[] = [];
  public AppAnalyticsConstants = AppAnalyticsConstants;
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
  public selectedReceiptId: any;
  public selectedTransactions: any[] = [];
  public showReceiptPopup = false;
  public approvalUserList: DropdownDto = new DropdownDto(); // User List
  public viewChangeAssignee = false;
  public cursorLoading = false;
  public subscription: Subscription;
  public isBillCreate = false;
  public auditTrialPanel = false;

  public showFilter = false;
  public showFilterColumns = false;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();


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
    sessionStorage.removeItem(AppTableKeysData.SUBMITTED_CARD_TABLE_KEY);
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public expenseService: ExpenseService, public billsService: BillsService,
              public bulkNotificationDialogService: BulkNotificationDialogService,
              public gaService: GoogleAnalyticsService,
              public privilegeService: PrivilegeService, public gridService: GridService,
              public billApprovalsService: BillApprovalsService, public automationService: AutomationService,
              public confirmationService: ConfirmationService) {
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_APPROVED_GENERATE_BILL)) {
      this.availableHeaderActions.push(AppTableHeaderActions.EXPENSE_GENERATE_BIL);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);


    this.actionButtonInit();
    this.loadTableData();
    this.subscription = this.expenseService.approvedListSubject.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.tableSupportBase.rows = [];
        this.selectedTransactions = [];
        this.getDataFromBackend();
      }
    });
  }


  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.SUBMITTED_CARD_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_APPROVED_TRANSACTION_LIST;
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
    sessionStorage.removeItem(AppTableKeysData.SUBMITTED_CARD_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_APPROVED_TRANSACTION_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.SUBMITTED_CARD_TABLE_KEY, this.columnSelect);
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
        label: AppActionLabel.ACTION_LABEL_GENERATE_BILL,
        icon: AppIcons.ICON_ADD_TO_LOCAL,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_APPROVED_GENERATE_BILL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_GENERATE_BILL,
            AppAnalyticsConstants.MODULE_NAME_APPROVED_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_GENERATE_BILL,
          );
          this.isBillCreate = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_AUDIT_TRAIL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_APPROVED_AUDIT_TRAIL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
            AppAnalyticsConstants.MODULE_NAME_APPROVED_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
          );
          this.expenseService.getTransactionAuditTrial(this.activeAction.id).subscribe((res: any) => {
            this.auditTrial = res.body;
            this.auditTrialPanel = true;
          });
        }
      },
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
    this.expenseService.getSubmittedTableData(this.tableSupportBase.searchFilterDto, AppEnumConstants.STATUS_APPROVED).subscribe((res: any) => {
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
  actionButtonClick(val: any) {
    this.activeAction = val;
  }

  public canChangeAssignee() {
    this.expenseService.canSubmittedChangeAssignee(this.activeAction.id).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.viewChangeAssignee = true;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * Skip Approval
   */
  skipApproval(id) {
    const transactionDto: TransactionDto = new TransactionDto();
    transactionDto.id = this.activeAction.id;
    this.expenseService.submittedSkipApproval(transactionDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.getDataFromBackend();
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_STATEMENT_SKIPPED_SUCCESSFULLY);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  //

  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_PROCESS:
        this.bulkCreateBill();
        break;
    }
  }

  public bulkCreateBill() {
    this.isBillCreate = true;
    // if (this.tableSupportBase.rows.length > 0) {
    //   const transactionDto: TransactionDto = new TransactionDto();
    //   const transactionDtoList: TransactionDto[] = [];
    //   for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
    //     transactionDto.approver = this.tableSupportBase.rows[i]['transaction.approver'];
    //     transactionDto.id = this.tableSupportBase.rows[i].id;
    //     transactionDtoList.push(transactionDto);
    //   }
    //   this.expenseService.bulkSubmittedApprove(transactionDtoList).subscribe((res: any) => {
    //     if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
    //       if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
    //         this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
    //         this.getDataFromBackend();
    //         this.tableSupportBase.rows = [];
    //       } else {
    //         this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_STATEMENT_BULK_APPROVED_SUCCESSFULLY);
    //         this.getDataFromBackend();
    //         this.tableSupportBase.rows = [];
    //       }
    //     } else {
    //       this.notificationService.errorMessage(res.body.message);
    //     }
    //   }, error => {
    //     this.notificationService.errorMessage(error);
    //   });
    // }
  }

  saveSingleTransactionData(item: any) {
    this.cursorLoading = true;
    return new Promise<void>(resolve => {
      const transactionDto: TransactionDto = new TransactionDto();
      transactionDto.id = item.id;
      transactionDto.merchant = item['transaction.merchant'];
      transactionDto.description = item['transaction.description'];
      transactionDto.accountId = item['transaction.accountId'];
      transactionDto.projectCodeId = item['transaction.projectCodeId'];
      transactionDto.receiptId = item['transaction.receiptId'];
      transactionDto.missingReceiptAvailabilityBln = item['transaction.missingReceiptAvailability'];
      transactionDto.billable = item['transaction.billable'] ? 'Y' : 'N';
      transactionDto.missingReceiptFormId = item.missingReceiptFormId;
      this.expenseService.saveSingleTransaction(transactionDto).subscribe(value => {
        this.cursorLoading = false;
        resolve()
      }, error => {
        this.cursorLoading = false;
        resolve()
      });
    })
  }

  clearSpace(val, col) {
    if (val[col][0] == ' ') {
      val[col] = '';
    }
  }

  billApprovedAndUpdateGrid() {
    this.tableSupportBase.rows = [];
    this.getDataFromBackend();
  }
}
