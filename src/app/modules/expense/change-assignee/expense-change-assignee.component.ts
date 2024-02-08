import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAutomationEvent} from '../../../shared/enums/app-automation-event';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {ExpenseMasterDto} from '../../../shared/dto/expense/expense-master-dto';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';

@Component({
  selector: 'app-expense-change-assignee',
  templateUrl: './expense-change-assignee.component.html',
  styleUrls: ['./expense-change-assignee.component.scss']
})
export class ExpenseChangeAssigneeComponent implements OnInit {

  @Input() heading: any;
  @Input() expenseId: number;
  @Input() creator: string;
  @Input() vendorId: any;
  public isProgressChangeAssigneeEvent = false;

  @Output()
  public refreshGridAfterChangedAssignee: EventEmitter<any> = new EventEmitter();

  public expenseChangeAssigneeForm: UntypedFormGroup;

  public approvalUsers: DropdownDto = new DropdownDto();
  public approvalGroup: DropdownDto = new DropdownDto();

  public expenseMastrDto: ExpenseMasterDto;


  constructor(public formBuilder: UntypedFormBuilder, public expenseService: ExpenseService, public messageService: MessageService,
              public notificationService: NotificationService, public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.expenseChangeAssigneeForm = this.formBuilder.group({
      approvalUser: [null, Validators.required],
      approvalGroup: [null, Validators.required],
      remark: [null, Validators.required]
    });
    this.getExpenseDetail(this.expenseId);
  }

  /**
   * This method use for get change assignee form controls
   */
  get changeAssignee() {
    return this.expenseChangeAssigneeForm.controls;
  }

  /**
   * Get expense details
   * @param id number to number
   */
  getExpenseDetail(id: number) {
    if (id) {
      this.expenseService.getExpenseDetails(id, false).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.expenseMastrDto = res.body;
          this.getApprovalUsers(this.approvalUsers);
          this.getApprovalGroups(this.approvalGroup);

        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * This method use for get all approvers to next level
   * @param listInstance DropdownDto
   */
  getApprovalUsers(listInstance: DropdownDto) {
    const authorities = [AppAuthorities.EXPENSES_APPROVE, AppAuthorities.EXPENSES_REJECT,
      AppAuthorities.EXPENSES_OVERRIDE_APPROVAL];
    if(!this.vendorId){
      this.billsService.getApprovalUserList(this.expenseMastrDto.approvalUser, authorities, true)
        .subscribe((res: any) => {
          listInstance.data = res.body;
        }, error => {
          this.notificationService.errorMessage(error);
        });
    }else {
      this.billsService.getApprovalUserListAccordingToVendorSelection(this.expenseMastrDto.approvalUser, authorities, this.vendorId, true)
        .subscribe((res: any) => {
          listInstance.data = res.body;
        }, error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * This method use for get all approval group
   * @param listInstance DropdownDto
   */
  getApprovalGroups(listInstance: DropdownDto) {
    this.billsService.getApprovalGroupList(true).subscribe((res: any) => {
      listInstance.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for change assignee
   */
  changeExpenseAssignee() {
    this.isProgressChangeAssigneeEvent = true;
    if (this.expenseChangeAssigneeForm.valid) {
      const expenseMasterDto = new ExpenseMasterDto();
      expenseMasterDto.id = this.expenseId;
      expenseMasterDto.documentTypeId = AppDocumentType.EXPENSE;
      expenseMasterDto.eventId = AppAutomationEvent.CHANGE_ASSIGNEE;
      expenseMasterDto.approvalUser = this.changeAssignee.approvalUser.value;
      expenseMasterDto.approvalGroup = this.changeAssignee.approvalGroup.value;
      expenseMasterDto.remarks = this.changeAssignee.remark.value;

      this.expenseService.changeAssignee(expenseMasterDto).subscribe((res: any) => {

        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(AppHttpResponseMessage.EXPENSE_CHANGE_ASSIGNEE_SUCCESSFULLY);
          this.isProgressChangeAssigneeEvent = false;

          this.refreshGridAfterChangedAssignee.emit();
          this.expenseChangeAssigneeForm.reset();

        } else {
          this.isProgressChangeAssigneeEvent = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isProgressChangeAssigneeEvent = false;
        this.notificationService.errorMessage(error);
      });

    } else {
      this.isProgressChangeAssigneeEvent = false;
      new CommonUtility().validateForm(this.expenseChangeAssigneeForm);
    }

  }

  /**
   * This method can be used to valid empty spaces in the form
   * @param controlName to form control name
   */
  removeFieldSpace(controlName: AbstractControl) {
    if (controlName && controlName.value && !controlName.value.replace(/\s/g, '').length) {
      controlName.setValue('');
    }
  }

  /**
   * This method use for validate approval user and approval group dropdowns
   */
  validateApprovalUserAndGroup() {
    const approvalUser = this.changeAssignee.approvalUser;
    const approvalGroup = this.changeAssignee.approvalGroup;

    if (approvalUser.value) {
      approvalGroup.clearValidators();
    }

    if (approvalGroup.value) {
      approvalUser.clearValidators();
    }

    if (!approvalUser.value && !approvalGroup.value) {
      approvalUser.setValidators([Validators.required]);
      approvalGroup.setValidators([Validators.required]);
    }

    approvalGroup.updateValueAndValidity();
    approvalUser.updateValueAndValidity();
  }


}
