import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DropdownDto} from "../../../shared/dto/common/dropDown/dropdown-dto";
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {RemoveSpace} from "../../../shared/helpers/remove-space";
import {AutomationService} from "../../../shared/services/automation-service/automation.service";
import {AppResponseStatus} from "../../../shared/enums/app-response-status";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {ManageFeatureService} from "../../../shared/services/settings/manage-feature/manage-feature.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {PrivilegeService} from "../../../shared/services/privilege.service";
import {AppAuthorities} from "../../../shared/enums/app-authorities";

@Component({
  selector: 'app-reminder-configuration',
  templateUrl: './reminder-configuration.component.html',
  styleUrls: ['./reminder-configuration.component.scss']
})
export class ReminderConfigurationComponent implements OnInit {

  public formGroup: UntypedFormGroup;
  public documentTypeList: DropdownDto = new DropdownDto();
  public eventTypeList: DropdownDto = new DropdownDto();
  public conditionList: DropdownDto[] = [];
  public fieldValueList: DropdownDto[] = [];
  public appConstant = AppEnumConstants;
  public removeSpace: RemoveSpace = new RemoveSpace();
  public betweenCondition = 8;
  public conditionIndex = 0;
  public fieldList: DropdownDto = new DropdownDto();
  public users: DropdownDto = new DropdownDto();
  public excludeUsers: DropdownDto = new DropdownDto();
  public loading = false;
  public userPanel = false;

