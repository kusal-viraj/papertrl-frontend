import {Component, Input, OnInit, Output, EventEmitter, HostListener} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {UserApprovalGroupService} from '../../../shared/services/approvalGroup/user-approval-group.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {ApprovalGroupMasterDto} from '../../../shared/dto/approval group/approval-group-master-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';


@Component({
  selector: 'app-approval-group-create',
  templateUrl: './approval-group-create.component.html',
  styleUrls: ['./approval-group-create.component.scss']
})
export class ApprovalGroupCreateComponent implements OnInit {

  public approvalGroupEditForm: UntypedFormGroup;

  public existingApprovalGroup: ApprovalGroupMasterDto;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public approvalGroupMasterDto: ApprovalGroupMasterDto = new ApprovalGroupMasterDto();
  public loading = false;
  public approvalGroupName: any;


  @Input() isEditForm: boolean;
  @Input() panel: boolean;
  @Input() id: any;
  @Output() refreshTable = new EventEmitter();
  isNameAvailable = true;


  constructor(public formBuilder: UntypedFormBuilder, public approvalGroupService: UserApprovalGroupService,
              public notificationService: NotificationService, public messageService: MessageService) {
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.getApprovalGroup();
  }

  /**
   * this method can be used to initialize form group
   */
  initFormGroup(){
    this.approvalGroupEditForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(75)])],
    });
  }

  /**
   * This method use for update approval group
   */
  onSubmit(form) {
    this.loading = true;
    if (this.approvalGroupEditForm.valid) {
      this.approvalGroupMasterDto = Object.assign(this.approvalGroupMasterDto, form);
      if (this.isEditForm) {
        this.updateApprovalGroup(this.approvalGroupMasterDto);
      } else {
        this.createApprovalGroup(this.approvalGroupMasterDto);
      }
    } else {
      this.loading = false;
      const createItemFormController = this.approvalGroupEditForm.controls;
      for (const singleControlInstance in createItemFormController) {
        if (createItemFormController[singleControlInstance].invalid) {
          createItemFormController[singleControlInstance].markAsDirty();
        }
      }
    }
  }

  /**
   * This method use for get approval group form service
   */
  getApprovalGroup() {
    if (this.isEditForm) {
      this.approvalGroupService.viewApprovalLevel(this.id).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.existingApprovalGroup = res.body;
          this.approvalGroupEditForm.patchValue(res.body);
          this.approvalGroupName = String(res.body.name).trim();
          this.isNameAvailable = true;
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method use for reset approval group form
   */
  resetForm() {
    if (this.isEditForm) {
      this.getApprovalGroup();
    } else {
      this.isNameAvailable = true;
      this.approvalGroupEditForm.reset();
    }
  }

  /**
   * this method can be used to check approval group name availability
   * @param value to form value
   */
  checkAvailability(value) {
    this.approvalGroupMasterDto = Object.assign(this.approvalGroupMasterDto, value);
    if (this.isEditForm && (String(this.approvalGroupName) === String(this.approvalGroupMasterDto.name).trim())) {
      return;
    }
    if (this.approvalGroupMasterDto.name !== AppConstant.EMPTY_SPACE) {
      this.approvalGroupService.checkApprovalLevelAvailability(this.approvalGroupMasterDto).subscribe((res: any) => {
          this.isNameAvailable = res;
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * Create Approval Group
   * @param approvalGroupDto to approvalGroupForm instance
   */
  createApprovalGroup(approvalGroupDto) {
    if (this.approvalGroupEditForm.valid) {
      this.approvalGroupService.createApprovalGroup(approvalGroupDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.APPROVAL_GROUP_CREATED_SUCCESSFULLY);
          this.approvalGroupEditForm.reset();
          this.loading = false;
          this.refreshTable.emit('APPROVAL_GROUP_UPDATED');
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
      new CommonUtility().validateForm(this.approvalGroupEditForm);
    }
  }

  /**
   * Update Approval Group
   * @param approvalGroupDto to approvalGroupForm instance
   */
  updateApprovalGroup(approvalGroupDto) {
    approvalGroupDto.id = this.id;
    if (this.approvalGroupEditForm.valid && this.isNameAvailable) {
      this.approvalGroupService.updateApprovalGroup(approvalGroupDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.loading = false;
          this.notificationService.successMessage(HttpResponseMessage.APPROVAL_GROUPS_UPDATED_SUCCESSFULLY);
          this.refreshTable.emit('APPROVAL_GROUP_UPDATED');
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
      new CommonUtility().validateForm(this.approvalGroupEditForm);
    }
  }
}
