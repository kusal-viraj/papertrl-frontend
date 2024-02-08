import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {AppIcons} from '../../../shared/enums/app-icons';
import {PoApproveService} from '../../../shared/services/po/po-approve.service';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {PoService} from '../../../shared/services/po/po.service';
import {AuditTrialDto} from '../../../shared/dto/common/audit-trial/audit-trial-dto';
import {MessageService} from 'primeng/api';
import {PoUtility} from '../po-utility';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppConstant} from '../../../shared/utility/app-constant';
import {RoleService} from '../../../shared/services/roles/role.service';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {ManageDrawerService} from '../../../shared/services/common/manage-drawer-status/manage-drawer.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {CommonUtility} from "../../../shared/utility/common-utility";

@Component({
  selector: 'app-po-approval-buttons',
  templateUrl: './po-approval-buttons.component.html',
  styleUrls: ['./po-approval-buttons.component.scss']
})
export class PoApprovalButtonsComponent implements OnInit {


  public isApproveAndFinalize: boolean;
  public isApprove: boolean;
  public isApproveAndReassign: boolean;
  public isAssigneeCanSelect: boolean;
  public isCommentNotAvailable: boolean;
  public isInsertApprover: boolean;

  public isReachMaxLength: boolean;

  public appIcons = AppIcons;
  public poSubmitForm: UntypedFormGroup;

  @Input() poId;
  @Input() poNumber;
  @Input() fromNotification = false;
  @Input() isSplitterSmall;
  @Input() extraSmallHorSplitter;
  @Input() isDetailView;

  @Input() matchingAutomation;
  @Input() isWorkflowConfigAvailable;
  @Input() isSaveAsApprovedWorkFlow;

  @Input() poMasterDto: PoMasterDto;

  @Output() closeAuditTrail = new EventEmitter<boolean>();
  @Output() closePOApprove = new EventEmitter<boolean>();
  @Output() resetApproval = new EventEmitter<number>();

  public approvalLists: any;
  public auditTrialPanel: boolean;
  public auditTrialDto: AuditTrialDto[];
  public appAuthorities = AppAuthorities;
  public removeSpaces: RemoveSpace = new RemoveSpace();

  public poUtility: PoUtility = new PoUtility(this.poService, this.roleService, this.messageService,
    this.privilegeService, this.notificationService, this.drawerService, this.billsService);
  public btnLoading = false;
  public rejectBtn = false;
  public finalizeBtn = false;
  public reassignBtn = false;
  isAddNewUser = false;
  public approvers: DropdownDto = new DropdownDto();
  public isInsertApproverChecked = false;
  public commonUtil = new CommonUtility();


  constructor(public formBuilder: UntypedFormBuilder, public poApproveService: PoApproveService, public poService: PoService,
              public roleService: RoleService, public messageService: MessageService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public drawerService: ManageDrawerService, public billsService: BillsService) {

    this.poSubmitForm = this.formBuilder.group({
      approvalUser: [null],
      comment: [null],
      attachment: [null]
    });
  }

  get submitForm() {
    return this.poSubmitForm.controls;
  }

  ngOnInit(): void {
    this.getExtendedApprovalUserList(this.approvers);
    // this.getPoAttachmentList(this.poUtility.attachments);
    this.validateButtons();
  }

  viewAuditTrial() {
    this.poService.getAuditTrial(this.poId).subscribe((res: any) => {
      this.auditTrialDto = res.body;
      this.auditTrialPanel = true;
    });
  }

