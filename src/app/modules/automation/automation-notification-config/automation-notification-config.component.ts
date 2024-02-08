import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';


@Component({
  selector: 'app-automation-notification-config',
  templateUrl: './automation-notification-config.component.html',
  styleUrls: ['./automation-notification-config.component.scss']
})
export class AutomationNotificationConfigComponent implements OnInit, OnDestroy {

  public userNotificationForm: UntypedFormGroup;

  @Output()
  public addNew: EventEmitter<any> = new EventEmitter();
  @Input()
  public actionIndex: number;
  @Input()
  public automationForm: UntypedFormGroup;
  @Input()
  public isDetailView: boolean;
  @Input()
  public isEditView: boolean;

  public userPanel: boolean;

  public approvalUsers: DropdownDto = new DropdownDto();

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService,
              public notificationService: NotificationService) {

  }


  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get notification() {
    return this.automationAction.controls[this.actionIndex].get('notificationConfig') as UntypedFormGroup;
  }

  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get automationAction() {
    return this.automationForm.get('automationActions') as UntypedFormArray;
  }

  /**
   * This method use for call add new action dropdown in automation creation screen
   */
  addActionDropDown() {
    this.addNew.emit();
  }

  /**
   * This service use for get user list
   */
  getApprovalUserList() {
    return new Promise<void>(resolve => {
      this.automationService.getApprovalUserList(!this.isEditView).subscribe((res: any) => {
        this.approvalUsers.data = res.body;
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    })
  }

  /**
   * This method use for add new form controller group for email notification
   */
  addUserController(validatable: boolean) {
    if (!this.automationAction.controls[this.actionIndex]) {
      return;
    }
    const notifiedUsers = this.notification.get('notifiedUsers');
    const notificationContent = this.notification.get('notificationContent');
    if (validatable) {
      notifiedUsers.setValidators(Validators.required);
      notificationContent.setValidators(Validators.required);
    } else {
      notifiedUsers.clearValidators();
      notificationContent.clearValidators();
    }
    notifiedUsers.updateValueAndValidity();
    notificationContent.updateValueAndValidity();
  }

  /**
   * This method use for open user creation modal
   * @param event
   * @param userNotificationForm FormGroup
   */
  changedUserSelection(event: any, userNotificationForm: UntypedFormGroup) {
    try {
      if (event.itemValue.id === '0') {
        this.userPanel = true;
        setTimeout(() => {
          userNotificationForm.get('users').reset();
        }, 100);
      }
    } catch (error) {
    }
  }

  ngOnInit(): void {
    this.init();
  }

  async init() {
    await this.getApprovalUserList();
    this.addUserController(true);
  }

  ngOnDestroy(): void {
    this.addUserController(false);
  }
}
