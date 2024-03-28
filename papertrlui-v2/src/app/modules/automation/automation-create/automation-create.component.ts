import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {AutomationWorkflowConfigComponent} from '../automation-workflow-config/automation-workflow-config.component';
import {AutomationEmailConfigComponent} from '../automation-email-config/automation-email-config.component';
import {
  AutomationNotificationConfigComponent
} from '../automation-notification-config/automation-notification-config.component';
import {AutomationFieldConfigComponent} from '../automation-field-config/automation-field-config.component';
import {
  AutomationSyncWithThirdPartyConfigComponent
} from '../automation-sync-with-third-party-config/automation-sync-with-third-party-config.component';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AutomationActionStoreDto} from '../../../shared/dto/automation/automation-action-store-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppAutomationAction} from '../../../shared/enums/app-automation-action';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonAutomationMstDto} from '../../../shared/dto/automation/common-automation-mst-dto';
import {CommonAutomationActionDto} from '../../../shared/dto/automation/common-automation-action-dto';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppAutomationCondition} from '../../../shared/enums/AppAutomationCondition';
import {AutomationEventActionDto} from '../../../shared/dto/automation/automation-event-action-dto';
import {
  AutomationAssignToConfigComponent
} from '../automation-assign-to/automation-assign-to-component-config.component';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppModuleSection} from '../../../shared/enums/app-module-section';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AppDocuments} from '../../../shared/enums/app-documents';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {ConfirmationService} from 'primeng/api';
import {GoogleAnalyticsService} from '../../../shared/services/google-analytics/google-analytics.service';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';
import {AppFormConstants} from "../../../shared/enums/app-form-constants";

@Component({
  selector: 'app-workflow-create',
  templateUrl: './automation-create.component.html',
  styleUrls: ['./automation-create.component.scss']
})
export class AutomationCreateComponent implements OnInit {

  public automationForm: UntypedFormGroup;
  public commonAutomationMstDto: CommonAutomationMstDto = new CommonAutomationMstDto();
  public adJoinNotification = true;
  public actionScreenList: AutomationActionStoreDto[] = [];
  public isAutomationNameIsExist = false;
  public actionType = AppAutomationAction;
  public appConstant = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public specialDropDownConditionIds: number[] = [AppAutomationCondition.IS_EMPTY, AppAutomationCondition.IS_NOT_EMPTY];


  public documentTypeList: DropdownDto = new DropdownDto();
  public eventTypeList: DropdownDto = new DropdownDto();
  public eventTypeListForRule: DropdownDto = new DropdownDto();
  public fieldList: DropdownDto = new DropdownDto();
  public actionTypeList: DropdownDto = new DropdownDto();
  public btnLoading = false;
  public ruleAutomation = false;
  public showProgressLoader = false;
  public actionDataCheckCount = 0;
  public selectedDocTypeId: number;

  public conditionList: DropdownDto[] = [];
  public fieldValueList: DropdownDto[] = [];
  public conditionListForDescriptionField = new DropdownDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public disableActions = [AppAutomationAction.CREATE_APPROVAL_WORKFLOW, AppAutomationAction.SET_FIELD_VALUE];

  @ViewChild('approvalSequenceComponent')
  public approvalSequenceComponent: AutomationWorkflowConfigComponent;
  @ViewChild('emailNotificationComponent')
  public emailNotificationComponent: AutomationEmailConfigComponent;
  @ViewChild('userNotificationComponent')
  public userNotificationComponent: AutomationNotificationConfigComponent;
  @ViewChild('fieldValueComponent')
  public fieldValueComponent: AutomationFieldConfigComponent;
  @ViewChild('syncWithThirdPartyComponent')
  public syncWithThirdPartyComponent: AutomationSyncWithThirdPartyConfigComponent;
  @ViewChild('assignToComponent')
  public assignToComponent: AutomationAssignToConfigComponent;
  @ViewChild('finalApproveComponent')
  public finalApproveComponent: AutomationAssignToConfigComponent;

  @Output() backToAutomationList = new EventEmitter();
  @Output() closeDrawer = new EventEmitter();
  @Output() clickEditActionEmitter = new EventEmitter();
  @Output() editSuccessEmitter = new EventEmitter();
  @Output() deletedSuccessEmitter = new EventEmitter();
  @Input() automationId;
  @Input() isEditView;
  @Input() isDetailView;
  @Input() isFromBill = false;
  @Input() automationStatus: any;
  @Input() isClickEditButton: any;
  @Output() isClickCloseButton = new EventEmitter<boolean>();

