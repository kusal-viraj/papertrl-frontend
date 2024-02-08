import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppAdditionalFieldValidation} from '../../../shared/enums/app-additional-field-validation';
import {AdditionalFieldUtility} from '../additional-field-utility';
import {
  AdditionalFieldDropdownDatasourceComponent
} from '../additional-field-dropdown-datasource/additional-field-dropdown-datasource.component';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {Dropdown} from 'primeng/dropdown';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {AppActionLabel} from '../../../shared/enums/app-action-label';
import {AppIcons} from '../../../shared/enums/app-icons';
import {ConfirmationService, LazyLoadEvent} from 'primeng/api';
import {AdditionalFieldEditComponent} from '../additional-field-edit/additional-field-edit.component';
import {AdditionalFieldTableDto} from '../../../shared/dto/additional-field/additional-field-table-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {Table} from 'primeng/table';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppModuleSection} from '../../../shared/enums/app-module-section';

@Component({
  selector: 'app-additional-field-base',
  template: 'N/A',
})
export class AdditionalFieldBaseComponent {

  public additionalFieldForm: UntypedFormGroup;

  public fieldProperty = AppAdditionalFieldValidation;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public additionalFieldUtility: AdditionalFieldUtility = new AdditionalFieldUtility(this.automationService, this.additionalFieldService);

  public isFieldNameLengthExceeds: boolean;
  public isMaxlengthZero: boolean;
  public isMaxlengthExceeds: boolean;
  public isDisplayOrderZero: boolean;
  public isDisplayOrderMaxValue: boolean;
  public isRowCountZero: boolean;
  public isRowCountExceeds: boolean;
  public isProgressCreateEvent = false;
  public isProgressUpdateEvent = false;

  public additionalFieldProperties: number[] = [];

  public fieldType: string;
  public moduleId: number;

  public tableSupportBase = new TableSupportBase();
  public tableShow = false;
  public activeAction: any;
  public selectedDocumentType: any;
  public appConstant = new AppConstant();
  @Output() afterSuccess = new EventEmitter<boolean>();
  @Output() closeAdditionalFieldEditMode = new EventEmitter<boolean>();


  @ViewChild('dt')
  public table: Table;

  public dataSourceSelection = false;
  @Input() editView = false;
  public isOptionAvailability = false;

  public dataSourceDrawer = false;

  public removedOptions = [];


  @ViewChild('additionalFieldEditComponent')
  public additionalFieldEditComponent: AdditionalFieldEditComponent;

