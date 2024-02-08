import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {ButtonPropertiesDto} from '../../../shared/dto/common/Buttons/button-properties-dto';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {ExpenseMasterDto} from '../../../shared/dto/expense/expense-master-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppTableKeysData} from '../../../shared/enums/app-table-keys-data';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {Subscription} from 'rxjs';
import {Table} from 'primeng/table';
import {AppWindowResolution} from '../../../shared/enums/app-window-resolution';
import {UntypedFormBuilder} from '@angular/forms';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {
  BulkNotificationDialogService
} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {TransactionDto} from '../../../shared/dto/expense/transactionDto';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from 'primeng/menu';
import {ManageFeatureService} from '../../../shared/services/settings/manage-feature/manage-feature.service';
import {AppFeatureId} from '../../../shared/enums/app-feature-id';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {BulkNotificationsComponent} from "../../common/bulk-notifications/bulk-notifications.component";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-credit-card-process-list',
  templateUrl: './credit-card-process-list.component.html',
  styleUrls: ['./credit-card-process-list.component.scss']
})
export class CreditCardProcessListComponent implements OnInit, OnDestroy {

  public activeAction: any;
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
  public isProcessView = false;
  public isAddNewAccount = false;
  public isAddNewProject = false;
  public selectedReceiptId: any;
  public projectCodeList: DropdownDto = new DropdownDto();
  public expenseAccountList: DropdownDto = new DropdownDto();
  public selectedTransactions: any[] = [];
  public showReceiptPopup = false;
  public cursorLoading = false;
  public subscription: Subscription;
  public auditTrialPanel = false;
  public merchantResults: any;
  public featureIdEnum = AppFeatureId;
  public featureIdList: any [] = [];
  public showFilter = false;
  public showFilterColumns = false;
  public memorizationMerchant: boolean;
  public availableHeaderActions = [];
  public appConstant: AppConstant = new AppConstant();
  public showSplitPopup = false;
  public splitTransactionId: any;
  public isAddNewDepartment = false; // Add New Department Drawer Boolean
  public department: DropdownDto = new DropdownDto();

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
    sessionStorage.removeItem(AppTableKeysData.PROCESS_CARD_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public expenseService: ExpenseService, public billsService: BillsService,
              public bulkNotificationDialogService: BulkNotificationDialogService,
              public gaService: GoogleAnalyticsService,
              public manageFeatureService: ManageFeatureService, public drawerService: ManageDrawerService,
              public privilegeService: PrivilegeService, public gridService: GridService,
              public billApprovalsService: BillApprovalsService, public confirmationService: ConfirmationService) {
    this.getMemoristionfeature();
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_PROCESS_SAVE_AS_APPROVED,
      AppAuthorities.CREDIT_CARD_PROCESS_SUBMIT])) {
      this.availableHeaderActions.push(AppTableHeaderActions.PROCESS_TRANSACTIONS_EXPENSE);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);

    if (this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_DELETE_TRANSACTION)) {
      this.availableHeaderActions.push(AppTableHeaderActions.DELETE);
    }
    this.actionButtonInit();
    this.loadTableData();
    this.getProjectTaskList();
    this.getAccounts();
    this.getDepartment();
    this.subscription = this.expenseService.processListSubject.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.tableSupportBase.rows = [];
        this.selectedTransactions = [];
        this.getDataFromBackend();
      }
    });

    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);
  }


  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.PROCESS_CARD_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_PROCESS_CARD_LIST;
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
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.PROCESS_CARD_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_PROCESS_CARD_LIST).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.tableSupportBase.tableDataProcess(this.table, res, AppTableKeysData.PROCESS_CARD_TABLE_KEY, this.columnSelect);
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, (error => {
        this.notificationService.errorMessage(error);
      })
    );
  }

  getProjectTaskList() {
    this.billsService.getProjectTask(AppConstant.PROJECT_CODE_CATEGORY_ID).subscribe((res: any) => {
      this.projectCodeList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getAccounts() {
    this.expenseService.getExpenseAccountList().subscribe((res: any) => {
      this.expenseAccountList.data = res;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method used to get departments
   */

  getDepartment() {
    this.billsService.getDepartment(true).subscribe((res: any) => {
      this.department.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Init Actions Button List
   */
  actionButtonInit() {
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_PROCESS_STATEMENT,
        icon: AppIcons.ICON_APPROVE,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_PROCESS_SAVE_AS_APPROVED,
          AppAuthorities.CREDIT_CARD_PROCESS_SUBMIT]),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_PROCESS_STATEMENT,
            AppAnalyticsConstants.MODULE_NAME_PROCESS_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_PROCESS_STATEMENT,
          );
          this.selectedTransactions = [];
          this.selectedTransactions.push(this.activeAction);
          this.isProcessView = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_AUDIT_TRAIL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_PROCESS_AUDIT_TRAIL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
            AppAnalyticsConstants.MODULE_NAME_PROCESS_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
          );
          this.expenseService.getTransactionAuditTrial(this.activeAction.id).subscribe((res: any) => {
            this.auditTrial = res.body;
            this.auditTrialPanel = true;
          });
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_DELETE_TRANSACTION),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_DELETE,
            AppAnalyticsConstants.MODULE_NAME_PROCESS_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_DELETE,
          );
          this.deleteTransaction(this.activeAction.id);
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_SPLIT_TRANSACTION,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_SPLIT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_SPLIT_TRANSACTION),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_SPLIT_TRANSACTION,
            AppAnalyticsConstants.MODULE_NAME_PROCESS_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_SPLIT_TRANSACTION,
          );
          this.splitTransactionId = this.activeAction.id;
          this.showSplit();
        }
      },
    ];
  }

  showSplit() {
    this.showSplitPopup = true;
  }

  deleteTransaction(id) {
    this.confirmationService.confirm({
      key: 'delete-tran',
      message: 'You want to delete this Transaction',
      accept: () => {
        this.expenseService.deleteTransaction(id).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_TRANSACTION_DELETED_SUCCESSFULLY);
            this.getDataFromBackend();
            this.expenseService.uploadedTransactionSubject.next(true);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  deleteTransactionList() {
    const ids: any[] = [];
    if (this.tableSupportBase.rows.length > 0) {
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        ids.push(this.tableSupportBase.rows[i].id);
      }
    }
    if (ids.length > AppEnumConstants.LENGTH_ZERO) {
      this.confirmationService.confirm({
        message: 'You want to delete the selected Transaction(s)',
        key: 'delete-tran',
        accept: () => {
          this.expenseService.deleteTransactions(ids).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
              } else {
                this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_TRANSACTIONS_DELETED_SUCCESSFULLY);
              }
              this.getDataFromBackend();
              this.expenseService.uploadedTransactionSubject.next(true);
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
    this.expenseService.getProcessCardTableData(this.tableSupportBase.searchFilterDto).subscribe((res: any) => {
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

  /**
   * Check for changed account value is add new
   * @param event value
   * @param item
   */
  accountChanged(event: any, item: any) {
    if (event.value === 0) {
      this.isAddNewAccount = true;
      setTimeout(() => {
        item['transaction.accountId'] = null;
      }, 100);
    } else {
      item.accountChanged = true;
      this.saveSingleTransactionData(item);
    }
  }

  /**
   * Check for changed project value is add new
   * @param event value
   * @param item
   */
  projectChanged(event: any, item: any) {
    if (event.value === 0) {
      this.isAddNewProject = true;
      setTimeout(() => {
        item['transaction.projectCodeId'] = null;
      }, 100);
    } else {
      this.saveSingleTransactionData(item);
    }
  }

  /**
   * Attach a receipt for statement from receipt list
   * Removes the receipt id from other statements if present
   * @param id Receipt id
   */
  attachData(id: any) {
    if (id) {
      this.activeAction.previousReceiptId = this.activeAction['transaction.receiptId'];
      this.activeAction['transaction.receiptId'] = id;
      this.saveSingleTransactionData(this.activeAction).then(r => {
        this.getDataFromBackend();
      });
    } else {
      this.getDataFromBackend();
    }
  }


  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_PROCESS:
        this.bulkProcess();
        break;
    }
  }

  public bulkProcess() {
    this.selectedTransactions = this.tableSupportBase.rows;
    this.isProcessView = true;
  }

  saveSingleTransactionData(item: any) {
    this.cursorLoading = true;
    return new Promise<void>(resolve => {
      const transactionDto: TransactionDto = new TransactionDto();
      transactionDto.id = item.id;
      transactionDto.merchant = item['transaction.merchant'];
      transactionDto.description = item['transaction.description'];
      transactionDto.departmentId = item['transaction.department'];
      transactionDto.accountId = item['transaction.accountId'];
      transactionDto.projectCodeId = item['transaction.projectCodeId'];
      transactionDto.receiptId = item['transaction.receiptId'];
      transactionDto.missingReceiptAvailabilityBln = item['transaction.missingReceiptAvailability'];
      transactionDto.billable = item['transaction.billable'] ? 'Y' : 'N';
      transactionDto.missingReceiptFormId = item.missingReceiptFormId;
      transactionDto.previousReceiptId = item.previousReceiptId ? item.previousReceiptId : null;
      this.expenseService.saveSingleTransaction(transactionDto).subscribe(value => {
        this.cursorLoading = false;
        resolve();
      }, error => {
        this.cursorLoading = false;
        resolve();
      });
    });
  }

  clearSpace(val, col) {
    if (val[col][0] == ' ') {
      val[col] = '';
    }
  }

  processDone() {
    this.isProcessView = false;
    this.tableSupportBase.rows = [];
    this.selectedTransactions = [];
    this.getDataFromBackend();
  }

  /**
   * Search for Merchants on type
   * minimum 2 letters are required
   * @param event
   * @param item
   * @param onComplete event of selecting the value from suggestion list
   */
  searchMerchants(event: any, item, onComplete) {
    let text = '';
    if (!onComplete) {
      text = event.query;
      this.expenseService.searchMerchants(event.query).subscribe(res => {
        this.merchantResults = res.body;
      });
    } else {
      text = event;
    }

    if (item.accountChanged) {
      return;
    }
    if (!this.memorizationMerchant) {
      return;
    } else {
      this.expenseService.searchMerchantWiseAcc(text).subscribe(res => {
        item['transaction.accountId'] = res.body;
      });
    }
  }

  getMemoristionfeature() {
    this.manageFeatureService.getFeatureList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.featureIdList = res.body;
        for (const feature of this.featureIdList) {
          if (feature.featureId === this.featureIdEnum.MEMORIZE_ACCOUNT_BY_MERCHANT) {
            this.memorizationMerchant = feature.status;
          }
        }
      }
    });
  }

}
