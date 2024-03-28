import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppMessageService} from '../../../shared/enums/app-message-service';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {PoService} from '../../../shared/services/po/po.service';
import {MessageService} from 'primeng/api';
import {PoMasterDto} from '../../../shared/dto/po/po-master-dto';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAutomationEvent} from '../../../shared/enums/app-automation-event';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';

@Component({
  selector: 'app-change-assignee',
  templateUrl: './change-assignee.component.html',
  styleUrls: ['./change-assignee.component.scss']
})
export class ChangeAssigneeComponent implements OnInit {

  @Input() heading: any;
  @Input() poId: number;
  @Input() creator: string;
  @Input() vendorId: any;
  @Input() isFromTenantPO = false;

  @Output()
  public refreshGridAfterChangedAssignee: EventEmitter<any> = new EventEmitter();

  public changeAssigneeForm: UntypedFormGroup;

  public approvalUsers: DropdownDto = new DropdownDto();
  public approvalGroup: DropdownDto = new DropdownDto();

  public poMasterDto: PoMasterDto;

  public isProcessingAction = false;


  constructor(public formBuilder: UntypedFormBuilder, public poService: PoService, public messageService: MessageService,
              public notificationService: NotificationService, public billsService: BillsService) {
  }

  ngOnInit(): void {

    this.changeAssigneeForm = this.formBuilder.group({
      approvalUser: [null, Validators.required],
      approvalGroup: [null, Validators.required],
      remark: [null, Validators.required]
    });


    this.getPoDetail(this.poId);
  }

  /**
   * This method use for get change assignee form controls
   */
  get changeAssignee() {
    return this.changeAssigneeForm.controls;
  }

  /**
   * Get Po Details for Specific Po
   * @param id number
   */
  getPoDetail(id: number) {
    if (id) {
      this.poService.getPoData(id, false).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.poMasterDto = res.body;

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
    const authorities = [AppAuthorities.PURCHASE_ORDER_APPROVE, AppAuthorities.PURCHASE_ORDER_REJECT,
      AppAuthorities.PURCHASE_ORDER_OVERRIDE_APPROVAL];
    if (!this.isFromTenantPO) {
      this.billsService.getApprovalUserList(null, authorities, true)
        .subscribe((res: any) => {
          listInstance.data = res.body;
        }, error => {
          this.notificationService.errorMessage(error);
        });
    } else {
      if (this.vendorId) {
        this.billsService.getApprovalUserListAccordingToVendorSelection(null, authorities, this.vendorId, true)
          .subscribe((res: any) => {
            listInstance.data = res.body;
          }, error => {
            this.notificationService.errorMessage(error);
          });
      }
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
  changePoAssignee() {
    if (this.changeAssigneeForm.valid) {
      this.isProcessingAction = true;
      const poMasterDto = new PoMasterDto();
      poMasterDto.id = this.poId;
      poMasterDto.documentTypeId = AppDocumentType.PURCHASE_ORDER;
      poMasterDto.eventId = AppAutomationEvent.CHANGE_ASSIGNEE;
      poMasterDto.approvalUser = this.changeAssignee.approvalUser.value;
      poMasterDto.approvalGroup = this.changeAssignee.approvalGroup.value;
      poMasterDto.remarks = this.changeAssignee.remark.value;

      this.poService.changeAssignee(poMasterDto).subscribe((res: any) => {

        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(AppHttpResponseMessage.PO_CHANGE_ASSIGNEE_SUCCESSFULLY);
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
