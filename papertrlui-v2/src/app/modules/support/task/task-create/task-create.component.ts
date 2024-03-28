import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {TaskUtility} from '../task-utility/task-utility';
import {TaskSettingsService} from '../../../../shared/services/support/task-settings-service';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {CommonUtility} from '../../../../shared/utility/common-utility';
import {TaskSettingsDto} from '../../../../shared/dto/support/task-setting-dto';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {NotificationService} from '../../../../shared/services/notification/notification.service';

@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskCreateComponent implements OnInit {
  createTaskForm: UntypedFormGroup;
  public taskMstDto = new TaskSettingsDto();
  public taskSettingsUtil: TaskUtility = new TaskUtility(this.taskSettingService, true, this.notificationService);
  @Output() refreshTable = new EventEmitter();

  constructor(public taskSettingService: TaskSettingsService, public formBuilder: UntypedFormBuilder,
              public notificationService: NotificationService) {
    this.createTaskForm = this.formBuilder.group({
      tenantId: [AppConstant.NULL_VALUE, Validators.required],
      title: [AppConstant.NULL_VALUE, Validators.required],
      commonUrlId: [AppConstant.NULL_VALUE, Validators.required],
      description: [AppConstant.NULL_VALUE]
    });
  }

  ngOnInit(): void {
  }

  /**
   * this method can be used to submit the task
   * @param value to form values
   */
  submitTask(value) {
     this.taskMstDto = value;
     if (this.createTaskForm.valid){
      this.taskSettingService.createTaskSettings(this.taskMstDto).subscribe((res: any) => {
          if (AppConstant.HTTP_RESPONSE_STATUS_CREATED === res.status) {
            this.notificationService.successMessage(HttpResponseMessage.TASK_CREATED_SUCCESSFULLY);
            this.resetTaskForm();
            this.refreshTable.emit('TASK_TABLE_UPDATED');
          } else {
            this.notificationService.errorMessage(res.body.message);
          }
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    } else {
      new CommonUtility().validateForm(this.createTaskForm);
    }

  }

  /**
   * this method can be used to reset task form
   */
  resetTaskForm() {
    this.createTaskForm.reset();
  }
}