  public betweenCondition = 8;
  public isAllowedToSelectAnAccount = false;
  public isAllowedToSelectAnItem = false;
  public selectedDocumentTypeId: any;
  public disabledFieldIdField = false;
  public conditionIndex = 0;
  public documentEventId: any;
  public isReadOnlyAssignTo = false;
  public dropDownSelectionId: any;
  private documentTypeForView = null;
  public percentage = 0;
  public isRemoved = false;
  public automationName: any;
  public isDocTypeChanged = false;

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService,
              public gaService: GoogleAnalyticsService,
              public notificationService: NotificationService, public formGuardService: FormGuardService,
              public privilegeService: PrivilegeService, public confirmationService: ConfirmationService) {
  }


  ngOnInit(): void {
    this.addMainFormController();
    this.addConditionFormController();
    this.addActionFormController();
    this.getDocumentTypeList(this.documentTypeList);
    this.viewAutomation();
    if (this.isFromBill) {
      this.addNewRuleFromBill();
    }
  }

  /**
   * this method trigger for is from bill
   */
  addNewRuleFromBill() {
    this.automationService.automationRule.subscribe(async (rule: any) => {
      if (rule) {
        this.ruleAutomation = rule.isConfigureRule;
        if (rule.eventId) {
          this.automationForm.get('documentType').patchValue(AppDocumentType.BILL);
          this.automationForm.get('ruleAutomation').patchValue(true);
          await this.documentChanged(AppDocumentType.BILL);
          this.changeCheckBox();
          await this.ruleEventChange([rule.eventId]);
          this.automationForm.get('documentEvents').patchValue([rule.eventId]);
          await this.ruleEventChange([rule.eventId]);
          this.automationCondition.controls[0].get('firstValue').patchValue(rule.description);
        }
        if (rule.dropDownSelectionId) {
          this.dropDownSelectionId = rule.dropDownSelectionId;
        }
      }
    });
  }

  /**
   * This method use for add main form controllers
   */
  addMainFormController() {
    this.automationForm = this.formBuilder.group(
      {
        id: [null],
        automationName: [null, Validators.compose([Validators.required, Validators.maxLength(100)])],
        documentType: [null, Validators.required],
        documentEvents: [null, Validators.required],
        ruleAutomation: [false],
        automationConditionConfigs: this.formBuilder.array([]),
        automationActions: this.formBuilder.array([])
      }
    );
  }

  /**
   * This method use for add new form controller group for automation condition
   */
  addConditionFormController() {
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


    const index = this.automationCondition.length;

    this.conditionList.push(new DropdownDto());
    this.fieldValueList.push(new DropdownDto());


    const fieldId = workflowCondition.get('fieldId');
    fieldId.valueChanges.subscribe(data => this.onFieldChanged(data, workflowCondition, index, false));

    if (this.isDescriptionRule()) {
      const fieldId = workflowCondition.get('fieldId');
      const adjointCondition = workflowCondition.get('adjointCondition');
      fieldId.patchValue(AppConstant.FIELD_ID_DESCRIPTION);
      adjointCondition.patchValue('OR');
    }

    const conditionId = workflowCondition.get('conditionId');
    conditionId.valueChanges.subscribe(data => this.onConditionChanged(data, workflowCondition, false));

    this.automationCondition.push(workflowCondition);

    const conditionOrder = this.automationCondition.length;
    this.automationCondition.controls[conditionOrder - 1].get('conditionOrder').patchValue(conditionOrder);

    return workflowCondition;
  }

  /**
   * This method use for add action dropdown
   */
  addActionFormController() {
    const actionDropDown = this.formBuilder.group({
      id: [null, [Validators.required]],
      workflowConfigs: this.formBuilder.array([]),
      emailConfig: this.formBuilder.group({
        emailAddress: [null],
        emailSubject: [null],
        emailContent: [null]
      }),
      notificationConfig: this.formBuilder.group({
        notifiedUsers: [null],
        notificationType: [null],
        notificationContent: [null],
      }),
      fieldConfig: this.formBuilder.array([]),
      assignToConfig: this.formBuilder.group({
        fieldValue: [null],
        fieldId: [null],
        sectionId: [null],
      }),
      finalApprovalWorkflowLevel: this.formBuilder.group({
        approvalUser: [null],
        approvalGroup: [null],
      }),
      systemSyncConfig: this.formBuilder.group({
        systemId: [null]
      })
    });

    this.automationAction.push(actionDropDown);

    return actionDropDown;
  }

  /**
   * This method fire in field change in condition
   * @param id number
   * @param formGroup from group
   * @param index number
   * @param fromDropdown is this method is called from dropdown change event
   */
  onFieldChanged(id: any, formGroup, index, fromDropdown) {
    if (fromDropdown || !id) {
      formGroup.get('conditionId').reset();
      formGroup.get('firstValue').reset();
      formGroup.get('secondValue').reset();
    }
    this.disableFieldOnAccItem();
    this.getConditionList(id, formGroup, index);
    this.getFieldSpec(id, formGroup, index, fromDropdown);
  }

  /**
   * Disable the fields  when account or item is selected only for once
   */
  disableFieldOnAccItem() {
    const fieldArr = [];
    this.automationForm.get('automationConditionConfigs')?.value.forEach((val) => {
      fieldArr.push(val.fieldId);
    });
    const item = this.fieldList.data.find(r => AppConstant.FIELD_ID_ITEM_LIST.includes(r.id));
    if (item) {
      item.inactive = fieldArr.some(r => AppConstant.FIELD_ID_ITEM_LIST.includes(r));
    }
    const account = this.fieldList.data.find(r => AppConstant.FIELD_ID_ACCOUNT_NAME_LIST.includes(r.id));
    if (account) {
      account.inactive = fieldArr.some(r => AppConstant.FIELD_ID_ACCOUNT_NAME_LIST.includes(r));
    }

    const project = this.fieldList.data.find(r => AppConstant.FIELD_ID_PROJECT_CODE_LIST.includes(r.id));
    if (project) {
      project.inactive = fieldArr.some(r => AppConstant.FIELD_ID_PROJECT_CODE_LIST.includes(r));
    }
  }

  /**
   * This method fire in condition change in condition
   * @param id number
   * @param conditionFormGroup
   * @param fromDropdown is method is called from dropdown change
   */
  onConditionChanged(id: any, conditionFormGroup, fromDropdown) {

    if (fromDropdown && !(this.isFromBill &&
      (this.automationForm.get('documentEvents').value.includes(AppConstant.EVENT_EXPENSE_LINE_DESCRIPTION_ID) ||
      this.automationForm.get('documentEvents').value.includes(AppConstant.EVENT_ITEM_LINE_DESCRIPTION_ID)))) {
      conditionFormGroup.get('firstValue').reset();
      conditionFormGroup.get('secondValue').reset();
    }

    if (!id) {
      return;
    }
    this.automationService.getConditionSecondValueAvailability(id).subscribe((res: any) => {
      conditionFormGroup.get('hasSecondValue').patchValue(res.body);
    }, error => {
      this.notificationService.errorMessage(error);
    });
    conditionFormGroup.get('hasEmptyCondition').patchValue(this.specialDropDownConditionIds.includes(id));
  }


  /**
   * This method return automation form controller
   */
  public get automation() {
    return this.automationForm.controls;
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
   * This method can use for get grnItemInfos FormArray form controllers
   */
  public get automationCondition() {
    return this.automationForm.get('automationConditionConfigs') as UntypedFormArray;
  }

  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get automationAction() {
    return this.automationForm.get('automationActions') as UntypedFormArray;
  }


  /**
   * This method use for clean automation condition form array
   */
  resetAutomationConditions() {
    while (this.automationCondition.length !== 0) {
      this.automationCondition.removeAt(0);
    }
    this.addConditionFormController();
  }

  /**
   * This method use for reset automation action form array
   */
  resetAutomationAction() {
    this.automationAction.clear();
    this.automationAction.reset();
    this.addActionFormController();
    this.commonAutomationMstDto.automationActions = [];
  }

  /**
   * This method use for add new Condition row
   */
  addConditionRow(conditionIndex) {
    this.conditionIndex = conditionIndex;
    this.addConditionFormController();
  }

  /**
   * This method use for remove condition row
   * @param conditionIndex number
   */
  removeCondition(conditionIndex: number) {
    this.automationCondition.removeAt(conditionIndex);
    this.disableFieldOnAccItem();
  }

  /**
   * This method use for get document type list for dropdown
   */
  getDocumentTypeList(listInstance: DropdownDto) {
    this.automationService.getDocumentTypeList(this.ruleAutomation).subscribe((res: any) => {
      listInstance.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This service use for get event list
   */
  getEventList(id) {
    return new Promise<void>(resolve => {
      if (id) {
        this.automationService.getEventList(id, this.ruleAutomation).subscribe((res: any) => {
          this.eventTypeList.data = res.body;
          resolve();
        }, error => {
          this.notificationService.errorMessage(error);
        });
      } else {
        this.eventTypeList.data = [];
        this.automation.documentEvents.reset();
        resolve();
      }
    });
  }

  /**
   * This service use for get field list
   */
  getFieldList(id) {
    if (id) {
      this.automationService.getConditionEnableFieldList(id).subscribe((res: any) => {
        this.fieldList.data = res.body;
        if (id == AppDocumentType.BILL) {
          this.fieldList.data.splice(this.fieldList.data.findIndex(x => x.id === AppConstant.FIELD_ID_DESCRIPTION), 1);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      this.resetAutomationConditions();
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

  getFieldSpec(id: any, condition: AbstractControl, index, fromDropdown) {
    if (id) {
      if (fromDropdown) {
        condition.get('firstValue').reset();
        condition.get('secondValue').reset();
      }

      this.automationService.getAutomationFieldSpec(id).subscribe((res: any) => {
        condition.get('hasDropDownValue').patchValue(res.body.dropDown);
        condition.get('dataType').patchValue(res.body.dataType);
        condition.get('maxLength').patchValue(res.body.maxLength);

        this.loadDropDownData(res, condition, index);
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  loadDropDownData(fieldSpecRes, condition: AbstractControl, index) {
    if (fieldSpecRes.body.endpointUrl) {
      let isCreate = true;
      if (this.isDetailView) {
        isCreate = false;
      } else if (isCreate && this.isEditView) {
        isCreate = false;
      }
      this.automationService.getDropDownData(fieldSpecRes.body.endpointUrl, isCreate).subscribe((res: any) => {
        this.fieldValueList[index].data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
    if (fieldSpecRes.body.options) {
      this.fieldValueList[index].data = fieldSpecRes.body.options;
    }
  }

  /**
   * This service use for get action list by document type id
   * @param eventIds dropdown event
   * @param documentType If from dropdown change null will return
   * from view automation document type will return
   */
  getActionTypeList(eventIds, documentType) {
    return new Promise<void>(resolve => {
      if (!documentType) {
        documentType = this.automationForm.get('documentType').value;
      }
      if (!eventIds && !documentType) {
        resolve();
        return;
      }
      this.automationService.getActionTypeList(new AutomationEventActionDto(documentType, eventIds, this.ruleAutomation)).then(async (res: any) => {
        this.actionTypeList.data = await res.body;
        resolve();
      }, error => {
        resolve();
        this.notificationService.errorMessage(error);
      });
    });

  }

  /**
   * Reset Actions Only
   */
  resetActionsOnly() {
    this.resetAutomationAction();
    this.resetActionDropDown();
    this.actionScreenList = [];
  }

  /**
   * This method use for load automation data
   */
  viewAutomation() {
    if (this.automationId && (this.isDetailView || this.isEditView)) {
      this.automationService.getAutomationData(this.automationId).subscribe(async (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.ruleAutomation = res.body.ruleAutomation;
          this.changeCheckBox();
          this.documentTypeForView = res.body.documentType;
          this.automationName = String(res.body.automationName).trim();

          await this.documentChanged(res.body.documentType);
          this.automationForm.get('documentEvents').patchValue(res.body.documentEvents);

          if (res.body.ruleAutomation) {
            await this.ruleEventChange(res.body.documentEvents);
          } else {
            await this.eventChanged(res.body.documentEvents, res.body.documentType);
          }

          const eventId = res.body.documentEvents[AppConstant.ZERO];

          if (res.body.ruleAutomation && (AppConstant.EVENT_ITEM_LINE_DESCRIPTION_ID === eventId ||
            AppConstant.EVENT_EXPENSE_LINE_DESCRIPTION_ID === eventId)) {

            this.isAllowedToSelectAnItem = eventId === AppConstant.EVENT_ITEM_LINE_DESCRIPTION_ID;
            this.isAllowedToSelectAnAccount = eventId === AppConstant.EVENT_EXPENSE_LINE_DESCRIPTION_ID;
            res.body.automationConditionConfigs.forEach(() => {
              this.getDescriptionFieldRelatedConditions();
            });
            this.automationService.lineItemId.next(parseInt(res.body.automationActions[0].assignToConfig.fieldValue));
            this.automationAction.controls[AppConstant.ZERO].get(AppConstant.FORM_CONTROL_ID).patchValue(AppConstant.EVENT_TYPE_ID_ASSIGN_TO);

            if (res.body.automationActions.length !== 0) {
              res.body.automationActions[0].assignToConfig.fieldValue = parseInt(res.body.automationActions[0].assignToConfig.fieldValue);
            }
          }

          this.commonAutomationMstDto = res.body;
          this.patchAutomationData(res.body);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  setActionType(index, value: CommonAutomationActionDto) {
    const action: AutomationActionStoreDto = new AutomationActionStoreDto();
    action.index = index;
    action.actionId = value.id;
    this.actionScreenList.splice(index, 1, action);
  }

  /**
   * Are Conditions available in EditView
   */
  areConditionsAvailableInEditView(bool) {
    return (this.commonAutomationMstDto.automationConditionConfigs && bool &&
      this.commonAutomationMstDto.automationConditionConfigs.length === 0);
  }

  /**
   * This method use for patch automation data to form
   * @param automationMst CommonAutomationMstDto
   */
  patchAutomationData(automationMst: CommonAutomationMstDto) {

    this.removeCondition(0);
    automationMst.automationConditionConfigs.forEach((value) => {

      if (!value.fieldDataType.includes('date') || value.fieldDataType.includes('text')) {

        const cFirstValue = Number(value.firstValue);
        const cSecondValue = Number(value.secondValue);

        if (!isNaN(cFirstValue)) {
          value.firstValue = cFirstValue;
        }

        if (!isNaN(cSecondValue)) {
          value.secondValue = cSecondValue;
        }

      }
      this.addConditionFormController();
    });

    this.areConditionsAvailableInEditView(this.isEditView) ? this.addConditionFormController() : null;

    this.removeAction(0);
    this.removeActionFormController(0);

    automationMst.automationActions.forEach((value, index) => {
      this.setActionType(index, value);
      this.addActionFormController();
    });

    setTimeout(() => {
      if (this.isDetailView) {
        new CommonUtility().readOnlyForm(this.automationForm);
        this.automationForm.get('documentEvents').enable();
        this.automationForm.patchValue(automationMst);
      } else {
        this.automationForm.patchValue(automationMst);
      }
      this.disableFieldOnAccItem();
    }, 200);

  }


  /**
   * This method use for handle actionType change
   * @param event selected element
   * @param index
   */
  onActionTypeChanged(event, index: number) {
    if (event.controls.id.value !== null) {
      this.actionTypeChanged(event.controls.id.value, index);
    }
  }

  /**
   * wait until for 5 seconds or actionTypeList gets data on value change method
   * to execute the code
   */
  checkTypeIsEmpty() {
    return new Promise<void>(async resolve => {
      while (this.actionTypeList.data.length === 0 && this.actionDataCheckCount < 7) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.actionDataCheckCount += 1;
      }
      resolve();
    });
  }

  /**
   * This method use for handle actionType change
   * @param id selected element
   * @param index
   */
  async actionTypeChanged(id, index: number) {
    if (!this.ruleAutomation) {
      await this.disableActionsOnDropDown();
    }
    const action: AutomationActionStoreDto = new AutomationActionStoreDto();
    const actionType = this.actionTypeList.data.find(i => i.id === id);
    action.typeIdIndex = this.actionTypeList.data.indexOf(actionType);
    action.index = index;
    action.actionId = id;
    this.actionScreenList.splice(index, 1, action);
  }

  /**
   * Disable actions on dropdown when action changed and event changed
   */
  async disableActionsOnDropDown() {
    const toDisableIds = [];
    // Wait until actionTypeList.data gets data
    await this.checkTypeIsEmpty();
    this.disableActions.forEach(value => {
      this.automationAction.controls.forEach((value1, index1) => {
        if ((this.automationAction.at(index1) as UntypedFormGroup).get('id').value === value) {
          toDisableIds.push(this.actionTypeList.data.find(x => x.id === value).id);
        }
      });
    });

    // Enable all the dropdown options
    this.actionTypeList.data.forEach(value => value.inactive = false);
    // Disable all restricted dropdown values
    toDisableIds.forEach(value => this.actionTypeList.data.find(x => x.id === value).inactive = true);
  }

  /**
   * This method use for remove automation action
   * @param index
   */
  removeAction(index: number) {
    // This for active removed action from dropdown
    const actionId = this.automationAction.controls[index].get('id').value;
    const actionType = this.actionTypeList.data.find(i => i.id === actionId);

    if (actionType) {
      actionType.inactive = false;
    }

    if (this.automationAction.length > 1) {
      this.automationAction.removeAt(index);
    } else {
      this.automationAction.controls[index].get('id').reset();
    }

    this.actionScreenList.splice(index, 1);
  }

  /**
   * This method use for remove action form controller
   * @param index number
   */
  removeActionFormController(index: number) {
    this.automationAction.removeAt(index);
  }

  /**
   * This method use for check component visibility
   * @param index number
   * @param actionId number
   */
  check(index, actionId) {
    if (this.actionScreenList[index] !== undefined) {
      return this.actionScreenList[index].actionId === actionId;
    }
  }

  /**
   * This method use for reset dropdown action
   */
  resetActionDropDown() {
    this.actionTypeList.data.forEach(value => {
      if (value.inactive) {
        value.inactive = false;
      }
    });
  }

  /**
   * This method use for reset automation form
   */
  reset() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_AUTOMATION,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    if (this.approvalSequenceComponent) {
      this.approvalSequenceComponent.resetWorkflowConfig();
    }

    if (this.fieldValueComponent) {
      this.fieldValueComponent.resetFieldValues();
    }

    this.resetAutomationConditions();
    this.resetAutomationAction();
    this.resetActionDropDown();
    this.ruleAutomation = false;
    this.isDocTypeChanged = false;
    this.actionScreenList = [];

    this.automationForm.reset();

    if (this.isEditView) {
      this.viewAutomation();
      return;
    }

    if (this.isFromBill) {
      this.ruleAutomation = true;
      this.addNewRuleFromBill();
    }
    this.getDocumentTypeList(this.documentTypeList);
    this.documentChanged(null);
  }

  /**
   * This method use for get automation name is exist
   */
  getAutomationNameIsExist() {
    const automationName = this.automationForm.get('automationName').value;
    if (this.isEditView && String(automationName).trim() === String(this.automationName)) {
      return;
    }
    this.automationService.getAutomationNameIsExist(automationName).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.isAutomationNameIsExist = res.body;
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for create new automation
   */
  submit() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.CREATE_AUTOMATION,
      AppAnalyticsConstants.MODULE_NAME_AUTOMATION,
      AppAnalyticsConstants.CREATE_AUTOMATION,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    this.btnLoading = true;
    if (!this.automationForm.valid) {
      new CommonUtility().validateForm(this.automationForm);
      this.btnLoading = false;
      return;
    }
    const workflowMasterDto: CommonAutomationMstDto = this.automationForm.value;
    this.automationService.createAutomation(workflowMasterDto).subscribe(async (res: any) => {
      if (AppResponseStatus.STATUS_CREATED === res.status) {
        if (res.body.uuid && res.body.finalApprovalUser) {
          await this.getPercentage(res.body.uuid);
          this.percentage = 0;
        }
        this.btnLoading = false;
        this.reset();
        if (this.isFromBill) {
          this.closeAutomationCreateMode();
        }
        this.backToAutomationList.emit();
        this.notificationService.successMessage(HttpResponseMessage.AUTOMATION_SAVED_SUCCESSFULLY);
      } else {
        this.btnLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.btnLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  async getPercentage(uuid) {
    return new Promise<void>(async resolve => {
      while (this.percentage !== 100) {
        this.getPercentageStatus(uuid);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      resolve();
    });
  }

  getPercentageStatus(uuid) {
    return new Promise<void>(resolve => {
      this.automationService.getProgressPercentage(uuid).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.percentage = parseInt(res.body);
        }
        if (AppResponseStatus.STATUS_CREATED === res.status) {
          resolve();
        }
      });
    });
  }

  /**
   * This method use for update automation
   */
  update() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.SAVE,
      AppAnalyticsConstants.MODULE_NAME_AUTOMATION,
      AppAnalyticsConstants.SAVE,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    this.btnLoading = true;
    if (!this.automationForm.valid) {
      new CommonUtility().validateForm(this.automationForm);
      this.btnLoading = false;
      return;
    }
    const workflowMasterDto: CommonAutomationMstDto = this.automationForm.value;
    this.automationService.editAutomation(workflowMasterDto).subscribe(async (res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS !== res.status) {
        this.btnLoading = false;
        this.notificationService.infoMessage(res.body.message);
        return;
      }
      if (res.body.uuid && res.body.finalApprovalUser) {
        await this.getPercentage(res.body.uuid);
        this.percentage = 0;
      }
      this.btnLoading = false;
      this.reset();
      if (!this.isClickEditButton) {
        this.closeDrawer.emit();
      } else {
        this.editSuccessEmitter.emit();
      }
      this.notificationService.successMessage(HttpResponseMessage.AUTOMATION_UPDATED_SUCCESSFULLY);

    }, error => {
      this.btnLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  closePanel() {
    this.automationService.lineItemId.next(null);
    this.closeDrawer.emit();
  }


  onFirstDateSelected(condition: AbstractControl) {
    try {
      condition.get('firstValue').patchValue(condition.get('firstValue').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (ex) {

    }
  }

  onSecondDateSelected(condition: AbstractControl) {
    try {
      condition.get('secondValue').patchValue(condition.get('secondValue').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    } catch (ex) {

    }
  }

  /**
   * Triggers when event is changed from drop down and viewAutomation
   * To get the action type list
   * clears all the actions event are empty
   * @param ids ids of event list
   * @param documentType document types on view automation and null from dropdown change
   */
  async eventChanged(ids: any, documentType) {
    this.resetActionsOnly();
    this.resetAutomationAction();

    await this.getActionTypeList(ids, documentType);
    if (this.ruleAutomation) {
      return;
    }
    await this.disableActionsOnDropDown();
  }

  /**
   * Triggers when document changed from drop down and view automation method
   * To get field list and event list
   * @param id
   */
  async documentChanged(id) {
    this.selectedDocTypeId = id;
    this.documentTypeForView = id;
    this.actionScreenList = [];

    this.automationForm.get('documentEvents').reset();
    this.resetAutomationConditions();
    this.resetAutomationAction();
    this.eventTypeList.data = [];
    this.actionTypeList.data = [];
    if (!id) {
      this.isAllowedToSelectAnAccount = false;
      this.isAllowedToSelectAnItem = false;
      this.automationAction.controls[AppConstant.ZERO].get('assignToConfig').get('fieldId').reset();
      this.automationAction.controls[AppConstant.ZERO].get('assignToConfig').get('sectionId').reset();
      this.automationAction.controls[AppConstant.ZERO].get(AppConstant.FORM_CONTROL_ID).reset();
      return;
    }
    this.getFieldList(id);
    this.selectedDocumentTypeId = id;
    await this.getEventList(id);
  }

  /**
   * this method trigger when change the check box
   */
  changeCheckBox() {
    if (this.isFromBill) {
      this.getDocumentTypeList(this.documentTypeList);
      return;
    }
    this.automationForm.get('documentType').reset();
    this.automationForm.get('documentEvents').reset();
    this.automationForm.get('ruleAutomation').patchValue(this.ruleAutomation);
    this.resetAutomationAction();
    this.resetAutomationActionOnChangeAction(true, null);
    this.actionTypeList.data = [];
    this.documentTypeList.data = [];
    this.eventTypeList.data = [];
    this.isAllowedToSelectAnAccount = false;
    this.isAllowedToSelectAnItem = false;
    this.getDocumentTypeList(this.documentTypeList);
    this.selectedDocTypeId = null;
    this.resetAutomationConditions();
  }

  /**
   * line item option change
   */
  async ruleEventChange(selectedId) {
    this.resetWorkflowAction(selectedId);
    return new Promise<void>(async resolve => {
      this.isReadOnlyAssignTo = false;
      await this.eventChanged(selectedId, this.documentTypeForView);
      if (!this.ruleAutomation) {
        return;
      }
      this.resetAutomationConditions();

      if (!selectedId[0]) {
        this.isAllowedToSelectAnAccount = false;
        this.isAllowedToSelectAnItem = false;
        this.automationAction.controls[AppConstant.ZERO].get(AppConstant.FORM_CONTROL_ID).reset();
        return;
      }
      this.isReadOnlyAssignTo = true;

      if (this.isDescriptionRule()) {
        this.getDescriptionFieldRelatedConditions();
        this.serveLineItemSelection(selectedId[0]);
        this.automationAction.controls[AppConstant.ZERO].get('assignToConfig').get('fieldId').patchValue(selectedId[0]);
        this.automationAction.controls[AppConstant.ZERO].get('assignToConfig').get('sectionId').patchValue(getSectionId());
        this.automationAction.controls[AppConstant.ZERO].get(AppConstant.FORM_CONTROL_ID).patchValue(AppConstant.EVENT_TYPE_ID_ASSIGN_TO);
      } else {
        this.automationAction.controls[AppConstant.ZERO].get(AppConstant.FORM_CONTROL_ID).patchValue(AppConstant.EVENT_TYPE_ID_FINAL_APPROVE);
      }
      resolve();

      function getSectionId() {
        let sectionId: any;
        if (selectedId[0] === AppConstant.EVENT_ITEM_LINE_DESCRIPTION_ID) {
          sectionId = AppModuleSection.ITEM_COST_DISTRIBUTION_SECTION_ID;
        }
        if (selectedId[0] === AppConstant.EVENT_EXPENSE_LINE_DESCRIPTION_ID) {
          sectionId = AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID;
        }
        return sectionId;
      }
    });
  }

  /**
   * this method validate action according to the event change
   * @param selectedEvents to event ids
   */
  resetWorkflowAction(selectedEvents: any []) {

    const selectedIdFilterList: number [] = selectedEvents?.filter(x => x === AppDocuments.DOCUMENT_EVENT_SUBMITTED ||
      x === AppDocuments.DOCUMENT_EVENT_APPROVED);

    const actionIndex = this.approvalSequenceComponent ? this.approvalSequenceComponent.actionIndex : AppConstant.ZERO;

    const eventId = this.automationAction.controls[actionIndex].get('id');

    if (selectedIdFilterList.length === AppConstant.ZERO && this.approvalSequenceComponent) {
      this.approvalSequenceComponent.resetWorkflowConfig();
      this.removeAction(this.approvalSequenceComponent.actionIndex);
      eventId.reset();
    }
  }

  /**
   * this method can be used to get line item details according to the event
   * @param selectedId to selected event id
   */
  serveLineItemSelection(selectedId) {
    this.isAllowedToSelectAnItem = selectedId === AppConstant.EVENT_ITEM_LINE_DESCRIPTION_ID;
    this.isAllowedToSelectAnItem ? this.automationService.isSelectedItemEvent.next(true) :
      this.automationService.isSelectedItemEvent.next(false);
    this.isAllowedToSelectAnAccount = selectedId === AppConstant.EVENT_EXPENSE_LINE_DESCRIPTION_ID;
    this.isAllowedToSelectAnAccount ? this.automationService.isSelectedAccountEvent.next(true) :
      this.automationService.isSelectedAccountEvent.next(false);
  }

  /**
   * this method used for get conditions according to description selection
   */
  getDescriptionFieldRelatedConditions() {
    if (AppConstant.FIELD_ID_DESCRIPTION) {
      this.automationService.getConditionList(AppConstant.FIELD_ID_DESCRIPTION).subscribe((res: any) => {
        this.conditionListForDescriptionField.data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method trigger when closed the automation create
   */
  closeAutomationCreateMode() {
    this.isClickCloseButton.emit();
  }

  /**
   * this method reset and initialize actions records
   */
  resetAutomationActionOnChangeAction(isFromruleAutomation: boolean, i) {
    if (!isFromruleAutomation) {
      let index: any;
      let isAllowedToRemove: boolean;
      this.approvalSequenceComponent ? index = this.approvalSequenceComponent.actionIndex : index = null;
      isAllowedToRemove = (index === i);

      this.approvalSequenceComponent && isAllowedToRemove ?
        this.approvalSequenceComponent.getAutomationWorkflowConfig(this.approvalSequenceComponent.actionIndex).controls = [] : null;
      this.approvalSequenceComponent && isAllowedToRemove ?
        this.approvalSequenceComponent.automationMstDto.automationActions[this.approvalSequenceComponent.actionIndex].workflowConfigs = [] : null;
    } else if (!this.ruleAutomation) {
      this.removeAction(AppConstant.ZERO);
    }
  }

  isDescriptionRule() {
    if (!this.ruleAutomation) {
      return false;
    }
    if (this.automationForm.get('documentEvents').value) {
      return this.automationForm.get('documentEvents').value[0] === AppConstant.EVENT_ITEM_LINE_DESCRIPTION_ID ||
        this.automationForm.get('documentEvents').value[0] === AppConstant.EVENT_EXPENSE_LINE_DESCRIPTION_ID;
    }
  }

  editAutomation() {
    this.clickEditActionEmitter.emit();
  }

  /**
   * This method use for delete automation
   */
  deleteAutomation() {
    if (!this.automationId) {
      return;
    } else {
      this.confirmationService.confirm({
        key: 'automationDeleteKey',
        message: 'You want to delete this Automation!',
        accept: () => {
          this.automationService.deleteAutomation(this.automationId).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.closePanel();
              this.deletedSuccessEmitter.emit();
              this.notificationService.successMessage(HttpResponseMessage.AUTOMATION_DELETED_SUCCESSFULLY);
            } else {
              this.notificationService.errorMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  getMessageForSelectedField(id) {
    const message = this.actionTypeList.data.find(x => x.id === id)?.messageAndUnsupportedEventList;
    return message ? message : null;
  }

}
