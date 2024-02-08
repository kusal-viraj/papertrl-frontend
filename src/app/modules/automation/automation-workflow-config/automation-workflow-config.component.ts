import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {CommonAutomationMstDto} from '../../../shared/dto/automation/common-automation-mst-dto';
import {CommonAutomationWorkflowConfigDto} from '../../../shared/dto/automation/common-automation-workflow-config-dto';
import {BillsService} from '../../../shared/services/bills/bills.service';


@Component({
  selector: 'app-automation-workflow-config',
  templateUrl: './automation-workflow-config.component.html',
  styleUrls: ['./automation-workflow-config.component.scss']
})
export class AutomationWorkflowConfigComponent implements OnInit {


  @Output()
  public addNew: EventEmitter<any> = new EventEmitter();
  @Input()
  public actionIndex: number;
  @Input()
  public automationForm: UntypedFormGroup;
  @Input()
  public automationMstDto: CommonAutomationMstDto;
  @Input()
  public isEdit: boolean;
  @Input()
  public isDetailView: boolean;
  @Input()
  public isRemovedLevel: boolean;
  @Input()
  public isDocumentTypeChange: boolean;


  public approvalGroupPanel: boolean;
  public userPanel: boolean;

  public approvalGroups: DropdownDto = new DropdownDto();
  public approvalUsers: DropdownDto = new DropdownDto();


  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService,
              public notificationService: NotificationService, public billsService: BillsService) {
  }


  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get automationActionConfig() {
    return this.automationForm.get('automationActions') as UntypedFormArray;
  }

  /**
   *
   * @param actionIndex number
   */
  public getAutomationWorkflowConfig(actionIndex: number) {
    return this.automationActionConfig.controls[actionIndex].get('workflowConfigs') as UntypedFormArray;
  }

  /**
   * This method use for add workflow level
   */
  addWorkflowConfigFormController() {
    const automationWorkflowConfig = this.formBuilder.group({
      approvalOrder: [null],
      approvalGroup: [null],
      approvalUser: [null]
    });
    this.getAutomationWorkflowConfig(this.actionIndex).push(automationWorkflowConfig);

    const conditionOrder = this.getAutomationWorkflowConfig(this.actionIndex).length;
    this.getAutomationWorkflowConfig(this.actionIndex).controls[conditionOrder - 1].get('approvalOrder').patchValue(conditionOrder);
  }

  /**
   * This method use for reset automation approval sequence form array
   */
  resetWorkflowConfig() {
    while (this.getAutomationWorkflowConfig(this.actionIndex).length !== 0) {
      this.getAutomationWorkflowConfig(this.actionIndex).removeAt(0);
    }
  }

  /**
   * This method use for remove approval sequence row
   * @param approvalSequenceIndex number
   */
  removeApprovalSequence(approvalSequenceIndex: number) {
    this.getAutomationWorkflowConfig(this.actionIndex).removeAt(approvalSequenceIndex);
  }


  /**
   * This service use for get approval group list
   */
  getApprovalGroupList() {
    this.billsService.getApprovalGroupList(!this.isEdit).subscribe((res: any) => {
      this.approvalGroups.data = res.body;
      this.approvalGroups.addNew();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This service use for get user list
   */
  getApprovalUserList() {
    this.automationService.getApprovalUserList(!this.isEdit).subscribe((res: any) => {
      this.approvalUsers.data = res.body;
      this.approvalUsers.addNew();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  changedUserSelection(e, approvalSequenceIndex) {
    try {
      if (e.value === 0) {
        this.approvalGroupPanel = false;
        this.userPanel = true;
        setTimeout(() => {
          approvalSequenceIndex.get('approvalUser').reset();
        }, 100);
      }
    } catch (error) {
    }
  }

  changedApprovalGroupSelection(e, control: AbstractControl) {
    if (e.value === 0) {
      this.approvalGroupPanel = true;
      this.userPanel = false;
      setTimeout(() => {
        control.get('approvalGroup').reset();
      }, 100);
    }
  }

  /**
   * This method use for add new action dropdown
   */
  addActionDropDown() {
    this.addNew.emit();
  }

  /**
   * This method use for add new automation
   */
  addExistAutomationConfigurations() {
    if (!this.isRemovedLevel && !this.isDocumentTypeChange) {
      const workflowConfigs: CommonAutomationWorkflowConfigDto[] = this.automationMstDto.automationActions[this.actionIndex]?.workflowConfigs;
      if (workflowConfigs && workflowConfigs.length !== 0) {
        this.resetWorkflowConfig();
        workflowConfigs?.forEach((value, index) => {
          this.addWorkflowConfigFormController();
        });
        return;
      }
    }else if(this.isRemovedLevel){
      this.resetWorkflowConfig();
      this.addWorkflowConfigFormController();
      return;
    }else if(this.isDocumentTypeChange){
      this.resetWorkflowConfig();
      return;
    }
    if (!this.automationMstDto.automationActions[this.actionIndex] || this.isEdit) {
      this.addWorkflowConfigFormController();
      return;
    }


  }


  ngOnInit(): void {
    this.getApprovalGroupList();
    this.getApprovalUserList();

    if (this.isEdit || this.isDetailView) {
      this.addExistAutomationConfigurations();
    }
    if (this.getAutomationWorkflowConfig(this.actionIndex).length === 0) {
      this.addWorkflowConfigFormController();
    }
  }
  
}
