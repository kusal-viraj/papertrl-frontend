import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {AppAuthorities} from "../../../shared/enums/app-authorities";

@Component({
  selector: 'app-final-approver',
  templateUrl: './final-approver.component.html',
  styleUrls: ['./final-approver.component.scss']
})
export class FinalApproverComponent implements OnInit {

  @Output()
  public addNew: EventEmitter<any> = new EventEmitter();
  @Input()
  public actionIndex: number;
  @Input()
  public isEdit: boolean;
  @Input()
  public isDetailView: boolean;
  @Input()
  public dropDownSelectionId: any;

  @Input()
  public automationForm: UntypedFormGroup;
  public userList: DropdownDto = new DropdownDto();
  public approvalGroups: DropdownDto = new DropdownDto();
  public approvalGroupPanel: boolean;
  public userPanel: boolean;

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService,
              public notificationService: NotificationService, public privilegeService: PrivilegeService,
              public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.getUserList();
    this.getApprovalGroupList();
    if (this.dropDownSelectionId) {
      this.automationAction.controls[this.actionIndex].get('finalApprover').get('fieldValue').patchValue(this.dropDownSelectionId);
    }
  }

  /**
   * Get user list
   */
  getUserList() {
    this.automationService.getApprovalUserList(!this.isEdit).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.userList.data = res.body;
        if (this.privilegeService.isAuthorized(AppAuthorities.USERS_CREATE)) {
          this.userList.addNew();
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This service use for get approval group list
   */
  getApprovalGroupList() {
    this.billsService.getApprovalGroupList(!this.isEdit).subscribe((res: any) => {
      this.approvalGroups.data = res.body;
      if (this.privilegeService.isAuthorized(AppAuthorities.APPROVAL_GROUPS_CREATE)) {
        this.approvalGroups.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  changedUserSelection(e) {
    if (e.value === 0) {
      this.approvalGroupPanel = false;
      this.userPanel = true;
      setTimeout(() => {
        this.finalApprovalWorkflowLevel.get('approvalUser').reset();
      }, 100);
    } else {
      this.finalApprovalWorkflowLevel.get('approvalGroup').reset();
    }
  }

  changedApprovalGroupSelection(e) {
    if (e.value === 0) {
      this.approvalGroupPanel = true;
      this.userPanel = false;
      setTimeout(() => {
        this.finalApprovalWorkflowLevel.get('approvalGroup').reset();
      }, 100);
    } else {
      this.finalApprovalWorkflowLevel.get('approvalUser').reset();
    }
  }

  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get finalApprovalWorkflowLevel() {
    return this.automationAction.controls[this.actionIndex].get('finalApprovalWorkflowLevel') as UntypedFormGroup;
  }

  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get automationAction() {
    return this.automationForm.get('automationActions') as UntypedFormArray;
  }

}
