import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ExpenseListComponent} from '../expense-list/expense-list.component';
import {ExpenseCreateComponent} from '../expense-create/expense-create.component';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {ReceiptUploadComponent} from '../receipt-upload/receipt-upload.component';
import {CreditCardUploadComponent} from '../credit-card-upload/credit-card-upload.component';
import {
  CreditCardCreateTransactionComponent
} from '../credit-card-create-transaction/credit-card-create-transaction.component';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {CreditCardUploadedListComponent} from '../credit-card-uploaded-list/credit-card-uploaded-list.component';
import {CreditCardProcessListComponent} from '../credit-card-process-list/credit-card-process-list.component';
import {ReceiptListComponent} from '../receipt-list/receipt-list.component';
import {VCardListComponent} from '../v-card-list/v-card-list.component';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

export class ExpenseState {
  public activeTab?: any;
}

@Component({
  selector: 'app-expense-home',
  templateUrl: './expense-home.component.html',
  styleUrls: ['./expense-home.component.scss']
})
export class ExpenseHomeComponent implements OnInit, OnDestroy {
  @ViewChild('expenseList') public expenseList: ExpenseListComponent;
  @ViewChild('receiptListComponent') public receiptListComponent: ReceiptListComponent;
  @ViewChild('creditCardUploadedListComponent') public creditCardUploadedListComponent: CreditCardUploadedListComponent;
  @ViewChild('creditCardProcessListComponent') public creditCardProcessListComponent: CreditCardProcessListComponent;
  @ViewChild('createExpenseComponent') public expenseCreateComponent: ExpenseCreateComponent;
  @ViewChild('receiptUploadComponent') public receiptUploadComponent: ReceiptUploadComponent;
  @ViewChild('cardUploadComponent') public cardUploadComponent: CreditCardUploadComponent;
  @ViewChild('cardCreateTransactionComponent') public cardCreateTransactionComponent: CreditCardCreateTransactionComponent;
  @ViewChild('vcardListComponent') vcardListComponent: VCardListComponent;

  public tabIndex: number;
  public creditCardTabIndex: number;
  public state: ExpenseState = new ExpenseState();
  public isCreateExpense = false;
  public isListExpense = true;
  public appAuthorities = AppAuthorities;
  public expenseId;
  public expenseDetailView = false;
  public expenseApproveView = false;
  public isProcessUpload = false;
  public isReceiptsUpload = false;
  public isCreateTransaction = false;
  public isCreateDigitalCard = false;
  public AppAnalyticsConstants = AppAnalyticsConstants;


