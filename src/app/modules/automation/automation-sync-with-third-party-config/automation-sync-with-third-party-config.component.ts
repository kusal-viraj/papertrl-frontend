import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';

@Component({
  selector: 'app-automation-sync-with-third-party-config',
  templateUrl: './automation-sync-with-third-party-config.component.html',
  styleUrls: ['./automation-sync-with-third-party-config.component.scss']
})
export class AutomationSyncWithThirdPartyConfigComponent implements OnInit, OnDestroy {

  @Output()
  public addNew: EventEmitter<any> = new EventEmitter();
  @Input()
  public actionIndex: number;
  @Input()
  public workflowForm: UntypedFormGroup;
  @Input()
  public isDetailView: boolean;

  public systemList: DropdownDto = new DropdownDto();

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService,
              public notificationService: NotificationService) {
  }


  /**
   * This method can use for get syncApplication FormArray from controllers
   */
  public get systemSyncConfig() {
    return this.workflowAction.controls[this.actionIndex].get('systemSyncConfig') as UntypedFormGroup;
  }

  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get workflowAction() {
    return this.workflowForm.get('automationActions') as UntypedFormArray;
  }

  /**
   * This method use for call add new action dropdown in automation creation screen
   */
  addActionDropDown() {
    this.addNew.emit();
  }

  /**
   * This method use for get application list
   */
  getApplicationList() {
    this.automationService.getIntegrationSystemList().subscribe((res: any) => {
      this.systemList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for add new form controller group for systemId
   */
  addSystemIdController(validatable: boolean) {
    const systemId = this.systemSyncConfig.get('systemId');
    if (validatable) {
      systemId.setValidators(Validators.required);
    } else {
      systemId.clearValidators();
    }
    systemId.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.addSystemIdController(false);
  }

  ngOnInit(): void {
    this.getApplicationList();
    this.addSystemIdController(true);
  }

}
