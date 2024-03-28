import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {SplitTransactionDto} from "../../../shared/dto/expense/split-transaction-dto";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {ConfirmationService} from "primeng/api";
import {ManageDrawerService} from "../../../shared/services/common/manage-drawer-status/manage-drawer.service";

@Component({
  selector: 'app-credit-card-transaction-split',
  templateUrl: './credit-card-transaction-split.component.html',
  styleUrls: ['./credit-card-transaction-split.component.scss']
})
export class CreditCardTransactionSplitComponent implements OnInit {

  @Input() transactionId: any;
  @Output() onSuccess = new EventEmitter();
  public dataSource: SplitTransactionDto = new SplitTransactionDto();
  public projectCodeList: DropdownDto = new DropdownDto(); // Code List
  public expenseAccountList: DropdownDto = new DropdownDto(); // account List
  public isAddNewAccount = false;
  public isAddNewProject = false;
  public isLoading = false;
  public isLoadingRevoke = false;
  public balanceAmount = 0;
  public splitAmount = 0;
  public appAuthorities = AppAuthorities;
  public department: DropdownDto = new DropdownDto(); // Department List
  public isAddNewDepartment = false; // Add New Department Drawer Boolean

  constructor(private billsService: BillsService, public privilegeService: PrivilegeService,
              private confirmationService: ConfirmationService, public drawerService: ManageDrawerService,
              private notificationService: NotificationService, public expenseService: ExpenseService) {
  }

  ngOnInit(): void {
    this.getProjectTaskList();
    this.getAccounts();
    this.getSplitTransactions();
    this.getDepartment();
  }

  getSplitTransactions() {
    this.expenseService.getSplitTransactions(this.transactionId).subscribe((res: any) => {
      this.dataSource = res.body;
      if (res.body && res.body.splitCreditCardStatementDetails.length === 1) {
        this.addItem();
      }
      this.calculateTotal();
      this.validateFieldsColors();
    }, error => {
      this.notificationService.errorMessage(error);
    });
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

  onLItemClick(i: any) {
    const len = (this.dataSource.splitCreditCardStatementDetails.length) - 1;
    if (len === i) {
      this.addItem();
    }
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
        item.accountId = null;
      }, 100);
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
        item.projectCodeId = null;
      }, 100);
    }
  }

  calculateTotal() {
    this.splitAmount = this.dataSource.splitCreditCardStatementDetails.reduce((total, transaction) => total + transaction.amount, 0);
    this.splitAmount = parseFloat(this.splitAmount.toFixed(2)); // round to 2 decimals and convert back to a number
    this.balanceAmount = this.dataSource.amount - this.splitAmount;
  }

  addItem() {
    this.dataSource.splitCreditCardStatementDetails.push(this.getEmptyObject());
  }

  removeItem(i: any) {
    this.dataSource.splitCreditCardStatementDetails.splice(i, 1);
  }

  getEmptyObject() {
    return {accountId: null, projectId: null, description: null, amount: 0};
  }

  reset() {
    this.getSplitTransactions();
  }

  revoke() {
    this.confirmationService.confirm({
      key: 'revoke-tran',
      message: 'You want to remove Split Transactions',
      accept: () => {
        this.isLoadingRevoke = true;
        this.expenseService.revokeSplitTransaction(this.transactionId).subscribe({
          next: (res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_TRANSACTION_REVOKED_SUCCESSFULLY);
              this.onSuccess.emit(false);
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
            this.isLoadingRevoke = false;
          }, error: (err) => {
            this.notificationService.errorMessage(err);
            this.isLoadingRevoke = false;
          }
        });
      }
    });
  }

  submit() {
    if (!this.isValidLineCount() || !this.isValidCalculation() || !this.checkConditions()) {
      return;
    }

    this.isLoading = true;
    this.expenseService.splitTransaction(this.dataSource).subscribe({
      next: (res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_TRANSACTION_SPLITTED_SUCCESSFULLY);
          this.onSuccess.emit(true);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.isLoading = false;
      }, error: (err) => {
        this.notificationService.errorMessage(err);
        this.isLoading = false;
      }
    });
  }

  isValidCalculation() {
    return this.balanceAmount === 0;
  }

  isValidLineCount() {
    // filter the array to only include objects where both 'amount' and 'account' are not null
    const filteredArray = this.dataSource.splitCreditCardStatementDetails.filter(item => item.amount !== null &&
      item.amount !== 0 && item.account !== null);

    // check if the length of the filtered array is 2 or more
    return filteredArray.length >= 2;
  }

  checkConditions(): boolean {
    return this.dataSource.splitCreditCardStatementDetails.every(object => {
      if (object.accountId && object.amount && object.amount !== 0) {
        // Both accountId and amount are filled and amount is not zero.
        return true;
      } else {
        return !object.accountId && (object.amount === null || object.amount === 0);
      }
    });
  }

  validateAccount(i) {
    const account = this.dataSource.splitCreditCardStatementDetails[i].accountId;
    const amount = this.dataSource.splitCreditCardStatementDetails[i].amount;
    return !!(!account && amount);

  }

  validateAmount(i) {
    const account = this.dataSource.splitCreditCardStatementDetails[i].accountId;
    const amount = this.dataSource.splitCreditCardStatementDetails[i].amount;
    return account && (amount === null || amount === 0);
  }

  validateFieldsColors() {
    this.dataSource.splitCreditCardStatementDetails.forEach((item, i) => {
      item.isAccountInvalid = this.validateAccount(i);
      item.isAmountInvalid = this.validateAmount(i);
    });
  }

}