  constructor(public route: ActivatedRoute, public privilegeService: PrivilegeService,
              public formGuardService: FormGuardService, public expenseService: ExpenseService,
              public router: Router, public notificationService: NotificationService) {
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('EXPENSE-TAB');
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('EXPENSE-TAB')) {
      this.state = JSON.parse(sessionStorage.getItem('EXPENSE-TAB'));
      this.tabIndex = this.state.activeTab;
    } else {
      if (this.isExpenseModule()) {
        this.tabIndex = 0;
      } else if (this.isCreditCardModule()) {
        this.tabIndex = 1;
      } else if (this.isVcardModule()) {
        this.tabIndex = 3;
      } else {
        this.tabIndex = 2;
      }
    }
    if (this.isCreditCardCreate()) {
      this.creditCardTabIndex = 0;
    } else if (this.isCreditCardUpload()) {
      this.creditCardTabIndex = 1;
    } else if (this.isCreditCardProcess()) {
      this.creditCardTabIndex = 2;
    } else if (this.isCreditCardSubmit()) {
      this.creditCardTabIndex = 3;
    } else {
      this.creditCardTabIndex = 4;
    }
    this.route.params.subscribe(params => {
      if (params.tab !== undefined) {
        this.tabChanged(parseInt(params.tab));
      }

      if (params.id && params.status && params.type) {
        if (params.type == AppEnumConstants.NOTIFICATION_TYPE_CREDIT_CARD) {
          this.openCreditCardScreens(params);
        } else if (params.type == AppEnumConstants.NOTIFICATION_TYPE_CREDIT_CARD_RECEIPT) {
          this.openReceiptsScreen();
        } else {
          this.openScreens(params);
        }
      }
    });
  }

  /**
   * this method execute when changed the tab
   * @param tabIndex to tab index
   */
  tabChanged(tabIndex: any) {
    if (tabIndex >= 1000) {
      this.tabIndex = 1;
    } else {
      this.tabIndex = tabIndex;
    }
    if (tabIndex == 1000) {
      this.creditCardTabIndex = 0;
    }
    if (tabIndex == 1001) {
      this.creditCardTabIndex = 1;
    }
    if (tabIndex == 1002) {
      this.creditCardTabIndex = 2;
    }
    if (tabIndex == 1003) {
      this.creditCardTabIndex = 3;
    }
    if (tabIndex == 1004) {
      this.creditCardTabIndex = 4;
    }

    const actionNames = [
      AppAnalyticsConstants.CREATE_EXPENSES,
    ];
    const actionName = actionNames[tabIndex] || '';
    this.storeSessionStore();
    this.expenseService.changeMainTabSet.next(actionName);
  }

  /**
   * store to session storage
   */
  storeSessionStore() {
    this.state.activeTab = this.tabIndex;
    sessionStorage.setItem('EXPENSE-TAB', JSON.stringify(this.state));
  }

  openReceiptsScreen() {
    this.tabIndex = 2;
  }

  openScreens(params) {
    if (params.status === AppEnumConstants.STATUS_PENDING) {
      this.expenseId = parseInt(params.id);
      this.expenseApproveView = true;
      this.expenseDetailView = false;
      return;
    }

    if (params.status === AppEnumConstants.STATUS_DELETED) {
      this.expenseDetailView = false;
      this.expenseApproveView = false;
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([AppEnumConstants.EXPENSE_URL]).then(r => {
          this.notificationService.infoMessage(HttpResponseMessage.EXPENSE_DELETED_ALREADY);
        }); // navigate to same route
      });
      return;
    }

    if (params.status === AppEnumConstants.STATUS_REJECT || params.status === AppEnumConstants.STATUS_APPROVED) {
      this.expenseId = parseInt(params.id);
      this.expenseApproveView = false;
      this.expenseDetailView = true;
      return;
    }
  }

  openCreditCardScreens(params) {
    this.tabIndex = 1;

    this.storeSessionStore();
    if (params.status === AppEnumConstants.STATUS_UNPROCCCESSED || params.status === AppEnumConstants.STATUS_REJECT) {
      this.creditCardTabIndex = 2;
      return;
    }

    if (params.status === AppEnumConstants.STATUS_PENDING) {
      this.creditCardTabIndex = 3;
      return;
    }

    if (params.status === AppEnumConstants.STATUS_DELETED) {
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([AppEnumConstants.EXPENSE_URL]).then(r => {
          this.notificationService.infoMessage(HttpResponseMessage.CREDIT_CARD_DELETED_ALREADY);
        }); // navigate to same route
      });
      return;
    }

    if (params.status === AppEnumConstants.STATUS_APPROVED) {
      this.creditCardTabIndex = 4;
      return;
    }
  }

  /**
   * this method can be used to change appearance content
   * @param contentString to content
   */
  toggleCreateExpense(contentString) {
    if (contentString === 'ec') {
      this.isCreateExpense = true;
      this.isListExpense = false;
    } else if (contentString === 'el') {
      this.isCreateExpense = false;
      this.isListExpense = true;
      this.refreshTableData();
    } else {
      this.isCreateExpense = false;
      this.isListExpense = true;
    }
    this.expenseList?.getDataFromBackend();
  }

  isExpenseTable() {
    return this.privilegeService.isAuthorizedMultiple([this.appAuthorities.EXPENSES_EDIT, this.appAuthorities.EXPENSES_DETAIL_VIEW,
      this.appAuthorities.EXPENSES_DELETE, this.appAuthorities.EXPENSES_APPROVE, this.appAuthorities.EXPENSES_REJECT,
      this.appAuthorities.EXPENSES_VIEW_AUDIT_TRAIL, this.appAuthorities.EXPENSES_DOWNLOAD_REPORT, this.appAuthorities.EXPENSES_VIEW_REPORT,
      this.appAuthorities.EXPENSES_CSV_EXPORT, this.appAuthorities.EXPENSES_QUICK_APPROVE, this.appAuthorities.EXPENSES_CHANGE_ASSIGNEE,
      this.appAuthorities.EXPENSES_UNDO_ACTION, AppAuthorities.EXPENSES_OVERRIDE_APPROVAL]);
  }

  detailViewClosed() {
    this.expenseDetailView = false;
    this.expenseApproveView = false;
    this.router.navigate([AppEnumConstants.EXPENSE_URL]); // navigate to same route
  }

  isExpenseModule() {
    return this.privilegeService.isAuthorizedMultiple([this.appAuthorities.EXPENSES_EDIT, this.appAuthorities.EXPENSES_DETAIL_VIEW,
      this.appAuthorities.EXPENSES_DELETE, this.appAuthorities.EXPENSES_APPROVE, this.appAuthorities.EXPENSES_REJECT,
      this.appAuthorities.EXPENSES_VIEW_AUDIT_TRAIL, this.appAuthorities.EXPENSES_DOWNLOAD_REPORT, this.appAuthorities.EXPENSES_VIEW_REPORT,
      this.appAuthorities.EXPENSES_CSV_EXPORT, this.appAuthorities.EXPENSES_QUICK_APPROVE, this.appAuthorities.EXPENSES_CHANGE_ASSIGNEE,
      this.appAuthorities.EXPENSES_UNDO_ACTION, AppAuthorities.EXPENSES_OVERRIDE_APPROVAL, this.appAuthorities.EXPENSES_CREATE,
      this.appAuthorities.EXPENSE_SAVE_AS_APPROVED]);
  }

  isVcardModule() {
    return this.privilegeService.isAuthorizedMultiple([this.appAuthorities.V_CARD_SEARCH, this.appAuthorities.V_CARD_EDIT,
      this.appAuthorities.V_CARD_CANCEL, this.appAuthorities.V_CARD_ACTIVITY_LOG, this.appAuthorities.V_CARD_TOP_UP,
      this.appAuthorities.V_CARD_ACTIVE, this.appAuthorities.V_CARD_INACTIVE]);
  }

  isExpenseCreate() {
    return this.privilegeService.isAuthorizedMultiple(
      [AppAuthorities.EXPENSES_CREATE, AppAuthorities.EXPENSE_SAVE_AS_APPROVED]);
  }

  isCreditCardModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_CREATE,
      AppAuthorities.CREDIT_CARD_EDIT, AppAuthorities.CREDIT_CARD_UPLOAD_TRANSACTION,
      AppAuthorities.CREDIT_CARD_UPLOAD_EDIT, AppAuthorities.CREDIT_CARD_ACTIVATE,
      AppAuthorities.CREDIT_CARD_INACTIVATE, AppAuthorities.CREDIT_CARD_DELETE,
      AppAuthorities.CREDIT_CARD_PROCESS_AUDIT_TRAIL, AppAuthorities.CREDIT_CARD_PROCESS_TRANSACTION_CREATE,
      AppAuthorities.CREDIT_CARD_PROCESS_SUBMIT, AppAuthorities.CREDIT_CARD_PROCESS_SAVE_AS_APPROVED,
      AppAuthorities.CREDIT_CARD_SUBMIT_OVERRIDE_APPROVE, AppAuthorities.CREDIT_CARD_SUBMIT_AUDIT_TRAIL,
      AppAuthorities.CREDIT_CARD_SUBMIT_APPROVE, AppAuthorities.CREDIT_CARD_SUBMIT_QUICK_APPROVE,
      AppAuthorities.CREDIT_CARD_SUBMIT_REJECT, AppAuthorities.CREDIT_CARD_SUBMIT_CHANGE_ASSIGNEE,
      AppAuthorities.CREDIT_CARD_SUBMIT_SKIP_APPROVAL, AppAuthorities.CREDIT_CARD_APPROVED_AUDIT_TRAIL,
      AppAuthorities.CREDIT_CARD_DELETE_STATEMENT, AppAuthorities.CREDIT_CARD_DELETE_TRANSACTION,
      AppAuthorities.CREDIT_CARD_APPROVED_GENERATE_BILL]);
  }

  isCreditCardCreate() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_CREATE,
      AppAuthorities.CREDIT_CARD_EDIT, AppAuthorities.CREDIT_CARD_ACTIVATE,
      AppAuthorities.CREDIT_CARD_INACTIVATE, AppAuthorities.CREDIT_CARD_DELETE]);
  }

  isCreditCardUpload() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_UPLOAD_TRANSACTION,
      AppAuthorities.CREDIT_CARD_UPLOAD_EDIT]);
  }

  isCreditCardProcess() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_PROCESS_AUDIT_TRAIL,
      AppAuthorities.CREDIT_CARD_PROCESS_SUBMIT, AppAuthorities.CREDIT_CARD_PROCESS_SAVE_AS_APPROVED,
      AppAuthorities.CREDIT_CARD_PROCESS_TRANSACTION_CREATE]);
  }

  isCreditCardSubmit() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_SUBMIT_AUDIT_TRAIL,
      AppAuthorities.CREDIT_CARD_SUBMIT_APPROVE, AppAuthorities.CREDIT_CARD_SUBMIT_QUICK_APPROVE,
      AppAuthorities.CREDIT_CARD_SUBMIT_REJECT, AppAuthorities.CREDIT_CARD_SUBMIT_CHANGE_ASSIGNEE,
      AppAuthorities.CREDIT_CARD_SUBMIT_SKIP_APPROVAL, AppAuthorities.CREDIT_CARD_SUBMIT_OVERRIDE_APPROVE]);
  }

  isCreditCardApprovedTransaction() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_APPROVED_AUDIT_TRAIL,
      AppAuthorities.CREDIT_CARD_APPROVED_GENERATE_BILL]);
  }

  isCreditCardReceipts() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_CARD_RECEIPT_UPLOAD,
      AppAuthorities.CREDIT_CARD_RECEIPT_DELETE, AppAuthorities.CREDIT_CARD_RECEIPT_DOWNLOAD_ATTACHMENT]);
  }

  toggleReceiptUpload(bool) {
    if (!bool) {
      this.isReceiptsUpload = bool;
    } else {
      this.isReceiptsUpload = bool;
    }
  }

  toggleUploadTransactions(bool) {
    if (!bool) {
      this.isProcessUpload = bool;
    } else {
      this.isProcessUpload = bool;
    }
  }

  toggleTransactionAdd(bool) {
    if (!bool) {
      this.isCreateTransaction = bool;
    } else {
      this.isCreateTransaction = bool;
    }
  }

  toggleDigitalCards(bool) {
    if (!bool) {
      this.isCreateDigitalCard = bool;
    } else {
      this.isCreateDigitalCard = bool;
    }
  }

  /**
   * Refresh account table data from another component
   */
  refreshTableData() {
    this.expenseService.updateTableData.next(true);
  }

  refreshReceiptTableData() {
    this.expenseService.receiptListSubject.next(true);

  }

  refreshTransactionTableData() {
    this.expenseService.uploadedTransactionSubject.next(true);
  }

  isVirtualDigitalCard() {
    return (this.privilegeService.isAuthorizedMultiple([AppAuthorities.V_CARD_SEARCH,
      AppAuthorities.V_CARD_EDIT, AppAuthorities.V_CARD_CANCEL, AppAuthorities.V_CARD_ACTIVITY_LOG,
      AppAuthorities.V_CARD_DETAIL_VIEW, AppAuthorities.V_CARD_ACTIVE, AppAuthorities.V_CARD_INACTIVE,
      AppAuthorities.V_CARD_TOP_UP, AppAuthorities.D_CARD_ACTIVITY_LOG, AppAuthorities.D_CARD_DETAIL_VIEW,
      AppAuthorities.V_CARD_CREATE]) && this.privilegeService.isPaymentConfig());
  }
}
