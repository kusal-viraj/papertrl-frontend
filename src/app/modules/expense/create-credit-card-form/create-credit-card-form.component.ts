import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {AppConstant} from "../../../shared/utility/app-constant";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppFormConstants} from "../../../shared/enums/app-form-constants";
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-create-credit-card-form',
  templateUrl: './create-credit-card-form.component.html',
  styleUrls: ['./create-credit-card-form.component.scss']
})
export class CreateCreditCardFormComponent implements OnInit {
  public formGroup: UntypedFormGroup;
  public employees: DropdownDto = new DropdownDto();
  public vendorList: DropdownDto = new DropdownDto();
  public isLoading: any;
  @Input() editView = false;
  @Input() createView = false;
  @Input() cardId;

  @Input() panel: boolean;

  @Output() onComplete = new EventEmitter();
  public addNewVendor = false;
  public appAuthorities = AppAuthorities;
  public employee: any = {};

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public gaService: GoogleAnalyticsService,
              public expenseService: ExpenseService, public automationService: AutomationService, public billsService: BillsService,
              public billSubmitService: BillSubmitService, public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: [AppConstant.NULL_VALUE],
      vendorId: [AppConstant.NULL_VALUE],
      cardNo: [AppConstant.NULL_VALUE, Validators.required],
      employee: [AppConstant.NULL_VALUE, Validators.required],
    });
    this.getEmployees().then(() => {
      if (this.createView) {
        this.addEmployeeToEmployeeField();
      }
    });
    this.getVendorList();
    if (this.editView && !this.createView) {
      this.getCardData();
    }

  }

  resetForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_CREDIT_CARD,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    this.formGroup.reset();
    if (this.editView && !this.createView) {
      this.getCardData();
    }
  }

  addEmployeeToEmployeeField() {
    let employee;
    employee = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
    if (!employee) {
      employee = JSON.parse(sessionStorage.getItem(AppConstant.SESSION_USER_ATTR));
    }
    if (employee.email) {
      const user = this.employees.data.find(x => x.id == employee.email);
      this.employee = user;
      this.formGroup.get(AppFormConstants.EMPLOYEE).patchValue(user.id);
    }
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList() {
    this.billsService.getVendorList(!this.editView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.vendorList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getEmployees() {
    return new Promise<void>(resolve => {
      this.automationService.getApprovalUserList(!this.editView).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.employees.data = res.body;
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    })
  }

  /**
   * Get Existing Card Detail
   */
  getCardData() {
    this.expenseService.getCardDetail(this.cardId).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.employee = res.body.employee;
        this.formGroup.patchValue(res.body);
        this.formGroup.get('employee').patchValue(this.employee.id);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Add card button click
   * check for create or edit
   */
  submitForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.ADD_CARD,
      AppAnalyticsConstants.MODULE_NAME_CREDIT_CARD,
      AppAnalyticsConstants.ADD_CARD,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    this.isLoading = true;
    if (this.formGroup.valid) {
      this.formGroup.get('employee').patchValue(this.employee);
      if (this.editView && !this.createView) {
        this.updateCard();
      } else {
        this.addCard();
      }
    } else {
      this.isLoading = false;
      new CommonUtility().validateForm(this.formGroup);
    }
  }

  /**
   * Add Card
   * @private
   */
  private addCard() {
    this.expenseService.addCard(this.formGroup.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_ADDED_SUCCESSFULLY);
        this.expenseService.cardListSubject.next(true);
        this.onComplete.emit();
        this.formGroup.reset();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Update Card
   * @private
   */
  private updateCard() {
    this.expenseService.updateCard(this.formGroup.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_UPDATED_SUCCESSFULLY);
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

  changeVendorList(id) {
    if (id === 0) {
      this.addNewVendor = true;
      setTimeout(() => {
        this.formGroup.controls.vendorId.reset();
      }, 100);
    }
  }
}