  @Input() detailView = false;
  @Input() isEdit = false;
  @Input() id;
  @Output() onComplete = new EventEmitter()

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService,
              public notificationService: NotificationService, public manageFeatureService: ManageFeatureService,
              public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
    this.initForm();
    this.formChangeEvents();
    this.getDocumentTypes();
    this.getUsers();
    this.addConditionFormController(null, null);
    if (this.isEdit || this.detailView) {
      this.getReminderDetails();
    }
  }

  initForm() {
    this.formGroup = this.formBuilder.group(
      {
        id: [null],
        name: [null, Validators.required],
        documentTypeId: [null, Validators.required],
        eventId: [null, Validators.required],
        escalateUsers: [null],
        excludeUsers: [null],
        numberOfOccurrences: [null],
        escalateFromOccurrences: [null],
        escalateFrequency: [null],
        frequency: [1, [Validators.min(1), Validators.required]],
        numberOfDays: [null],
        escalatePresentBln: [false],
        sendToOverrider: [false],
        conditionConfigs: this.formBuilder.array([]),
      }
    );
  }

  getUsers() {
    this.automationService.getApprovalUserList(!this.isEdit).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.users.data = Object.assign([], res.body);
        Object.freeze(res.body);
        this.excludeUsers.data = Object.assign([], res.body);
        if (this.privilegeService.isAuthorized(AppAuthorities.USERS_CREATE) && !this.detailView) {
          this.excludeUsers.addNew();
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getDocumentTypes() {
    this.manageFeatureService.getDocumentTypes().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.documentTypeList.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  getEventList() {
    return new Promise<void>(resolve => {
      if (!this.f.documentTypeId.value) {
        resolve();
        return;
      }
      this.manageFeatureService.getEventListForDocument(this.f.documentTypeId.value).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.eventTypeList.data = res.body;
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    })

  }

  getFieldList() {
    return new Promise<void>(resolve => {
      if (!this.f.documentTypeId.value) {
        resolve();
        return;
      }
      this.manageFeatureService.getActionEnableFieldList(this.f.documentTypeId.value).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.fieldList.data = res.body;
        }
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    })
  }

  async getReminderDetails() {
    this.manageFeatureService.getReminder(this.id).subscribe(async (res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        const val = res.body;
        this.formGroup.get('documentTypeId').patchValue(val.documentTypeId)
        await this.documentTypeChange(val.documentTypeId, false);
        for (let i = 0; i < val.conditionConfigs.length; i++) {
          await this.addConditionFormController(val.conditionConfigs[i], i);
          if (val.conditionConfigs[i].fieldDataType == 'int') {
            val.conditionConfigs[i].firstValue = +val.conditionConfigs[i].firstValue
          }
        }

        if (!val.conditionConfigs.length && this.isEdit) {
          this.addConditionFormController(null, null);
        }

        this.formGroup.patchValue(val);

        if (this.detailView) {
          setTimeout(() => {
            this.formGroup.disable();
            this.formGroup.get('excludeUsers').enable();
            this.formGroup.get('escalateUsers').enable();
          }, 800)
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for open user creation modal
   * @param event
   */
  changedUserSelection(event: any) {
    if (event.itemValue === 0) {
      this.userPanel = true;
      setTimeout(() => {
        this.formGroup.get('escalateUsers').reset();
      }, 100);
    }
  }

  get f() {
    return this.formGroup.controls;
  }

  public get automationCondition() {
    return this.formGroup.get('conditionConfigs') as UntypedFormArray;
  }

  async addConditionFormController(val, index) {
    const workflowCondition = this.formBuilder.group({
      fieldId: [null],
      conditionId: [null],
      firstValue: [null],
      secondValue: [null],
      adjointCondition: ['AND'],
      hasDropDownValue: [false],
      hasSecondValue: [false],
      dataType: [null],
      conditionOrder: [null],
      hasEmptyCondition: [null],
      maxLength: [0]
    });
    this.conditionList.push(new DropdownDto());
    this.fieldValueList.push(new DropdownDto());
    if ((this.isEdit || this.detailView) && val) {
      await this.onFieldChanged(val.fieldId, workflowCondition, index, false);
    }

    this.automationCondition.push(workflowCondition);
    const conditionOrder = this.automationCondition.length;
    this.automationCondition.controls[conditionOrder - 1].get('conditionOrder').patchValue(conditionOrder);
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
   * This method use for remove condition row
   * @param conditionIndex number
   */
  removeCondition(conditionIndex: number) {
    this.automationCondition.removeAt(conditionIndex);
  }

  /**
   * This method use for add new Condition row
   */
  addConditionRow(conditionIndex) {
    this.conditionIndex = conditionIndex;
    this.addConditionFormController(null, null);
  }

  /**
   * Check the validations of the form
   * Call the update or create method
   */
  submitForm() {
    this.loading = true;
    let arr = this.formGroup.get('escalateUsers').value;
    if (arr) {
      arr = arr.filter(item => !(item === 0));
      this.formGroup.get('escalateUsers').patchValue(arr)
    }
    if (this.formGroup.valid) {
      if (this.isEdit) {
        this.updateReminder();
      } else {
        this.createReminder();
      }
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.formGroup);
    }
  }

  /**
   * Add Reminder
   * @private
   */
  private createReminder() {
    this.manageFeatureService.createReminder(this.formGroup.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.notificationService.successMessage(HttpResponseMessage.REMINDER_CREATED_SUCCESSFULLY);
        this.resetForm();
        this.onComplete.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Update Reminder
   * @private
   */
  private updateReminder() {
    this.manageFeatureService.updateReminder(this.formGroup.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.REMINDER_UPDATED_SUCCESSFULLY);
        this.onComplete.emit();
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
      this.loading = false;
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Reset the form
   */
  resetForm() {
    this.formGroup.reset();
    this.fieldList.data = [];
    this.resetConditions();
    this.conditionList = []
    this.addConditionFormController(null, null);
    this.formGroup.get('frequency').patchValue(1);
    if (this.isEdit) {
      this.getReminderDetails();
    }
  }

  /**
   * Triggers when document changed to
   * Get all the related events
   * Clear the conditions
   * Get the related Fields
   * @param value
   * @param fromDropDown
   */
  async documentTypeChange(value, fromDropDown) {
    if (value) {
      await this.getEventList();
      this.resetConditions();
      if (fromDropDown) {
        this.conditionList = []
        this.addConditionFormController(null, null);
      }
      await this.getFieldList();
    } else {
      this.eventTypeList.data = [];
      this.formGroup.get('eventId').reset();
    }
  }

  /**
   * Check for form event changes
   */
  formChangeEvents() {
    this.formGroup.get('escalatePresentBln').valueChanges.subscribe((value => {
      const escalateUser = this.formGroup.get('escalateUsers');
      if (value) {
        escalateUser.clearValidators();
        escalateUser.setValidators(Validators.required);
        escalateUser.updateValueAndValidity()
      } else {
        escalateUser.clearValidators();
        escalateUser.updateValueAndValidity()
      }
    }))
  }

  /**
   * Conditions date selection
   * Convert the first date selection into string
   * @param condition
   */
  onFirstDateSelected(condition: AbstractControl) {
    try {
      condition.get('firstValue').patchValue(condition.get('firstValue').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (ex) {

    }
  }

  /**
   * Conditions date selection
   * Convert the second date selection into string
   * @param condition
   */
  onSecondDateSelected(condition: AbstractControl) {
    try {
      condition.get('secondValue').patchValue(condition.get('secondValue').value.toLocaleDateString());
    } catch (ex) {

    }
  }

  /**
   * This method use for clean condition form array
   */
  resetConditions() {
    while (this.automationCondition.length !== 0) {
      this.automationCondition.removeAt(0);
    }
  }

  /**
   * This service use for get condition list
   * @param id
   * @param condition
   * @param index
   */
  getConditionList(id, condition: AbstractControl, index) {
    if (id) {
      this.automationService.getConditionList(id).subscribe((res: any) => {
        this.conditionList[index].data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method fire in field change in condition
   * @param id number
   * @param formGroup from group
   * @param index number
   * @param fromDropdown is this method is called from dropdown change event
   */
  async onFieldChanged(id: any, formGroup, index, fromDropdown) {
    return new Promise<void>(async resolve => {
      if (fromDropdown || !id) {
        formGroup.get('conditionId').reset();
        formGroup.get('firstValue').reset();
        formGroup.get('secondValue').reset();
      }

      this.getConditionList(id, formGroup, index);
      await this.getFieldSpec(id, formGroup, index);
      resolve();
    })
  }

  getFieldSpec(id: any, condition: AbstractControl, index) {
    return new Promise<void>(resolve => {
      if (id) {
        this.automationService.getAutomationFieldSpec(id).subscribe(async (res: any) => {
          condition.get('hasDropDownValue').patchValue(res.body.dropDown);
          condition.get('dataType').patchValue(res.body.dataType);
          condition.get('maxLength').patchValue(res.body.maxLength);
          await this.loadDropDownData(res, condition, index);
          resolve();
        }, error => {
          resolve();
          this.notificationService.errorMessage(error);
        });
      } else {
        condition.get('firstValue').reset();
        condition.get('secondValue').reset();
        resolve();
      }
    })
  }

  loadDropDownData(fieldSpecRes, condition: AbstractControl, index) {
    return new Promise<void>(resolve => {
      if (fieldSpecRes.body.endpointUrl) {
        this.automationService.getDropDownData(fieldSpecRes.body.endpointUrl, !this.isEdit).subscribe((res: any) => {
          this.fieldValueList[index].data = res.body;
          resolve();
        }, error => {
          resolve();
          this.notificationService.errorMessage(error);
        });
      } else resolve();
      if (fieldSpecRes.body.options) {
        resolve();
        this.fieldValueList[index].data = fieldSpecRes.body.options;
      } else resolve()
    })

  }
}
