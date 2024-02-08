import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {BillApprovalsService} from "../../../shared/services/bills/bill-approvals.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {CommonMessage} from "../../../shared/utility/common-message";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {TransactionDto} from "../../../shared/dto/expense/transactionDto";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppHttpResponseMessage} from "../../../shared/enums/app-http-response-message";
import {BillsService} from '../../../shared/services/bills/bills.service';
import {ManageFeatureService} from "../../../shared/services/settings/manage-feature/manage-feature.service";
import {AppFeatureId} from "../../../shared/enums/app-feature-id";
import {ManageDrawerService} from "../../../shared/services/common/manage-drawer-status/manage-drawer.service";

@Component({
  selector: 'app-credit-card-process',
  templateUrl: './credit-card-process.component.html',
  styleUrls: ['./credit-card-process.component.scss']
})
export class CreditCardProcessComponent implements OnInit {

  @Input() id = new EventEmitter(); // Id of the process data
  @Input() transactions
  @Output() close = new EventEmitter();
  @Output() onSuccess = new EventEmitter();

  public cardNo = 'XXXX-XXXX-XXXX-1111'; // Card No
  public transactionList: any; // The Statement List
  public viewApprovalComment = false;  // Shows the approval comment column if the statement is rejected
  public isAddNewAccount = false; // Add New Account Drawer Boolean
  public isAddNewProject = false; // Add New Code Drawer Boolean
  public isAddNewDepartment = false; // Add New Department Drawer Boolean
  public projectCodeList: DropdownDto = new DropdownDto(); // Code List
  public approvalUserList: DropdownDto = new DropdownDto(); // User List
  public approvalGroupList: DropdownDto = new DropdownDto(); // Approval Group List
  public selectedReceiptId: any; // The Selected Receipt of the statement which is coloured in light green
  public selectedMissingReceiptId: any; // The Selected Receipt of the statement which is coloured in light green
  public totalAmount = 0; // The total amount
  public saveLoading = false; // Save Button loader button
  public saveAsApprovedLoading = false; // Save as approved Button loader button
  public submitLoading = false; // Submission Button loader button
  public adHockWorkflow = []; // The work flow list
  public selectedData: any[] = []; // Selected data to send backend
  public featureIdList: any [] = [];
  public memorizationMerchant: boolean;
  public activeTransaction: any;
  public merchantResults: any;
  public cursorLoading = false;
  public showSplitPopup = false;
  public splitTransactionId: any;
  public appAuthorities = AppAuthorities;
  public featureIdEnum = AppFeatureId;
  public expenseAccountList: DropdownDto = new DropdownDto();
  public department: DropdownDto = new DropdownDto();


  constructor(public billApprovalsService: BillApprovalsService, public privilegeService: PrivilegeService,
              public manageFeatureService: ManageFeatureService, public notificationService: NotificationService, public expenseService: ExpenseService,
              public automationService: AutomationService, public billsService: BillsService, public drawerService: ManageDrawerService) {
    this.getMemoristionfeature();
  }

  ngOnInit(): void {

    this.getProjectTaskList();
    this.getAccounts();
    this.getDepartment();
    this.getStatementList();
    this.initWorkFlow();
    this.getApprovalUserList();
    this.getApprovalGroupList();
  }

  /**
   * Get Statement List
   */
  getStatementList() {
    const ids = this.transactions.map(a => a.id);
    this.expenseService.getTransactionListToIds(ids).subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        res.body.forEach((val) => {
          val.missingReceiptAvailabilityBln = val.missingReceiptAvailability === 'Y';
        })
        this.transactionList = res.body;
        Object.freeze(this.transactionList);
        this.selectedData = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message)
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  // Calculates the total
  getTotalCount() {
    let total = 0;
    this.selectedData.forEach(x => total += x.amount);
    return total;
  }

  // Add a workflow
  initWorkFlow() {
    this.adHockWorkflow.push(
      {approvalUser: null, approvalGroup: null}
    )
  }

