import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {CommonAutomationMstDto} from '../../../shared/dto/automation/common-automation-mst-dto';
import {CommonAutomationFieldConfigDto} from '../../../shared/dto/automation/common-automation-field-config-dto';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppAutomationField} from '../../../shared/enums/app-automation-field';
import {BillApprovalsService} from '../../../shared/services/bills/bill-approvals.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AutomationConditionDto} from "../../../shared/dto/automation/automation-condition-dto";
import {
  CommonAutomationFieldCompatibilityDto
} from "../../../shared/dto/automation/common-automation-field-compatibility-dto";
import {AppAutomationAction} from "../../../shared/enums/app-automation-action";


@Component({
  selector: 'app-automation-field-config',
  templateUrl: './automation-field-config.component.html',
  styleUrls: ['./automation-field-config.component.scss']
})
export class AutomationFieldConfigComponent implements OnInit {

  @Output()
  public addNew: EventEmitter<any> = new EventEmitter();
  @Input()
  public actionIndex: number;
  @Input()
  public automationMstDto: CommonAutomationMstDto;
  @Input()
  public isEdit: boolean;
  @Input()
  public automationForm: UntypedFormGroup;
  @Input()
  public isDetailView: boolean;
  @Input()
  public documentType: number;


  public fieldList: DropdownDto = new DropdownDto();
  public fieldValueList: DropdownDto[] = [];

  public isAddNewAccount = false;
  public isAddNewProjectCodes = false;
  public isAddNewItem = false;

  public documentTypeBill = 1;
  public statusField = 74;
  public fieldValueApproved = AppConstant.STATUS_APPROVED;
  public enableDistributionTables = false;

  public accountList: DropdownDto = new DropdownDto();
  public projectCodeList: DropdownDto = new DropdownDto();
  public itemList: DropdownDto = new DropdownDto();