  /**
   * This method use for  download attachment
   */
  downloadAttachment(val: any) {
    this.poService.downloadPoAttachment(val.attachmentId).subscribe((res: any) => {
      console.log('start download:', res);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', val.poNumber);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to check value and return boolean value
   */
  checkCommentAvailable() {
    const comment = this.submitForm.comment;
    if (comment.value === null || comment.value === undefined) {
      this.isCommentNotAvailable = true;
    } else {
      this.isCommentNotAvailable = comment.value.length === 0;
    }
  }

  /**
   * This method can be used to check maximum length of comments and notes fields
   * @param length to field length
   */

  checkMaxLength(length) {
    if (length > AppConstant.REMARKS_MAXLENGTH) {
      this.isReachMaxLength = true;
    } else {
      this.isReachMaxLength = false;
    }
  }

  /**
   * This method can be used to if no value in remarks field validation message hide
   * @param comment to remarks length
   */

  clearCommentValidation(comment) {
    if (comment.value !== null || true) {
      this.isCommentNotAvailable = false;
    } else {
      this.isCommentNotAvailable = true;
    }
  }

  /**
   * This method use for get all assignee list
   * @param listInstance DropdownDto
   */
  getExtendedApprovalUserList(listInstance: DropdownDto) {
    if (!this.poMasterDto.vendorId) {
      return;
    } else {
      const authorities = [AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT,
        AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL];
      this.billsService.getApprovalUserListAccordingToVendorSelection(this.poMasterDto.approvalUser, authorities, this.poMasterDto.vendorId, true)
        .subscribe((res: any) => {
          listInstance.data = res.body;
          listInstance.addNew();
        }, error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * This method validate approval buttons
   */
  validateButtons() {

    this.isApproveAndFinalize = false;
    this.isApproveAndReassign = false;
    this.isAssigneeCanSelect = false;
    this.isInsertApprover = false;
    this.isApprove = false;
    this.isApprove = false;

    if (this.poMasterDto.noOfLevels === this.poMasterDto.workflowLevel) {
      this.isApproveAndFinalize = true;
      this.isApproveAndReassign = false;
      this.isAssigneeCanSelect = true;
    } else {
      this.isApproveAndFinalize = false;
      this.isApproveAndReassign = false;
      this.isApprove = true;
    }
  }

  /**
   * This method use for change  approve button label when assignee change
   * @param id to bill id
   */
  onChangeAssignee(id) {
    if (this.submitForm.approvalUser.value && !this.isInsertApproverChecked) {
      this.isApproveAndReassign = true;
      this.isApprove = false;
      this.isAddNewUser = false;
      this.isApproveAndFinalize = false;
    } else if (this.poMasterDto.noOfLevels === this.poMasterDto.workflowLevel &&
      !(this.submitForm.approvalUser.value && this.isInsertApproverChecked)) {
      this.isApproveAndReassign = false;
      this.isApprove = false;
      this.isAddNewUser = false;
      this.isApproveAndFinalize = true;
    }

    if (id === 0) {
      this.poSubmitForm.get('approvalUser').reset();
      this.isAddNewUser = true;
    }
  }

  /**
   * This method use for approve and re assign po
   */
  approveAndReassign(isInsertApprover: boolean) {
    if (this.poSubmitForm.invalid){
      this.btnLoading = false;
      return new CommonUtility().validateForm(this.poSubmitForm);
    } else {
      this.submitButtonsDisableOnOff('reassign', true);
      this.formatMultisetValue(this.poMasterDto);
      this.poMasterDto.remarks = this.submitForm.comment.value;
      this.poMasterDto.approvalUser = this.submitForm.approvalUser.value;
      this.poMasterDto.additionalData = [];
      this.poMasterDto.expenseAccountIdList = this.poMasterDto.purchaseOrderAccountDetails?.map(r => r.accountId)?.filter(x => x);
      this.poMasterDto.itemIdList = this.poMasterDto.purchaseOrderDetails?.map(r => r.productId)?.filter(x => x);
      this.poService.approveAndReassign(this.poMasterDto, isInsertApprover).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.poSubmitForm.reset();
          isInsertApprover ? this.notificationService.successMessage(AppHttpResponseMessage.PO_INSERT_THE_APPROVER_SUCCESSFULLY) :
            this.notificationService.successMessage(AppHttpResponseMessage.PO_APPROVED_SUCCESSFULLY);
          if (this.fromNotification) {
            this.closePOApprove.emit();
          } else {
            this.resetApproval.emit(this.poId);
          }

        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.submitButtonsDisableOnOff('reassign', false);
      }, error => {
        this.submitButtonsDisableOnOff('reassign', false);
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method use for approve and finalize po
   */
  approveAndFinalize() {
    if (this.poSubmitForm.invalid) {
      this.btnLoading = false;
      return new CommonUtility().validateForm(this.poSubmitForm);
    } else {
      this.submitButtonsDisableOnOff('finalize', true);
      this.formatMultisetValue(this.poMasterDto);
      this.poMasterDto.remarks = this.submitForm.comment.value;
      this.poMasterDto.additionalData = [];
      this.poMasterDto.expenseAccountIdList = this.poMasterDto.purchaseOrderAccountDetails?.map(r => r.accountId)?.filter(x => x);
      this.poMasterDto.itemIdList = this.poMasterDto.purchaseOrderDetails?.map(r => r.productId)?.filter(x => x);
      this.poService.approveAndFinalize(this.poMasterDto).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.poSubmitForm.reset();
          this.notificationService.successMessage(AppHttpResponseMessage.PO_APPROVED_SUCCESSFULLY);
          if (this.fromNotification) {
            this.closePOApprove.emit();
          } else {
            this.resetApproval.emit(this.poId);
          }

        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.submitButtonsDisableOnOff('finalize', false);

      }, error => {
        this.submitButtonsDisableOnOff('finalize', false);
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method use for reject po
   */
  rejectPO() {
    this.submitButtonsDisableOnOff('reject', true);
    this.formatMultisetValue(this.poMasterDto);
    this.poMasterDto.additionalData = [];
    if (this.isCommentNotAvailable === false) {
      this.poMasterDto.remarks = this.submitForm.comment.value;
      this.poMasterDto.expenseAccountIdList = this.poMasterDto.purchaseOrderAccountDetails?.map(r => r.accountId)?.filter(x => x);
      this.poMasterDto.itemIdList = this.poMasterDto.purchaseOrderDetails?.map(r => r.productId)?.filter(x => x);
      this.poService.rejectPurchaseOrder(this.poMasterDto).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(AppHttpResponseMessage.PO_REJECT_SUCCESSFULLY);
          this.poSubmitForm.reset();
          if (this.fromNotification) {
            this.closePOApprove.emit();
          } else {
            this.resetApproval.emit(this.poId);
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.submitButtonsDisableOnOff('reject', false);
      }, error => {
        this.submitButtonsDisableOnOff('reject', false);
        this.notificationService.errorMessage(error);
      });
    } else {
      this.submitButtonsDisableOnOff('reject', false);
    }
  }

  /**
   * this method disables buttons and show loader on submit
   * @param name
   * @param bool
   */
  submitButtonsDisableOnOff(name, bool) {
    switch (name) {
      case 'reassign': {
        this.reassignBtn = bool;
        this.btnLoading = bool;
        break;
      }
      case 'finalize': {
        this.finalizeBtn = bool;
        this.btnLoading = bool;
        break;
      }
      case 'reject': {
        this.rejectBtn = bool;
        this.btnLoading = bool;
        break;
      }
    }
  }

  /**
   *this method can be used to format data as string
   */
  formatMultisetValue(poRequestDto: PoMasterDto) {
    poRequestDto.additionalData.forEach(value => {
      if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple ===
        AppConstant.STATUS_ACTIVE && value.fieldValue !== null) {
        value.fieldValue = value.fieldValue.toString();
      }
    });
    poRequestDto.purchaseOrderDetails.forEach(poDetails => {
      poDetails.additionalData.forEach(additionalData => {
        if (additionalData.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && additionalData.multiple ===
          AppConstant.STATUS_ACTIVE && additionalData.fieldValue !== null) {
          additionalData.fieldValue = additionalData.fieldValue.toString();
        }
      });
    });
    poRequestDto.purchaseOrderAccountDetails.forEach(poAccountDetails => {
      poAccountDetails.additionalData.forEach(additionalData => {
        if (additionalData.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && additionalData.multiple ===
          AppConstant.STATUS_ACTIVE && additionalData.fieldValue !== null) {
          additionalData.fieldValue = additionalData.fieldValue.toString();
        }
      });
    });
  }

  /**
   * Is User Authorized to approve
   */
  isValidApproveAccess(approveOrReject) {
    if (this.privilegeService.isAuthorized(AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL)) {
      return true;
    }

    return this.privilegeService.isAuthorized(approveOrReject);
  }

  /**
   * This method use for set isInsertApproverChecked to check box status and reset select approver dropdown in approve screen
   * @param event this parameter get checkbox status
   */
  isInsertApproverPO(event) {
    this.isInsertApproverChecked = event.checked;

    if (!(this.isAssigneeCanSelect && !this.isDetailView && !this.matchingAutomation) && !this.isInsertApproverChecked) {
      this.poSubmitForm.get('approvalUser').reset();
    }

    this.commonUtil.setApprovalUserValidation(this.poSubmitForm, this.isInsertApproverChecked);

    this.onChangeAssignee(1);
  }

}