  showSplit() {
    this.showSplitPopup = true;
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
   * Close Drawer
   */
  closeDrawer() {
    this.close.emit();
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
        item.projectCodeId = null;
      }, 100);
    } else {
      this.saveSingleTransactionData(item);
    }
  }

  /**
   * Add a attachment for the statement
   * @param event
   * @param item
   */
  changeAttachment(event, item) {
    if (!event.target?.files[0]) {
      return;
    }

    if ((event.target.files[0] / 1024 / 1024) > AppConstant.COMMON_FILE_SIZE) {
      this.notificationService.infoMessage(CommonMessage.INVALID_FILE_SIZE);
      return false;
    }
    const targetFile = event.target.files[0];
    item.attachment = targetFile;
    item.attachmentName = targetFile.name;
    item.receiptId = null;
    let obj = {
      attachment: targetFile,
      transactionId: this.activeTransaction.id
    }
    this.cursorLoading = true;
    this.expenseService.saveAttachmentToTransaction(obj).subscribe((res: any) => {
      this.cursorLoading = false;
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        this.getStatementList();
      }
    }, error => {
      this.cursorLoading = false;
    });
  }

  /**
   * Attach a receipt for statement from receipt list
   * Removes the receipt id from other statements if present
   * @param id Receipt Id
   */
  attachData(id: any) {
    if (id) {
      this.activeTransaction.previousReceiptId = this.activeTransaction.receiptId;
      this.activeTransaction.receiptId = id;
      this.saveSingleTransactionData(this.activeTransaction).then(r => {
        this.getStatementList();
      });
    } else {
      this.getStatementList();
    }
  }

  /**
   * Reset all the data to initial state
   */
  reset() {
    this.adHockWorkflow = [];
    this.transactionList = [];
    this.selectedReceiptId = null;
    this.initWorkFlow();
    this.getStatementList();
  }

  /**
   * Submit the statement list with the work flow
   * @param save
   */
  submit(save: string) {
    const ids = this.selectedData.map(x => x.id);
    if (ids.length == 0) {
      this.notificationService.infoMessage(AppHttpResponseMessage.SELECT_AT_LEAST_ONE_TRANSACTION);
      return;
    }
    const obj = {transactionIdList: ids, adHocWorkflowDetails: this.adHockWorkflow}
    if (save === 'APPROVED') {
      this.saveAsApprovedLoading = true;
      this.saveAsApproved(obj);
      return;
    }

    if (save === 'SUBMIT') {
      this.submitLoading = true;
      this.submitStatements(obj);
      return;
    }
  }

  submitStatements(obj) {
    this.expenseService.submitStatements(obj).subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_SUBMIT_TRANSACTION_SUCCESSFULLY);
        this.onSuccess.emit(true);
        this.expenseService.submittedListSubject.next(true);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.submitLoading = false;
    }, error => {
      this.submitLoading = false;
      this.notificationService.errorMessage(error);
    })
  }

  saveAsApproved(obj) {
    this.expenseService.saveAsApprovedStatements(obj).subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_SAVE_AS_APPROVED_TRANSACTION_SUCCESSFULLY);
        this.onSuccess.emit(true);
        this.expenseService.approvedListSubject.next(true);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.saveAsApprovedLoading = false;
    }, error => {
      this.saveAsApprovedLoading = false;
      this.notificationService.errorMessage(error);
    })
  }

  /**
   * Delete the Workflow for the specific id
   * @param i
   */
  deleteWorkflow(i: number) {
    this.adHockWorkflow.splice(i, 1);
  }


  saveSingleTransactionData(item: any) {
    this.cursorLoading = true;
    return new Promise<void>(resolve => {
      const transactionDto: TransactionDto = new TransactionDto();
      transactionDto.id = item.id;
      transactionDto.merchant = item.merchant;
      transactionDto.description = item.description;
      transactionDto.departmentId = item.departmentId;
      transactionDto.accountId = item.accountId;
      transactionDto.projectCodeId = item.projectCodeId;
      transactionDto.receiptId = item.receiptId;
      transactionDto.missingReceiptAvailabilityBln = item.missingReceiptAvailabilityBln;
      transactionDto.billable = item.billableBln ? 'Y' : 'N';
      transactionDto.missingReceiptFormId = item.missingReceiptFormId;
      transactionDto.previousReceiptId = item.previousReceiptId ? item.previousReceiptId : null;
      this.expenseService.saveSingleTransaction(transactionDto).subscribe(value => {
        this.cursorLoading = false;
        resolve();
      }, error => {
        this.cursorLoading = false;
        resolve()
      });
    })
  }

  clearSpace(val) {
    if (val[0] == ' ') {
      val = '';
    }
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
        item.accountId = res.body;
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

  updateSplitRecord(val) {
    const i = this.transactionList.findIndex(x => x.id === this.splitTransactionId);
    if (i >= 0){
      this.transactionList[i].split = val;
    }
  }
}