  public appConstant = AppEnumConstants;

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService, public billsService: BillsService,
              public notificationService: NotificationService, public billApprovalsService: BillApprovalsService) {
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
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get automationActionConfig() {
    return this.automationForm.get('automationActions') as UntypedFormArray;
  }


  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public fieldConfig(actionIndex: number) {
    return this.automationActionConfig.controls[actionIndex].get('fieldConfig') as UntypedFormArray;
  }

  /**
   * This method can use for get billExpenseCostDistributions FormArray from controllers
   */
  public getExpenseCostDistributionForm(actionIndex: number, fieldValueIndex: number) {
    return this.fieldConfig(actionIndex).controls[fieldValueIndex].get('billExpenseCostDistributions') as UntypedFormArray;
  }

  /**
   * This method can use for get billItemCostDistributions FormArray from controllers
   */
  public getItemCostDistributionForm(actionIndex: number, fieldValueIndex: number) {
    return this.fieldConfig(actionIndex).controls[fieldValueIndex].get('billItemCostDistributions') as UntypedFormArray;
  }


  /**
   * This method use for add new form controller group for field value
   */
  addFieldValueFormController() {
    const fieldValue = this.formBuilder.group({
      hasDropDownValue: [false],
      dataType: [false],
      fieldId: [null, [Validators.required]],
      fieldValue: [null, [Validators.required]],
      hasDistributionInfo: [false],
      billExpenseCostDistributions: this.formBuilder.array([]),
      billItemCostDistributions: this.formBuilder.array([]),
      maxLength: [0]
    });

    const index = this.fieldConfig(this.actionIndex).length;

    this.fieldValueList.push(new DropdownDto());

    const fieldId = fieldValue.get('fieldId');
    fieldId.valueChanges.subscribe(data => this.onFieldChanged(data, fieldValue, index));

    this.fieldConfig(this.actionIndex).push(fieldValue);
  }

  /**
   * This method use for add new form controller group for field value
   * @param value CommonAutomationFieldConfigDto
   */
  addFieldValueFormControllerWithData(value: CommonAutomationFieldConfigDto) {

    const fieldValue = this.formBuilder.group({
      hasDropDownValue: [false],
      dataType: [false],
      fieldId: [null, [Validators.required]],
      fieldValue: [null, [Validators.required]],
      hasDistributionInfo: [false],
      billExpenseCostDistributions: this.formBuilder.array([]),
      billItemCostDistributions: this.formBuilder.array([]),
      maxLength: [0]
    });


    fieldValue.get('fieldValue').patchValue(value.fieldValue);
    fieldValue.get('fieldId').patchValue(value.fieldId);

    const index = this.fieldConfig(this.actionIndex).length;

    this.fieldValueList.push(new DropdownDto());

    const fieldId = fieldValue.get('fieldId');
    fieldId.valueChanges.subscribe(data => this.onFieldChanged(data, fieldValue, index));

    this.fieldConfig(this.actionIndex).push(fieldValue);

  }


  /**
   * This method use for remove field value row
   * @param fieldValueIndex number
   */
  removeFieldValue(fieldValueIndex: number) {
    this.fieldConfig(this.actionIndex).removeAt(fieldValueIndex);
    if (this.fieldValueList[fieldValueIndex]){
      this.fieldValueList.splice(fieldValueIndex, 1);
    }
    this.disableFieldDropdownValues();
  }

  /**
   * This method use for add new row to field value form array list
   */
  addFieldValueRow() {
    this.addFieldValueFormController();
  }

  /**
   * This method use for call add new action dropdown in automation creation screen
   */
  addActionDropDown() {
    this.addNew.emit();
  }

  /**
   * This method use for handle fieldTypeChanged
   * @param event dropdown data
   * @param field AbstractControl
   */
  fieldTypeChanged(event: any, field: AbstractControl) {
    field.get('hasDropDownValue').patchValue(event.value === 3);
    field.get('fieldValue').reset();
    this.disableFieldDropdownValues();
  }

  disableFieldDropdownValues(){
    this.fieldList.data.map(x => x.inactive = false);
    this.fieldConfig(this.actionIndex).value.forEach((value) => {
      const i = this.fieldList.data.findIndex( x => x.id === value.fieldId);
      if (i >= 0){
        this.fieldList.data[i].inactive = true;
      }
    });
  }

  /**
   * This service use for get field list
   */
  getFieldList() {
    const documentTypeId = ((this.isEdit || this.isDetailView) && !this.automationMstDto.setFieldValueDataPatched) ? this.automationMstDto.documentType :
      this.automationForm.get('documentType').value;
    const obj = new CommonAutomationFieldCompatibilityDto();
    obj.documentTypeId = documentTypeId;
    obj.eventIdList = this.automationForm.get('documentEvents').value;

    if (documentTypeId) {
      this.automationService.getActionEnableFieldList(obj).subscribe((res: any) => {
        this.fieldList.data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * This method fire in field change in condition
   * @param id number
   * @param formGroup from group
   * @param index
   */
  onFieldChanged(id: any, formGroup, index) {
    this.getFieldSpec(id, formGroup, index);
  }

  /**
   * This method set field specific data
   * @param id number
   * @param condition form group
   * @param index number
   */
  getFieldSpec(id: any, condition: AbstractControl, index) {
    if (id) {
      this.automationService.getAutomationFieldSpec(id).subscribe(async (res: any) => {
        condition.get('hasDropDownValue').patchValue(res.body.dropDown);
        condition.get('dataType').patchValue(res.body.dataType);
        condition.get('maxLength').patchValue(res.body.maxLength);

        const fieldValue = condition.get('fieldValue')?.value;

        if (res.body.dropDown) {
          await this.loadDropDownData(res, condition, index);
          if (this.isEdit || this.isDetailView) {
            condition.get('fieldValue').patchValue(isNaN(fieldValue) ? fieldValue : Number(fieldValue));
          }
        }

        this.disableFieldDropdownValues();

        if (res.body.dataType === this.appConstant.FIELD_DATE_TYPE_DATE && fieldValue) {
          let date = condition.get('fieldValue')?.value.split('T')[0];
          const dateArr = date.split('-');
          date = `${dateArr[1]}/${dateArr[2]}/${dateArr[0]}`;
          condition.get('fieldValue')?.patchValue(date);
        }


      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method user for load field drop down data
   * @param fieldSpecRes data
   * @param condition AbstractControl
   * @param index number
   */
  loadDropDownData(fieldSpecRes, condition: AbstractControl, index) {
    return new Promise(resolve => {
      if (fieldSpecRes.body.options) {
        this.fieldValueList[index].data = fieldSpecRes.body.options;
      }

      if (fieldSpecRes.body.endpointUrl) {
        this.automationService.getDropDownData(fieldSpecRes.body.endpointUrl, !this.isEdit).subscribe((res: any) => {
          this.fieldValueList[index].data = res.body;
          resolve(true);
        }, error => {
          this.notificationService.errorMessage(error);
          resolve(true);
        });
      }
    });
  }

  checkBillApprovalFieldValueIsApproved(field: AbstractControl) {
    const documentTypeId = (this.isDetailView && this.isEdit) ? this.automationMstDto.documentType
      : this.automationForm.get('documentType').value;

    const fieldId = field.get('fieldId').value;
    const value = field.get('fieldValue').value;

    const hasDistributionInfo = (documentTypeId === AppDocumentType.BILL && fieldId === AppAutomationField.BILL_APPROVED_OPTION_ID
      && value === AppConstant.STATUS_APPROVED);

    if (hasDistributionInfo) {
      this.addExpenseCostDistribution();
      this.addItemCostDistribution();
      field.get('hasDistributionInfo').patchValue(hasDistributionInfo);
    }
  }


  addExpenseCostDistribution() {
    const expenseInfo = this.formBuilder.group({
      accountId: [null],
      accountName: [null],
      description: [null],
      projectId: [null]
    });

    const fieldValueIndex = this.fieldConfig(this.actionIndex).length;
    this.getExpenseCostDistributionForm(this.actionIndex, fieldValueIndex - 1).push(expenseInfo);
  }

  addItemCostDistribution() {
    const itemForm = this.formBuilder.group({
      itemId: [null],
      itemName: [null],
      description: [null],
      projectId: [null]
    });

    const fieldValueIndex = this.fieldConfig(this.actionIndex).length;
    this.getItemCostDistributionForm(this.actionIndex, fieldValueIndex - 1).push(itemForm);
  }


  changeList(component: string, event, index: any, controller: AbstractControl) {

    if (component === 'ACCOUNT' && event.value === 0) {
      controller.get('accountId').reset();
      this.isAddNewAccount = true;
      this.isAddNewItem = false;
      this.isAddNewProjectCodes = false;
    }
    if (component === 'ITEM' && event.value === 0) {
      controller.get('itemId').reset();
      this.isAddNewAccount = false;
      this.isAddNewItem = true;
      this.isAddNewProjectCodes = false;
    }
    if (component === 'PROJECT_CODE' && event.value === 0) {
      controller.get('projectId').reset();
      this.isAddNewAccount = false;
      this.isAddNewItem = false;
      this.isAddNewProjectCodes = true;
    }
  }

  /**
   * this method can be used to get account name
   * @param event
   * @param index
   * @param controller
   */
  getAccountName(event, index: any, controller: AbstractControl) {

    if (!event.value) {
      controller.get('accountName').reset();
      return;
    }

    this.automationService.getAccountName(event.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        controller.get('accountName').patchValue(res.body.name);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to get account name
   * @param event
   * @param index
   * @param controller
   */
  getItemName(event: any, index: any, controller: AbstractControl) {

    if (!event.value) {
      controller.get('itemName').reset();
      controller.get('rate').reset();
      return;
    }

    this.automationService.getItemInfo(event.value).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        controller.get('itemName').patchValue(res.body.name);
        controller.get('rate').patchValue(res.body.salesPrice);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });

  }

  /**
   * This method use for calculate item cost distribution line item total
   * @param controller AbstractControl
   */
  calculateItemCostDistribution(controller: AbstractControl) {
    const qty = (!controller.get('qty').value) ? 0.00 : controller.get('qty').value;
    const rate = (!controller.get('rate').value) ? 0.00 : controller.get('rate').value;
    controller.get('amount').patchValue(qty * rate);
  }


  /**
   * get account list
   * @param listInstance to dropdown dto
   */
  getAccounts(listInstance: DropdownDto) {
    this.billsService.getAccountList(!this.isEdit).subscribe((res: any) => {
      listInstance.data = res.body;
      listInstance.addNew();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get project code list
   * @param listInstance to dropdown instance
   */
  getProjectTaskList(listInstance: DropdownDto) {
    this.billsService.getProjectTask(AppConstant.PROJECT_CODE_CATEGORY_ID, !this.isEdit).subscribe((res: any) => {
      listInstance.data = res.body;
      listInstance.addNew();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * get item list
   * @param listInstance to dropdown instance
   */

  getItems(listInstance: DropdownDto) {
    this.billsService.getItems().subscribe((res: any) => {
      listInstance.data = res.body;
      listInstance.addNew();
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * This method use for add new field value
   */
  addExistFieldValueConfigurations() {

    const fieldConfig: CommonAutomationFieldConfigDto[] = this.automationMstDto.automationActions[this.actionIndex]?.fieldConfig;
    // this.automationForm.get('documentType').patchValue(this.automationMstDto.documentType);
    if (fieldConfig && fieldConfig.length !== 0) {
      fieldConfig?.forEach((value, index) => {
        this.addFieldValueFormControllerWithData(value);
      });
      return;
    }

    if (!this.automationMstDto.automationActions[this.actionIndex] || this.isEdit) {
      this.addFieldValueFormController();
      return;
    }
  }


  /**
   * This method use for reset field value form array
   */
  resetFieldValues() {
    while (this.fieldConfig(this.actionIndex).length !== 0) {
      this.fieldConfig(this.actionIndex).removeAt(0);
      this.disableFieldDropdownValues();
    }
  }

  ngOnInit(): void {

    this.getFieldList();
    // this.getAccounts(this.accountList);
    // this.getProjectTaskList(this.projectCodeList);
    // this.getItems(this.itemList);


    if (this.isEdit || this.isDetailView) {
      console.log(this.automationMstDto.setFieldValueDataPatched)
      if (!this.automationMstDto.setFieldValueDataPatched){
        this.addExistFieldValueConfigurations();
        this.automationMstDto.setFieldValueDataPatched = true;
      } else {
        this.addFieldValueFormController();
      }
    } else {
      this.addFieldValueFormController();
    }
  }


  getMessageForSelectedField(id) {
    const message = this.fieldList.data.find(x => x.id === id)?.messageAndUnsupportedEventList;
    return message ? message : null;
  }


}
