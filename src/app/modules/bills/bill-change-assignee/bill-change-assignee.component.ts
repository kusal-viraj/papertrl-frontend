import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BillSubmitService} from '../../../shared/services/bills/bill-submit.service';
import {BillMasterDto} from '../../../shared/dto/bill/bill-master-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAutomationEvent} from '../../../shared/enums/app-automation-event';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';

@Component({
  selector: 'app-bill-change-assignee',
  templateUrl: './bill-change-assignee.component.html',
  styleUrls: ['./bill-change-assignee.component.scss']
})
export class BillChangeAssigneeComponent implements OnInit {

  @Input() heading: any;
  @Input() billId: any;
  @Input() creator: string;
  @Output()
  public refreshGridAfterChangedAssignee: EventEmitter<any> = new EventEmitter();
  @Input() vendorId: any;

  public approvalUsers: DropdownDto = new DropdownDto();
  public approvalGroup: DropdownDto = new DropdownDto();
  public changeAssigneeForm: UntypedFormGroup;
  public billMasterDto: BillMasterDto = new BillMasterDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();

  public isProcessingAction = false;


  constructor(public notificationService: NotificationService, public billsService: BillsService,
              public billSubmitService: BillSubmitService, public formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    this.changeAssigneeForm = this.formBuilder.group({
      approvalUser: [null, Validators.required],
      approvalGroup: [null, Validators.required],
      remark: [null, Validators.required]
    });
    this.getBillDetail(this.billId);
  }

  /**
   * This method use for get change assignee form controls
   */
  get changeAssignee() {
    return this.changeAssigneeForm.controls;
  }


  /**
   * This method use for get all approvers to next level
   * @param listInstance DropdownDto
   */
  getApprovalUsers(listInstance: DropdownDto) {
    if (!this.vendorId) {
      return;
    } else {
      const authorities = [AppAuthorities.BILL_APPROVE, AppAuthorities.BILL_REJECT,
        AppAuthorities.BILL_OVERRIDE_APPROVAL];
      this.billsService.getApprovalUserListAccordingToVendorSelection(this.billMasterDto.approvalUser, authorities, this.vendorId, true)
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
   * Get Po Details for Specific Po
   * @param id number
   */
  getBillDetail(id: number) {
    if (id) {
      this.billSubmitService.getBillDetail(id, false).then((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.billMasterDto = res.body;

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


  /**
   * this method can be used to change bill assignee
   */
  changeBillAssignee() {
    if (this.changeAssigneeForm.valid) {
      this.isProcessingAction = true;
      const billMasterDto = new BillMasterDto();
      billMasterDto.id = this.billId;
      billMasterDto.documentTypeId = AppDocumentType.BILL;
      billMasterDto.eventId = AppAutomationEvent.CHANGE_ASSIGNEE;
      billMasterDto.approvalUser = this.changeAssignee.approvalUser.value;
      billMasterDto.approvalGroup = this.changeAssignee.approvalGroup.value;
      billMasterDto.remark = this.changeAssignee.remark.value;
      this.billSubmitService.changeAssignee(billMasterDto).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(HttpResponseMessage.BILL_CHANGE_ASSIGNEE_SUCCESSFULLY);
          this.isProcessingAction = false;
          this.refreshGridAfterChangedAssignee.emit();
          this.changeAssigneeForm.reset();

        } else {
          this.isProcessingAction = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isProcessingAction = false;
        this.notificationService.errorMessage(error);
      });

    } else {
      this.isProcessingAction = false;
      new CommonUtility().validateForm(this.changeAssigneeForm);
    }

  }
}
