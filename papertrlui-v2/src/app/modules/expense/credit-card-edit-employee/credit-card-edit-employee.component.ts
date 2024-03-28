import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {TableSupportBase} from "../../../shared/utility/table-support-base";
import {BillSubmitService} from "../../../shared/services/bills/bill-submit.service";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {ExpenseService} from "../../../shared/services/expense/expense.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {AppFormConstants} from "../../../shared/enums/app-form-constants";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";

@Component({
  selector: 'app-credit-card-edit-employee',
  templateUrl: './credit-card-edit-employee.component.html',
  styleUrls: ['./credit-card-edit-employee.component.scss']
})
export class CreditCardEditEmployeeComponent implements OnInit {

  public employeeList = new DropdownDto();
  public formGroup: UntypedFormGroup;
  public tableSupportBase = new TableSupportBase();

  @Output() onComplete = new EventEmitter();
  @Input() id;
  public loading = false;

  constructor(public formBuilder: UntypedFormBuilder, public billSubmitService: BillSubmitService,
              public automationService: AutomationService, public notificationService: NotificationService,
              public expenseService: ExpenseService) {
  }

  ngOnInit(): void {
    this.getEmployees();
    this.formGroup = this.formBuilder.group({
      groupedCardList: this.formBuilder.array([]),
    });
    this.getEmployeeData();
  }

  /**
   * Get user list
   */
  getEmployees() {
    this.automationService.getApprovalUserList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.employeeList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Get user list
   */
  getEmployeeData() {
    this.expenseService.getChangeEmployeeData(this.id).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          res?.body?.forEach((employee: any, index: number) => {
            this.addGroup();
            this.groupFormArray.at(index).get('employeeName').setValue(employee.name);
          });
          this.formGroup.get(AppFormConstants.GROUP_CARD_LIST).patchValue(res.body);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Return form array data
   */
  public get groupFormArray() {
    return this.formGroup.get(AppFormConstants.GROUP_CARD_LIST) as UntypedFormArray;
  }

  /**
   * Adding group arrays
   */
  addGroup() {
    const groupInfo = this.formBuilder.group({
      cardNo: [null],
      recordCount: [null],
      cardNoStr: [null],
      employeeId: [null],
      detailList: [null],
      statementId: [null],
      employeeName: [null],
      status: [false],
    });
    this.groupFormArray.push(groupInfo);
  }

  get f() {
    return this.formGroup.controls;
  }

  resetForm() {
    this.formGroup.reset();
    this.groupFormArray.clear();
    this.getEmployeeData();
  }

  submit() {
    this.expenseService.changeEmployee(this.formGroup.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CREDIT_CARD_ASSIGNEE_CHANGED_SUCCESSFULLY);
        this.onComplete.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    });
  }

  getProcessedCount(val: any) {
    let count = 0;
    val.detailList?.forEach(val => {
      if (val.status === AppEnumConstants.STATUS_APPROVED || val.status === AppEnumConstants.STATUS_PENDING) {
        count++
      }
    })
    return count;
  }
}
