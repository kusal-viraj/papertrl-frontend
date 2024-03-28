import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {ExpenseMasterDto} from '../../../shared/dto/expense/expense-master-dto';
import {ExpenseService} from '../../../shared/services/expense/expense.service';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAutomationEvent} from '../../../shared/enums/app-automation-event';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';

@Component({
  selector: 'app-credit-card-change-assignee',
  templateUrl: './credit-card-change-assignee.component.html',
  styleUrls: ['./credit-card-change-assignee.component.scss']
})
export class CreditCardChangeAssigneeComponent implements OnInit {

  @Input() heading: any;
  @Input() id: number;
  @Input() vendorId: any;
  public loading = false;

  @Output() public refreshGridAfterChangedAssignee: EventEmitter<any> = new EventEmitter();

  public formGroup: UntypedFormGroup;

  public approvalUsers: DropdownDto = new DropdownDto();
  public approvalGroup: DropdownDto = new DropdownDto();

  public masterDto: any;


  constructor(public formBuilder: UntypedFormBuilder, public expenseService: ExpenseService, public messageService: MessageService,
              public notificationService: NotificationService, public automationService: AutomationService, public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      approvalUser: [null, Validators.required],
      approvalGroup: [null, Validators.required],
      remark: [null, Validators.required]
    });
    this.getCreditCardDetails(this.id);
  }

  /**
   * This method use for get change assignee form controls
   */
  get changeAssignee() {
    return this.formGroup.controls;
  }

  /**
   * Get expense details
   * @param id number to number
   */
  getCreditCardDetails(id: number) {
    if (id) {
      this.expenseService.getTransactionListToIds([id]).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.masterDto = res.body[0];
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
    const authorities = [AppAuthorities.CREDIT_CARD_SUBMIT_APPROVE, AppAuthorities.CREDIT_CARD_SUBMIT_REJECT,
      AppAuthorities.CREDIT_CARD_SUBMIT_OVERRIDE_APPROVE];
    if (!this.vendorId) {
      this.billsService.getApprovalUserList(null, authorities, true).subscribe((res: any) => {
        listInstance.data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      this.billsService.getApprovalUserListAccordingToVendorSelection(null, authorities, this.vendorId, true)
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
    this.loading = true;
    if (this.formGroup.valid) {
      const expenseMasterDto = new ExpenseMasterDto();
      expenseMasterDto.id = this.id;
      expenseMasterDto.documentTypeId = AppDocumentType.EXPENSE;
      expenseMasterDto.eventId = AppAutomationEvent.CHANGE_ASSIGNEE;
      expenseMasterDto.approvalUser = this.changeAssignee.approvalUser.value;
      expenseMasterDto.approvalGroup = this.changeAssignee.approvalGroup.value;
      expenseMasterDto.remarks = this.changeAssignee.remark.value;

      this.expenseService.changeTransactionAssignee(expenseMasterDto).subscribe((res: any) => {

        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(AppHttpResponseMessage.EXPENSE_CHANGE_ASSIGNEE_SUCCESSFULLY);
          this.loading = false;

          this.refreshGridAfterChangedAssignee.emit();
          this.formGroup.reset();

        } else {
          this.loading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.loading = false;
        this.notificationService.errorMessage(error);
      });

    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.formGroup);
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
