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
import {BulkNotificationDialogService} from '../../../shared/services/common/bulk-notifications/bulk-notification-dialog.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {GridService} from '../../../shared/services/common/table/grid.service';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AppConstant} from '../../../shared/utility/app-constant';
import {TransactionDto} from '../../../shared/dto/expense/transactionDto';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppBulkButton} from '../../../shared/enums/app-bulk-button';
import {BulkNotificationsComponent} from '../../common/bulk-notifications/bulk-notifications.component';
import {AppTableHeaderActions} from '../../../shared/enums/app-table-header-actions';
import {Menu} from 'primeng/menu';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-credit-card-submit-list',
  templateUrl: './credit-card-submit-list.component.html',
  styleUrls: ['./credit-card-submit-list.component.scss']
})
export class CreditCardSubmitListComponent implements OnInit, OnDestroy {

  public activeAction: any;
  public tableSupportBase = new TableSupportBase();
  public bulkButtonList: ButtonPropertiesDto[] = [];
  public auditTrial: AuditTrialDto[] = [];
  public expenseMasterDto: ExpenseMasterDto = new ExpenseMasterDto();
  public bulkButtonListResponsive: any;
  public AppAnalyticsConstants = AppAnalyticsConstants;
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public tableKeyEnum = AppTableKeysData;
  public actionLabelEnum = AppActionLabel;
  public iconEnum = AppIcons;
  public commonUtil = new CommonUtility();
  public appEnumConstants = AppEnumConstants;
  public isAddNewAccount = false;
  public isAddNewProject = false;
  public projectCodeList: DropdownDto = new DropdownDto();
  public expenseAccountList: DropdownDto = new DropdownDto();
  public approvalUserList: DropdownDto = new DropdownDto(); // User List
  public approvalGroupList: DropdownDto = new DropdownDto(); // User List
  public viewChangeAssignee = false;
  public cursorLoading = false;
  public auditTrialPanel = false;
  public subscription: Subscription;
  public showFilter = false;
  public showFilterColumns = false;
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
    sessionStorage.removeItem(AppTableKeysData.SUBMITTED_CARD_TABLE_KEY);
    this.subscription.unsubscribe();
  }

  onTableResize() {
    this.tableSupportBase.isTableInResponsive = !(window.innerWidth <= AppWindowResolution.MIN_INNER_WINDOW_WIDTH);
  }


  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public expenseService: ExpenseService, public billsService: BillsService,
              public bulkNotificationDialogService: BulkNotificationDialogService,
              public drawerService: ManageDrawerService, public gaService: GoogleAnalyticsService,
              public privilegeService: PrivilegeService, public gridService: GridService,
              public billApprovalsService: BillApprovalsService, public automationService: AutomationService,
              public confirmationService: ConfirmationService) {
  }

  ngOnInit(): void {
    this.availableHeaderActions.push(AppTableHeaderActions.FILTER);
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_SUBMIT_QUICK_APPROVE,
      AppAuthorities.CREDIT_CARD_SUBMIT_OVERRIDE_APPROVE])) {
      this.availableHeaderActions.push(AppTableHeaderActions.QUICK_APPROVE);
    }
    if (this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_SUBMIT_REJECT,
      AppAuthorities.CREDIT_CARD_SUBMIT_OVERRIDE_APPROVE])) {
      this.availableHeaderActions.push(AppTableHeaderActions.REJECT);
    }
    this.availableHeaderActions.push(AppTableHeaderActions.COLUMNS);
    this.availableHeaderActions.push(AppTableHeaderActions.REFRESH);
    this.availableHeaderActions.push(AppTableHeaderActions.CLEAR_FILTER);

    this.actionButtonInit();
    this.loadTableData();
    this.getAccounts();
    this.getProjectTaskList();
    this.getApprovalUserList();
    this.getApprovalGroupList();
    this.getDepartment();
    this.subscription = this.expenseService.submittedListSubject.subscribe(() => {
      if (this.tableSupportBase.searchFilterDto?.filters) {
        this.tableSupportBase.rows = [];
        this.getDataFromBackend();
      }
    });
  }


  onTableChanged(event?) {
    const promise = this.tableSupportBase.tableChanged(this.table, AppTableKeysData.SUBMITTED_CARD_TABLE_KEY);
    promise.then(result => {
      this.tableSupportBase.tableDataOptions = result;
      this.tableSupportBase.tableDataOptions.gridName = this.appConstant.GRID_NAME_TRANSACTION_LIST;
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
   * This service use for get user list
   */
  getApprovalUserList() {
    const authorities = [AppAuthorities.CREDIT_CARD_SUBMIT_APPROVE, AppAuthorities.CREDIT_CARD_SUBMIT_REJECT,
      AppAuthorities.CREDIT_CARD_SUBMIT_OVERRIDE_APPROVE];
    this.billsService.getApprovalUserList(null, authorities, true).subscribe((res: any) => {
      this.approvalUserList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This service use for get approval group list
   */
  getApprovalGroupList() {
    this.billsService.getApprovalGroupList(true).subscribe((res: any) => {
      this.approvalGroupList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }
  /**
   * Loads Table Data (Settings)
   */
    loadTableData() {
    this.selectedColumns = [];
    this.onTableResize();
    sessionStorage.removeItem(AppTableKeysData.SUBMITTED_CARD_TABLE_KEY);
    this.gridService.getTableStructure(this.appConstant.GRID_NAME_TRANSACTION_LIST).subscribe((res: any) => {
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
        label: AppActionLabel.ACTION_LABEL_APPROVE,
        icon: AppIcons.ICON_APPROVE,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_SUBMIT_APPROVE,
          AppAuthorities.CREDIT_CARD_SUBMIT_OVERRIDE_APPROVE]),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_APPROVE,
            AppAnalyticsConstants.MODULE_NAME_SUBMITTED_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_APPROVE,
          );
          this.approve();
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_REJECT,
        icon: AppIcons.ICON_REJECT,
        status: this.enums.STATUS_COMMON,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_SUBMIT_REJECT),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_REJECT,
            AppAnalyticsConstants.MODULE_NAME_SUBMITTED_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_REJECT,
          );
          this.reject();
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_SKIP_APPROVAL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_SUBMIT_SKIP_APPROVAL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL,
            AppAnalyticsConstants.MODULE_NAME_SUBMITTED_TRANSACTIONS,
            this.actionLabelEnum.ACTION_LABEL_SKIP_APPROVAL,
          );
          const id = this.activeAction.id;
          this.skipApproval(id);
        }
      },
      {
        label: this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE,
        status: this.enums.STATUS_PENDING,
        icon: this.iconEnum.ICON_CHANGE_ASSIGNEE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_SUBMIT_CHANGE_ASSIGNEE),
        command: () => {
          this.gaService.trackNestedTableEvent(
            this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE,
            AppAnalyticsConstants.MODULE_NAME_SUBMITTED_TRANSACTIONS,
            this.actionLabelEnum.ACTION_LABEL_CHANGE_ASSIGNEE,
          );
          this.viewChangeAssignee = true;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
        status: this.enums.STATUS_COMMON,
        icon: AppIcons.ICON_AUDIT_TRAIL,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_SUBMIT_AUDIT_TRAIL),
        command: () => {
          this.gaService.trackNestedTableEvent(
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
            AppAnalyticsConstants.MODULE_NAME_SUBMITTED_TRANSACTIONS,
            AppActionLabel.ACTION_LABEL_AUDIT_TRAIL,
          );
          this.expenseService.getTransactionAuditTrial(this.activeAction.id).subscribe((res: any) => {
            this.auditTrial = res.body;
            this.auditTrialPanel = true;
          });
        }
      }
    ];
  }

  showSplit(){
    this.showSplitPopup = true;
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
    this.expenseService.getSubmittedTableData(this.tableSupportBase.searchFilterDto, AppEnumConstants.STATUS_PENDING)
      .subscribe((res: any) => {
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




  /**
   * This method use for handle bulk action events
   * @param action string
   */
  bulkButtonAction(action) {
    switch (action) {
      case AppBulkButton.BUTTON_APPROVE:
        this.bulkApprove();
        break;
      case AppBulkButton.BUTTON_REJECT:
        this.bulkReject();
        break;
    }
  }

  public bulkApprove() {
    if (this.tableSupportBase.rows.length > 0) {
      const transactionDtoList: TransactionDto[] = [];
      for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
        const transactionDto: TransactionDto = new TransactionDto();
        transactionDto.nextAssignee = this.tableSupportBase.rows[i]['transaction.approver'];
        transactionDto.id = this.tableSupportBase.rows[i].id;
        transactionDtoList.push(transactionDto);
      }
      this.expenseService.bulkSubmittedApprove(transactionDtoList).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
          } else {
            this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_STATEMENT_BULK_APPROVED_SUCCESSFULLY);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
            this.expenseService.approvedListSubject.next(true);
          }
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  private reject() {
    this.confirmationService.confirm({
      key: 'pReject',
      message: 'You want to reject the selected transaction',
      accept: () => {
        const transactionDto: TransactionDto = new TransactionDto();
        transactionDto.remarks = this.activeAction['transaction.remarks'];
        transactionDto.id = this.activeAction.id;
        this.expenseService.submittedReject(transactionDto).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_STATEMENT_REJECT_SUCCESSFULLY);
            this.getDataFromBackend();
            this.tableSupportBase.rows = [];
            this.expenseService.processListSubject.next(true);
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
      }
    });
  }

  private approve() {
    const transactionDto: TransactionDto = new TransactionDto();
    transactionDto.nextAssignee = this.activeAction['transaction.approver'];
    transactionDto.id = this.activeAction.id;
    this.expenseService.submittedApprove(transactionDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_STATEMENT_APPROVED_SUCCESSFULLY);
        this.getDataFromBackend();
        this.expenseService.approvedListSubject.next(true);
        this.tableSupportBase.rows = [];
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  public bulkReject() {
    this.confirmationService.confirm({
      key: 'pReject',
      message: 'You want to reject the selected transaction(s)',
      accept: () => {
        if (this.tableSupportBase.rows.length > 0) {
          const transactionDtoList: TransactionDto[] = [];
          for (let i = 0; this.tableSupportBase.rows.length > i; i++) {
            const transactionDto: TransactionDto = new TransactionDto();
            transactionDto.remarks = this.tableSupportBase.rows[i]['transaction.remarks'];
            transactionDto.id = this.tableSupportBase.rows[i].id;
            transactionDtoList.push(transactionDto);
          }
          this.expenseService.bulkSubmittedReject(transactionDtoList).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              if (res.body.status !== AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
                this.bulkNotificationDialogService.show(BulkNotificationsComponent, res.body);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
              } else {
                this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_STATEMENT_BULK_REJECT_SUCCESSFULLY);
                this.getDataFromBackend();
                this.tableSupportBase.rows = [];
                this.expenseService.processListSubject.next(true);
              }
            } else {
              this.notificationService.errorMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      }
    });
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
}
