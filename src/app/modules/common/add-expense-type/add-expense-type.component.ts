import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {MessageService} from "primeng/api";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {ExpenseService} from "../../../shared/services/expense/expense.service";

@Component({
  selector: 'app-add-expense-type',
  templateUrl: './add-expense-type.component.html',
  styleUrls: ['./add-expense-type.component.scss']
})
export class AddExpenseTypeComponent implements OnInit {

  public expenseTypeForm: UntypedFormGroup;
  @Output() updateExpenseTypes = new EventEmitter();
  public removeSpace: RemoveSpace = new RemoveSpace();
  public loading = false;

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService,
              public messageService: MessageService, public privilegeService: PrivilegeService,
              public expenseService: ExpenseService) {
    this.expenseTypeForm = this.formBuilder.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  /**
   * This method can be used to create uom
   */
  createNewExpenseType() {
    this.loading = true;
    if (this.expenseTypeForm.valid) {
      this.createExpenseType(this.expenseTypeForm.value);
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.expenseTypeForm);
    }
  }

  /**
   * This method can be use to reset uom form
   */
  reset() {
    this.expenseTypeForm.reset();
  }

  /**
   * This method use for create new uom
   * @param expenseType object
   */
  createExpenseType(expenseType) {
    this.expenseService.createExpenseType(expenseType).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.notificationService.successMessage(HttpResponseMessage.EXPENSE_TYPE_CREATED_SUCCESSFULLY);
        this.loading = false;
        this.reset();
        this.updateExpenseTypes.emit();
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }
}