  @ViewChild('additionalFieldDropdownDatasourceComponent')
  public additionalFieldDropdownDatasourceComponent: AdditionalFieldDropdownDatasourceComponent;
  public isViewEditMode: boolean;
  public additionalFieldId: number;
  public isSelectAll: boolean;
  openEditView = false;
  public isAllowedToMarkFieldShowOnReport = false;
  public documentTypes: any [] = [];
  public isCheckedShowOnPOReport = false;
  public printLandscape = false;

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService,
              public additionalFieldService: AdditionalFieldService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public confirmationService: ConfirmationService) {

    this.additionalFieldForm = this.formBuilder.group({
      id: [null],
      moduleId: [null],
      documentRelation: [null],
      fieldTypeId: [null, Validators.required],
      fieldTypeName: [null],
      fieldName: [null, Validators.required],
      required: [false],
      maxLength: [null, Validators.required],
      displayOrder: [null, Validators.required],
      dataType: [null, Validators.required],
      dataSourceId: [null, !this.editView ? Validators.required : null],
      dropdownProperty: [null, Validators.required],
      createNew: ['I'],
      multiple: ['I'],
      rowCount: [null, Validators.required],
      value: [null, Validators.required],
      fileTypes: [null, Validators.required],
      appearOnReport: [null],
      appearOnExport: [true],
      headerAppearOnReport: [null],
      options: this.formBuilder.array([])
    });
    this.tableSupportBase.tableActionList = [
      {
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        status: AppEnumConstants.STATUS_INACTIVE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ADDITIONAL_FIELDS_ACTIVATE),
        command: () => {
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        status: AppEnumConstants.STATUS_ACTIVE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ADDITIONAL_FIELDS_INACTIVATE),
        command: () => {
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_EDIT,
        status: AppEnumConstants.STATUS_COMMON,
        icon: AppIcons.ICON_EDIT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ADDITIONAL_FIELDS_EDIT),
        command: () => {
          this.isViewEditMode = true;
          const id = this.activeAction.id;
        }
      },
      {
        label: AppActionLabel.ACTION_LABEL_DELETE,
        status: AppEnumConstants.STATUS_COMMON,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.ADDITIONAL_FIELDS_DELETE),
        command: () => {
          this.additionalFieldService.removeAdditionalField(this.activeAction.id).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.ADDITIONAL_FIELD_DELETED_SUCCESSFULLY);
              this.getTableData();
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.infoMessage(error);
          });
        }
      }
    ];
  }

  showExportCheck() {
    /**
     * Bill
     * Purchase Order
     * Purchase Order Receipt
     * Expense Report
     */
    const exportDocuments = [1, 2, 3, 4, 8];

    // If there are no selected field types return false
    if (!this.additionalFieldForm.get('fieldTypeId').value) {
      return false;
    }

    // Return false if field type is file input
    if (this.additionalFieldForm.get('fieldTypeId').value === 6) {
      return false;
    }

    // Check whether the documents support for export
    for (const item of exportDocuments) {
      if (this.additionalFieldForm.get('documentRelation').value?.map(x => x.moduleId).includes(item)) {
        return true;
      }
    }
  }

  /**
   *  This method can be used to return all additionalFieldForm controllers
   */
  public get f1() {
    return this.additionalFieldForm.controls;
  }


  /**
   * This method use for handle datasource changed events
   * @param event any
   */
  changedDatasourceSelection(event: any) {
    if (event.value === 0) {
      this.dataSourceSelection = true;
      this.dataSourceDrawer = true;
      this.openEditView = false;
      setTimeout(() => {
        this.f1.dataSourceId.reset();
      }, 100);
      // this.dataOption.controls = [];
      this.additionalFieldUtility.getDropdownPropertyList();
    }
    if (event.value === null) {
      this.addOptions();
      this.additionalFieldUtility.getDropdownPropertyList();
    } else {

      let isPreDefinedDataSource = false;
      for (const datasource of this.additionalFieldUtility.dataSources) {
        if (datasource.id === event.value) {
          if (datasource.otherData === 1) {
            isPreDefinedDataSource = true;
            break;
          }
        }
      }


      if (isPreDefinedDataSource) {
        let index = -1;
        let i = 0;
        for (const datasource of this.additionalFieldUtility.dropdownProperties) {
          if (datasource.id === this.appConstant.ADDITIONAL_FIELD_DROP_DOWN_PROPERTY_ADD_NEW) {
            index = i;
            break;
          }
          i++;
        }
        if (index > -1) {
          this.additionalFieldUtility.dropdownProperties.splice(index, 1);
        }
      } else {
        this.additionalFieldUtility.getDropdownPropertyList();
      }
    }


  }

  /**
   * Set Multiple and Create New
   */
  changeDropDownProperty(e: any) {
    this.additionalFieldForm.get('multiple').setValue('I');
    this.additionalFieldForm.get('createNew').setValue('I');
    if (e.value.length === 2) {
      this.additionalFieldForm.get('multiple').setValue('A');
      this.additionalFieldForm.get('createNew').setValue('A');
    } else {
      if (e.value[0] === this.appConstant.ADDITIONAL_FIELD_DROP_DOWN_PROPERTY_MULTIPLE) {
        this.additionalFieldForm.get('multiple').setValue('A');
      } else if (e.value[0] === this.appConstant.ADDITIONAL_FIELD_DROP_DOWN_PROPERTY_ADD_NEW) {
        this.additionalFieldForm.get('createNew').setValue('A');
      }
    }
    this.validateOptionsAccordingToChangeDropDownProperty();
  }

  /**
   * this method can be used to validate option
   */
  validateOptionsAccordingToChangeDropDownProperty() {
    this.dataOption.controls.forEach((value, i) => {
      const multipleControllerValue = this.additionalFieldForm.get(this.appConstant.MULTIPLE).value;
      const createNewControllerValue = this.additionalFieldForm.get(this.appConstant.CREATE_NEW).value;
      const isMultiple: boolean = (multipleControllerValue === this.appConstant.ACTIVE);
      const isCreateNew: boolean = (createNewControllerValue === this.appConstant.ACTIVE);
      if (isMultiple || (!isCreateNew && !isMultiple)) {
        value.get(this.appConstant.OPTION_VALUE).setValidators(Validators.required);
        value.get(this.appConstant.OPTION_VALUE).updateValueAndValidity();
      }

      if (isCreateNew) {
        value.get(this.appConstant.OPTION_VALUE).clearValidators();
        value.get(this.appConstant.OPTION_VALUE).updateValueAndValidity();
      }
      if (isCreateNew && isMultiple) {
        value.get(this.appConstant.OPTION_VALUE).clearValidators();
        value.get(this.appConstant.OPTION_VALUE).updateValueAndValidity();
      }
    });
  }

  /**
   * This method can be used to view additional fields property
   * @param event dropdown object
   * @param dropdown
   */
  viewFieldTypeProperty(event, dropdown: Dropdown) {
    this.validatePOReportField(this.documentTypes);
    if (event.value) {
      this.fieldType = dropdown.selectedOption.name;
      this.additionalFieldForm.get('fieldTypeName').setValue(dropdown.selectedOption.name);

      this.additionalFieldService.getAdditionalFieldProperties(event.value).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.resetOption();
          this.additionalFieldProperties = res.body;
          this.checkValidationFieldTypeProperties();
          this.addOptions();
        } else {

        }
      }, error => {

      });

    } else {
      this.fieldType = AppEnumConstants.LABEL_EMPTY_STRING;
      this.additionalFieldProperties = [];

      this.resetOption();
    }

  }

  /**
   * This method can be used to check available fields of current field type id
   */
  isAvailableValidations(VALIDATION: AppAdditionalFieldValidation) {
    if (VALIDATION === this.fieldProperty.VALIDATION_OPTION && this.additionalFieldForm.get('dataSourceId').value) {
      this.resetOption();
      return false;
    }
    return this.additionalFieldProperties.includes(VALIDATION);
  }

  /**
   * This method use for maxLength
   */
  checkMaxLength() {

    if (this.f1.fieldName.value || this.f1.fieldName.value === 0) {
      this.isFieldNameLengthExceeds = this.f1.fieldName.value.length > 20;
    }

    if (this.f1.maxLength.value || this.f1.maxLength.value === 0) {
      this.isMaxlengthZero = this.f1.maxLength.value < 1;
      this.isMaxlengthExceeds = this.f1.maxLength.value > 300;
    }

    if (this.f1.displayOrder.value || this.f1.displayOrder.value === 0) {
      this.isDisplayOrderZero = this.f1.displayOrder.value < 1;
      this.isDisplayOrderMaxValue = this.f1.displayOrder.value > 50;
    }

    if (this.f1.rowCount.value || this.f1.rowCount.value === 0) {
      this.isRowCountZero = this.f1.rowCount.value < 1;
      this.isRowCountExceeds = this.f1.rowCount.value > 10;
    }

  }

  /**
   * This method can use for get option FormArray from controllers
   */
  public get dataOption() {
    return this.additionalFieldForm.get('options') as UntypedFormArray;
  }

  /**
   * This method use for add new form controller group for data source
   */
  addOptionFormController() {
    const dataSourceOption = this.formBuilder.group({
      optionValue: [AppEnumConstants.LABEL_EMPTY_STRING, Validators.required],
      fieldId: [AppConstant.NULL_VALUE],
      id: [AppConstant.NULL_VALUE],
    });
    this.dataOption.push(dataSourceOption);
  }

  /**
   * This method use for reset data source form array
   */
  resetOption() {
    while (this.dataOption.length !== 0) {
      this.dataOption.removeAt(0);
    }
  }

  /**
   * This method use for remove data source row
   * @param dataSourceIndex number
   * @param option
   */
  async removeOption(dataSourceIndex: number, option) {


    if (option.value.id) {
      let moduleIds: any[];
      const relations = this.additionalFieldForm.get('documentRelation').value;

      if (relations) {
        moduleIds = relations.map(function (x) {
          return (x.moduleId)
        });
        moduleIds = [...new Set(moduleIds)];
      } else {
        moduleIds = [];
      }

      await this.additionalFieldService.isOptionUsed(moduleIds, option.value.fieldId, option.value.id).then((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS == res.status) {
          if (!res.body) {
            this.removedOptions.push(option.value);
            this.dataOption.removeAt(dataSourceIndex);
            return;
          } else {
            this.notificationService.infoMessage(HttpResponseMessage.OPTION_USED);
          }
        }
      });
    } else {
      this.dataOption.removeAt(dataSourceIndex);
    }

  }

  /**
   * This method use for add options to form array
   */
  addOptions() {
    if (this.isAvailableValidations(AppAdditionalFieldValidation.VALIDATION_OPTION)) {
      this.addOptionFormController();
    }
  }

  /**
   * Check document multiselect event change and show/hide table
   * @param e multiselect value
   */
  documentTypeChanged(e) {
    this.documentTypes = e.value;
    if (this.isCheckedShowOnPOReport) {
      this.checkAdditionalFieldCountOnPOReport();
    }
    this.validatePOReportField(e.value);
    if (e.value) {

      // Filter only module id from object
      this.selectedDocumentType = e.value.map(function (x) {
        return (x.moduleId);
      });
      // Remove duplicates
      this.selectedDocumentType = [...new Set(this.selectedDocumentType)];
      if (this.tableShow) {
        this.getTableData();
      }
      this.tableShow = true;
    } else {
      this.tableShow = false;
    }
  }

  /**
   * Get Table Data According to Document type
   */
  getTableData() {
    this.additionalFieldService.getDocumentTypeTableData(this.selectedDocumentType, this.tableSupportBase.searchFilterDto)
      .subscribe((res: any) => {
        this.tableSupportBase.dataSource = res.body.data;
        this.tableSupportBase.totalRecords = res.body.totalRecords;
        if (this.tableSupportBase.totalRecords === 0) {
          this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('{first}', '0');
        } else {
          this.table.currentPageReportTemplate = this.table.currentPageReportTemplate.replace('0', '{first}');
        }
        this.tableSupportBase.loading = false;
      });
  }

  /**
   * Load Data list on Initial
   * @param event table lazy event
   */
  loadData(event: LazyLoadEvent) {
    this.tableSupportBase.searchFilterDto = event;
    this.getTableData();
  }

  /**
   * Set Values when action button clicked
   * @param val object
   */
  actionButtonClick(val: AdditionalFieldTableDto) {
    this.activeAction = val;
    this.additionalFieldId = val.id;
  }

  /**
   * This method can be used to set , clear, reset , update validation in additional field form
   * @param event to get form control name
   */
  public checkValidationFieldTypeProperties() {
    const fieldName = this.additionalFieldForm.get('fieldName');
    const maxLength = this.additionalFieldForm.get('maxLength');
    const displayOrder = this.additionalFieldForm.get('displayOrder');
    const dataType = this.additionalFieldForm.get('dataType');
    const dataSourceId = this.additionalFieldForm.get('dataSourceId');
    const fileType = this.additionalFieldForm.get('fileTypes');
    const rowCount = this.additionalFieldForm.get('rowCount');
    const value = this.additionalFieldForm.get('value');
    const dropdownProperty = this.additionalFieldForm.get('dropdownProperty');
    const required = this.additionalFieldForm.get('required');

    fieldName.clearValidators();
    maxLength.clearValidators();
    displayOrder.clearValidators();
    dataType.clearValidators();
    fileType.clearValidators();
    rowCount.clearValidators();
    value.clearValidators();
    dataSourceId.clearValidators();
    dropdownProperty.clearValidators();
    required.clearValidators();

    fieldName.reset();
    maxLength.reset();
    displayOrder.reset();
    dataType.reset();
    fileType.reset();
    rowCount.reset();
    value.reset();
    dataSourceId.reset();
    dropdownProperty.reset();
    required.reset();

    this.isRowCountZero = false;
    this.isDisplayOrderZero = false;
    this.isMaxlengthZero = false;
    this.isMaxlengthExceeds = false;
    this.isRowCountExceeds = false;

    if (this.isAvailableValidations(this.fieldProperty.VALIDATION_NAME)) {
      fieldName.setValidators(Validators.required);
    }
    if (this.isAvailableValidations(this.fieldProperty.VALIDATION_MAX_LENGTH)) {
      maxLength.setValidators(Validators.required);
    }
    if (this.isAvailableValidations(this.fieldProperty.VALIDATION_DISPLAY_ORDER)) {
      displayOrder.setValidators(Validators.required);
    }
    if (this.isAvailableValidations(this.fieldProperty.VALIDATION_DATA_TYPE)) {
      dataType.setValidators(Validators.required);
    }
    if (this.isAvailableValidations(this.fieldProperty.VALIDATIONS_ACCEPT)) {
      fileType.setValidators(Validators.required);
    }
    if (this.isAvailableValidations(this.fieldProperty.VALIDATIONS_ROWS)) {
      rowCount.setValidators(Validators.required);
    }
    if (this.isAvailableValidations(this.fieldProperty.VALIDATIONS_VALUE)) {
      value.setValidators(Validators.required);
    }
    if (this.isAvailableValidations(this.fieldProperty.VALIDATION_DATA_SOURCE) && !this.editView) {
      dataSourceId.setValidators(Validators.required);
    }
    // if (this.isAvailableValidations(this.fieldProperty.VALIDATION_MULTIPLE_CREATE_NEW)) {
    //   dropdownProperty.setValidators(Validators.required);
    // }
    // if (this.isAvailableValidations(this.fieldProperty.VALIDATION_REQUIRED)) {
    //   required.setValidators(Validators.required);
    // }


    fieldName.updateValueAndValidity();
    displayOrder.updateValueAndValidity();
    maxLength.updateValueAndValidity();
    rowCount.updateValueAndValidity();
    fileType.updateValueAndValidity();
    dataType.updateValueAndValidity();
    value.updateValueAndValidity();
    dataSourceId.updateValueAndValidity();
    dropdownProperty.updateValueAndValidity();
    required.updateValueAndValidity();
  }

  /**
   * This method use for create additional Field
   */
  additionalFieldSubmit(isCreate: boolean) {
    if (this.additionalFieldForm.invalid || this.isFieldNameLengthExceeds
      || this.isMaxlengthZero || this.isMaxlengthExceeds || this.isDisplayOrderZero
      || this.isRowCountZero || this.isRowCountExceeds || this.isDisplayOrderMaxValue) {
      this.isProgressCreateEvent = false;
      this.isProgressUpdateEvent = false;
      new CommonUtility().validateForm(this.additionalFieldForm);
    } else if (!this.isOptionAvailability) {
      const additionalFieldDetailDto: AdditionalFieldDetailDto = this.additionalFieldForm.value;
      if (additionalFieldDetailDto.fileTypes) {
        additionalFieldDetailDto.fileTypes = additionalFieldDetailDto.fileTypes.toString();
      }

      if (this.isAllowedToMarkFieldShowOnReport) {
        const updatedDocumentTypes: any [] = this.additionalFieldForm.get('documentRelation').value;
        updatedDocumentTypes.forEach(value => {
          if (value.moduleId === 2) {
            value.appearOnReport = this.additionalFieldForm.get('appearOnReport').value;
            value.headerAppearOnReport = this.additionalFieldForm.get('headerAppearOnReport').value;
          } else {
            value.appearOnReport = null;
            value.headerAppearOnReport = null;
            value.headerAppearOnReport = null;
          }
        });
      }

      if (isCreate) {
        this.isProgressCreateEvent = true;
        this.additionalFieldService.createAdditionalFields(additionalFieldDetailDto).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
            this.notificationService.successMessage(HttpResponseMessage.ADDITIONAL_FIELD_CREATED_SUCCESSFULLY);
            this.isProgressCreateEvent = false;
            this.afterSuccess.emit();
            this.getTableData();
            this.reset();
          } else {
            this.isProgressCreateEvent = false;
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.isProgressCreateEvent = false;
          this.notificationService.errorMessage(error);
        });

      } else {
        this.isProgressUpdateEvent = true;
        additionalFieldDetailDto.removedOptions = this.removedOptions;
        this.additionalFieldService.editAdditionalFields(additionalFieldDetailDto).subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            this.notificationService.successMessage(HttpResponseMessage.ADDITIONAL_FIELD_UPDATED_SUCCESSFULLY);
            this.isProgressUpdateEvent = false;
            this.closeAdditionalFieldEditMode.emit(false);
            this.afterSuccess.emit();
            this.reset();
          } else {
            this.isProgressUpdateEvent = false;
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.isProgressUpdateEvent = false;
          this.notificationService.errorMessage(error);
        });

      }


    }

  }

  /**
   * This method use for reset additional field
   */
  reset() {
    this.printLandscape = false;
    this.resetOption();
    this.additionalFieldForm.reset();
    this.isAllowedToMarkFieldShowOnReport = false;
    this.additionalFieldProperties = [];
    this.documentTypeChanged([]);
    this.additionalFieldForm.get('appearOnExport').patchValue(true);
    this.isFieldNameLengthExceeds = false;
    this.isMaxlengthZero = false;
    this.isMaxlengthExceeds = false;
    this.isDisplayOrderZero = false;
    this.isRowCountZero = false;
    this.isRowCountExceeds = false;
    this.isDisplayOrderMaxValue = false;
    this.additionalFieldId = undefined;
  }

  checkOptionAvailability(option: AbstractControl, controls: AbstractControl[], optionIndex: number) {
    for (let i = 0; controls.length > i; i++) {
      if (controls[i].value.optionValue === option.value.optionValue && i !== optionIndex) {
        this.isOptionAvailability = true;
        return true;
      }
    }
    this.isOptionAvailability = false;
  }

  closeModal() {
    this.dataSourceDrawer = false;
    this.additionalFieldUtility.getDataSourceList();
    this.openEditView = false;
  }

  /**
   * This method can be used to validate fields show in po report
   */
  validatePOReportField(selectedDocumentTypes: any[]) {
    this.isAllowedToMarkFieldShowOnReport = false;
    if (selectedDocumentTypes.length === AppConstant.ZERO) {
      this.isAllowedToMarkFieldShowOnReport = false;
      return;
    }
    if (selectedDocumentTypes.length <= 3 &&
      (selectedDocumentTypes.length === selectedDocumentTypes.filter(x => x.moduleId === 2).length) &&
      this.additionalFieldForm.get('fieldTypeId').value) {
      this.isAllowedToMarkFieldShowOnReport = true;
    } else {
      this.isAllowedToMarkFieldShowOnReport = false;
    }
  }

  /**
   * this method can be used to validate po report line level additional field count
   */
  checkAdditionalFieldCountOnPOReport() {
    this.validateReportLabelLength();
    this.isCheckedShowOnPOReport = this.additionalFieldForm.get('appearOnReport').value;
    const sectionIds: any = [];
    let allowedTOCall = false;
    let selectedLineLevel = false;

    this.documentTypes.forEach(documentType => {
      selectedLineLevel = (documentType.sectionId === AppModuleSection.LINE_ITEM_SECTION_ID) ||
        (documentType.sectionId === AppModuleSection.PURCHASING_ACCOUNT_INFO);
    });

    if (selectedLineLevel) {
      sectionIds.push(AppModuleSection.LINE_ITEM_SECTION_ID);
      sectionIds.push(AppModuleSection.PURCHASING_ACCOUNT_INFO);
    }

    const length = this.documentTypes.filter(x => x.moduleId === AppConstant.TWO).length;
    allowedTOCall =
      (length === this.documentTypes.length) &&
      sectionIds.length > AppConstant.ZERO;

    if (!allowedTOCall) {
      return;
    }
    if (this.isCheckedShowOnPOReport) {
      this.additionalFieldService.validateAdditionalFieldCount(AppDocumentType.PURCHASE_ORDER, sectionIds)
        .subscribe((res: any) => {
          if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
            if (Number(res.body.message) === 3) {
              this.getConfirmationToCreateAdditionalField();
            }
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * this method get confirmation to print po report according to the field count
   */
  getConfirmationToCreateAdditionalField() {
    if (this.printLandscape) {
      return;
    }
    this.confirmationService.confirm({
      key: 'additionalFieldCreate',
      message: HttpResponseMessage.PO_REPORT_ORIENTATION_MODE_ACCORDING_TO_FIELD_COUNT,
      accept: () => {
        this.printLandscape = true;
      },
      reject: () => {
        this.additionalFieldForm.get('appearOnReport').patchValue(false);
        this.isCheckedShowOnPOReport = false;
        this.validateReportLabelLength();
      },
    });
  }

  /**
   * this method can be used to validate label length validation
   */
  validateReportLabelLength() {
    if (this.additionalFieldForm.get('appearOnReport').value === true) {
      this.additionalFieldForm.get('headerAppearOnReport').setValidators(Validators.compose([Validators.required, Validators.maxLength(6)]));
    } else {
      this.additionalFieldForm.get('headerAppearOnReport').reset();
      this.additionalFieldForm.get('headerAppearOnReport').clearValidators();
    }
    this.additionalFieldForm.get('headerAppearOnReport').updateValueAndValidity();
  }
}
