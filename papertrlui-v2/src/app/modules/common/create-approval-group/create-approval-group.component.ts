import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {ApprovalGroupMasterDto} from '../../../shared/dto/approval group/approval-group-master-dto';
import {UserApprovalGroupService} from '../../../shared/services/approvalGroup/user-approval-group.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {UserService} from '../../../shared/services/user/user.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DepartmentService} from '../../../shared/services/department/department.service';
import {UserUtility} from '../../admin/user-utility/user-utility';
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-create-approval-group',
  templateUrl: './create-approval-group.component.html',
  styleUrls: ['./create-approval-group.component.scss']
})
export class CreateApprovalGroupComponent implements OnInit {
  public approvalGroupForm: UntypedFormGroup;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public approvalGroupMasterDto: ApprovalGroupMasterDto = new ApprovalGroupMasterDto();
  public userUtility = new UserUtility(this.messageService, this.userService, this.privilegeService,
    this.notificationService, this.departmentService, this.billsService);
  isNameAvailable = true;
  approvalGroupName: string;

  constructor(public formBuilder: UntypedFormBuilder, public approvalGroupService: UserApprovalGroupService, public billsService: BillsService,
              public messageService: MessageService, public userService: UserService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public departmentService: DepartmentService) {
    this.userUtility.getApprovalGroupsWithNoApproval(this.userUtility.approvalGroups, false, true);

  }

  @Input() panel;
  @Input() approvalGroup: any;
  @Output() updatedApprovalGroups = new EventEmitter();

  ngOnInit(): void {
    this.approvalGroupForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(75)])],
    });
  }

  /**
   * Create Approval Group
   * @param approvalGroupForm to approvalGroupForm instance
   */
  /**
   * Create Approval Group
   * @param approvalGroupDto to approvalGroupForm instance
   */
  createApprovalGroup(approvalGroupDto) {
    if (this.approvalGroupForm.valid && this.isNameAvailable) {
      this.approvalGroupService.createApprovalGroup(approvalGroupDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.approvalGroupName = approvalGroupDto.name;
          this.notificationService.successMessage(HttpResponseMessage.APPROVAL_GROUP_CREATED_SUCCESSFULLY);
          this.getUpdatedApprovalGroups();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      new CommonUtility().validateForm(this.approvalGroupForm);
    }
  }

  /**
   * Reset approval group form
   */
  formReset() {
    this.approvalGroupForm.reset();
    this.isNameAvailable = true;
  }

  /**
   * this method can be used to check approval group name availability
   * @param value to form value
   */
  checkAvailability(value) {
    this.approvalGroupMasterDto = Object.assign(this.approvalGroupMasterDto, value);
    this.approvalGroupService.checkApprovalLevelAvailability(this.approvalGroupMasterDto).subscribe((res: any) => {
        this.isNameAvailable = res;
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * get updated uom list
   */
  getUpdatedApprovalGroups() {
    this.userUtility.getApprovalGroupsWithNoApproval(this.userUtility.approvalGroups, false, true);
    this.updatedApprovalGroups.emit(this.userUtility.approvalGroups);
    this.formReset();
  }
}
