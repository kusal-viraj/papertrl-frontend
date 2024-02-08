import {Component, EventEmitter, HostListener, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {AppFormConstants} from "../../../shared/enums/app-form-constants";
import {AppConstant} from "../../../shared/utility/app-constant";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-credit-card-create-transaction',
  templateUrl: './credit-card-create-transaction.component.html',
  styleUrls: ['./credit-card-create-transaction.component.scss']
})
export class CreditCardCreateTransactionComponent implements OnInit {
  public formGroup: UntypedFormGroup;
  public employeeList = new DropdownDto();
  public formatList = new DropdownDto();
  public merchants = new DropdownDto();
  public isLoading = false;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  private onComplete = new EventEmitter();
  public merchantResults: any;
  public cardResults: any;
  public cards: DropdownDto = new DropdownDto();
    public addNewCard = false;

  constructor(public formBuilder: UntypedFormBuilder, public billSubmitService: BillSubmitService,
              public gaService: GoogleAnalyticsService,
              public notificationService: NotificationService, public automationService: AutomationService,
              public expenseService: ExpenseService, public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      cardNo: [null, Validators.required],
      transactionDate: [null, Validators.required],
      postingDate: [null],
      merchant: [null, Validators.required],
      description: [null],
      amount: [null, Validators.compose([Validators.required, Validators.min(0.01)])],
    });
    this.getMerchants();
    this.getExistingCards();
  }

  getExistingCards() {
    this.expenseService.getExistingCards(false, true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.cards.data = res.body;
        if (this.privilegeService.isAuthorized(AppAuthorities.CREDIT_CARD_CREATE)) {
          this.cards.data.splice(0, 0, {id: -1, name: 'Add New'});
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * Get user list
   */
  getMerchants() {
    this.automationService.getApprovalUserList(true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.merchants.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  submitForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.ADD_TRANSACTIONS,
      AppAnalyticsConstants.MODULE_NAME_PROCESS_TRANSACTIONS,
      AppAnalyticsConstants.ADD_TRANSACTIONS,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    this.isLoading = true;
    if (this.formGroup.valid) {
      let obj = this.formGroup.value
      obj.postingDateStr = null;
      obj.transactionDateStr = null;

      if (obj.transactionDate) {
        try {
          obj.transactionDateStr = obj.transactionDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        } catch (e) {

        }
      }
      if (obj.postingDate) {
        try {
          obj.postingDateStr = obj.postingDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
        } catch (e) {

        }
      }
      if (obj.cardNo?.id) {
        obj.cardNo = obj.cardNo.id;
      }
      this.createTransaction(obj);
    } else {
      this.isLoading = false;
      new CommonUtility().validateForm(this.formGroup);
    }
  }


  /**
   * Add Card
   * @private
   */
  private createTransaction(obj) {
    this.expenseService.createTransaction(obj).subscribe((res: any) => {
      if (res.status === AppResponseStatus.STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_TRANSACTION_ADDED_SUCCESSFULLY);
        this.expenseService.cardListSubject.next(true);
        this.expenseService.processListSubject.next(true);
        this.isLoading = false;
        this.resetForm();
        this.onComplete.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  resetForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_PROCESS_TRANSACTIONS,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    this.formGroup.reset();
  }

  searchMerchants(event: any) {
    this.expenseService.searchMerchants(event.query).subscribe(res => {
      this.merchantResults = res.body;
    })
  }

  cardChanged(event: any) {
    if (event.value === -1) {
      this.formGroup.get(AppFormConstants.CARD_NO).reset();
      this.addNewCard = true;
    }
  }
}
