import {
  AbstractControl,
  FormArray,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {DropdownDto} from '../dto/common/dropDown/dropdown-dto';
import {AppConstant} from './app-constant';
import {BillMasterDto} from '../dto/bill/bill-master-dto';
import {AdditionalFieldDetailDto} from '../dto/additional-field/additional-field-detail-dto';
import {AppModuleSection} from '../enums/app-module-section';
import {PatternValidator} from '../helpers/pattern-validator';
import {AppFieldType} from '../enums/app-field-type';
import {AppEnumConstants} from '../enums/app-enum-constants';
import {ActivatedRoute, NavigationEnd, Router, RouterState} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {Dropdown} from 'primeng/dropdown';
import {AppDocumentType} from '../enums/app-document-type';
import {AppFormConstants} from '../enums/app-form-constants';
import _ from 'lodash';

declare let gtag: Function;

export class CommonUtility {


  constructor() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.isNotVendor = !user.vendorId;
    }
  }

  public isNotVendor = true;
  public appFieldType = AppFieldType;
  public isInvalidPayment = false;
  public isSelectedVirtualCardACHCheck = false;
  public isSelectedACH = false;
  public isSelectedACHCheck = false;
  public isConfirmation = false;
  public sectionName: any;
  public formGroup: FormGroup;
  public codeId: any;
  public isProjectCodeAvailable: any;
  public isDepartmentAvailable: any;
  private isValue: string;
  public projectCodeChanges: any[] = [];
  public departmentChanges: any[] = [];
  public twoConfirmationPopup = false;

  getToday(): Date {
    const date = new Date();
    const today = new Date();
    date.setDate(today.getDate());
    return date;
  }

  validateForm(formGroup: UntypedFormGroup) {

    const controls = formGroup.controls;

    for (const key in controls) {
      if (controls[key] instanceof UntypedFormControl) {
        this.markFormControllerAsDirty(controls, key);
      } else {
        this.validateForm(controls[key] as UntypedFormGroup);
      }

    }
  }

  markFormControllerAsDirty(controller, key: string) {
    if (controller[key].invalid) {
      controller[key].markAsDirty();
    }
    if (AppConstant.PHONE_NO_REQUIRED_CONTROLS.includes(key)) {
      controller[key].markAsTouched();
    }
  }

  readOnlyForm(formGroup: UntypedFormGroup) {
    const controls = formGroup.controls;
    for (const key in controls) {
      if (controls[key] instanceof UntypedFormControl) {
        this.markFormControllerAsReadOnly(controls, key);
      } else {
        this.readOnlyForm(controls[key] as UntypedFormGroup);
      }
    }
  }

  markFormControllerAsReadOnly(controller, key: string) {
    if (key !== 'notifiedUsers') {
      controller[key].disable(true);
    }
  }

  isValidValue(control: AbstractControl) {
    if (0 === control.value) {
      control.setValue(undefined);
    }
    if (isNaN(control.value)) {
      control.setValue(undefined);
    }
  }

  /**
   * This method use to generate form data for any kind of dto
   */

  public appendFormData(formData: FormData, parentKey: string, obj: any) {
    if (obj !== undefined && obj !== null && obj !== AppConstant.EMPTY_STRING) {
      if (typeof obj === 'object') {
        if ((obj instanceof DropdownDto)) {

        } else if ((obj instanceof Date)) {
          formData.append(parentKey, obj + AppConstant.EMPTY_STRING);
        } else if ((obj instanceof File)) {
          formData.append(parentKey, obj);
        } else if ((obj instanceof Array)) {
          if (obj.length > 0) {
            for (let i = 0; i < obj.length; i++) {
              this.appendFormData(formData, parentKey + '[' + i + ']', obj[i]);
            }
          }
        } else {
          for (const key in obj) {
            this.appendFormData(formData, parentKey + AppConstant.DOT_STRING + key, obj[key]);
          }
        }

      } else if (!(typeof obj === 'function')) {
        formData.append(parentKey, obj + AppConstant.EMPTY_STRING);
      }
    }
  }

  /**
   * Method used to edit the default regex pattern to pKeyFilter to block uer inputs
   * @param pattern Regex Pattern
   */
  public buildRegex(pattern) {
    const a = pattern.split('');
    if (a.length > 2) {
      if (a[a.length - 1] === '*') {
        a.splice(a.length - 1, 1);
      }
    }
    const s = a.join('');
    return RegExp(s);
  }

  /**
   * Align Additional Fields line items to specific column
   * @param section Additional Field section on data array
   * @param additionalFields Additional Fields array section
   */
  alignLineAdditionalData(section, additionalFields) {
    if (!section) {
      return;
    }
    if (!additionalFields) {
      return;
    }

    section.forEach(row => {
      const arr = [];
      additionalFields.forEach((field, index) => {
        row.additionalData.forEach(data => {
          if ((field.id === data.fieldId)) {
            arr[index] = (data);
          }
        });
      });
      row.additionalData = arr;
    });
  }

  /**
   * Align Additional Fields line items to specific column
   * @param section Additional Field section on data array
   * @param additionalFields Additional Fields array section
   */
  alignHeadingAdditionalData(section, additionalFields) {
    if (!section) {
      return;
    }
    if (!additionalFields) {
      return;
    }

    const arr = [];
    section.forEach((field, index) => {
      additionalFields.forEach((data) => {
        if (field.id === data.fieldId) {
          arr[index] = (data);
        } else if (!arr[index]) {
          arr[index] = new BillMasterDto().additionalData;
        }
      });
    });
    return arr;
  }


  /**
   * This method can be used to validate prefix and suffix
   * @param formGroup to form group
   */
  validatePrefixAndSuffix(formGroup) {
    const separatorValue = formGroup.get(AppConstant.SEPARATOR_SYMBOL_ID).value;
    const prefixValue = formGroup.get(AppConstant.PREFIXES).value;
    const suffixValue = formGroup.get(AppConstant.SUFFIXES).value;
    const isValidatePrefix: boolean = (prefixValue !== null && prefixValue !== AppConstant.EMPTY_STRING);
    const isValidateSuffix: boolean = (suffixValue !== null && suffixValue !== AppConstant.EMPTY_STRING);
    const isValidateSeparator: boolean = (separatorValue != null && separatorValue !== AppConstant.EMPTY_STRING);
    if (isValidateSeparator) {
      formGroup.get(AppConstant.PREFIXES).setValidators(Validators.required);
      formGroup.get(AppConstant.SUFFIXES).setValidators(Validators.required);
    }
    if (!isValidateSeparator) {
      formGroup.get(AppConstant.SUFFIXES).clearValidators();
      formGroup.get(AppConstant.SUFFIXES).updateValueAndValidity();
      formGroup.get(AppConstant.PREFIXES).clearValidators();
      formGroup.get(AppConstant.PREFIXES).updateValueAndValidity();
    }
    if (isValidateSeparator && isValidatePrefix) {
      formGroup.get(AppConstant.SUFFIXES).clearValidators();
      formGroup.get(AppConstant.SUFFIXES).updateValueAndValidity();
    }
    if (isValidateSeparator && isValidateSuffix) {
      formGroup.get(AppConstant.PREFIXES).clearValidators();
      formGroup.get(AppConstant.PREFIXES).updateValueAndValidity();
    }
  }

  /**
   * This method used to remove ',' from an amount
   * @param strAmount String amount to format
   */
  amountFormatter(strAmount: string) {
    if (!strAmount) {
      return;
    } else {
      return strAmount.replace(/,/g, AppConstant.EMPTY_STRING);
    }

  }

  /**
   * This method used to return time remaining to cancel
   * @param timeString String cancelable date
   */
  calTimeRemainingToCancel(timeString: number): number {
    if (timeString) {
      const now = new Date().getTime();
      const time = new Date(timeString).getTime();
      const timeDiff = Math.round((time) / 1000);
      return timeDiff >= 0 ? timeDiff : 0;
    } else {
      return 0;
    }
  }

  /**
   * This method use for set additional field validations
   * @param field AdditionalFieldDetailDto
   * @param detailView Detail View
   */
  getAdditionalFieldValidations(field: AdditionalFieldDetailDto, detailView: boolean): UntypedFormGroup {
    const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();
    const additionalFieldInfo = formBuilder.group({
      // fieldValue: [field.fieldTypeId === AppFieldType.RADIO_BUTTON ? field.options[0].optionValue : null],
      fieldValue: [{
        value: AppConstant.NULL_VALUE,
        disabled: detailView && !(field.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && field.multiple === 'A')
      }],
      fieldId: [AppConstant.EMPTY_STRING],
      docId: [AppConstant.EMPTY_STRING],
      attachment: [AppConstant.EMPTY_STRING],
      fieldName: [AppConstant.EMPTY_STRING],
      id: [AppConstant.EMPTY_STRING],
      displayOrder: [AppConstant.EMPTY_STRING],
      sectionId: [AppConstant.EMPTY_STRING],
      multiple: [AppConstant.EMPTY_STRING],
      docStatus: [AppConstant.EMPTY_STRING],
      fieldTypeId: [AppConstant.EMPTY_STRING],
      required: [AppConstant.EMPTY_STRING]
    });
    additionalFieldInfo.get(AppConstant.FIELD_ID).patchValue(field.id);
    additionalFieldInfo.get(AppConstant.FIELD_NAME).patchValue(field.fieldName);
    additionalFieldInfo.get(AppConstant.DISPLAY_ORDER).patchValue(field.displayOrder);
    additionalFieldInfo.get(AppConstant.SECTION_ID).patchValue(field.sectionId);
    additionalFieldInfo.get(AppConstant.FIELD_TYPE_ID).patchValue(field.fieldTypeId);
    additionalFieldInfo.get(AppConstant.MULTIPLE).patchValue(field.multiple);
    additionalFieldInfo.get(AppConstant.DOCUMENT_RELATION_ID).patchValue(field.docId);
    additionalFieldInfo.get(AppConstant.FIELD_STATUS).patchValue(field.docStatus);
    additionalFieldInfo.get(AppConstant.FIELD_REQUIRED).patchValue(field.required);
    if (field.required && field.sectionId !== AppModuleSection.LINE_ITEM_SECTION_ID &&
      field.sectionId !== AppModuleSection.ITEM_COST_DISTRIBUTION_SECTION_ID &&
      field.sectionId !== AppModuleSection.PURCHASING_ACCOUNT_INFO &&
      field.sectionId !== AppModuleSection.EXPENSE_COST_DISTRIBUTION_SECTION_ID) {
      const validators = [];
      if (field.required && field.docStatus === AppConstant.STATUS_ACTIVE) {
        validators.push(Validators.compose([Validators.required]));
      }
      if (field.dataType) {
        const pattern = new RegExp(field.dataType);
        validators.push(Validators.compose([PatternValidator.patternValidator(pattern, {isValidate: true})]));
      }
      additionalFieldInfo.get(AppConstant.FIELD_VALUE).setValidators(validators);
      additionalFieldInfo.get(AppConstant.ATTACHMENT).setValidators(validators);
    }
    if (field.fieldTypeId === AppFieldType.LABEL && field.value !== null && field.docStatus === AppConstant.STATUS_ACTIVE && !detailView) {
      additionalFieldInfo.get(AppConstant.FIELD_VALUE).patchValue(field.value);
    }
    return additionalFieldInfo;

  }


  /**
   * Add dropdown options and add new function in create and edit
   * @param field
   * @param detailView
   */
  public manageDropDownData(field: AdditionalFieldDetailDto, detailView: boolean) {
    if (field.fieldTypeId === AppFieldType.DROP_DOWN_FIELD) {
      field.optionsList = new DropdownDto();

      if (field.options) {
        field.options.forEach((value: any) => {
          if (value.optionValue !== undefined && value.optionValue != null && value.optionValue !== AppConstant.EMPTY_STRING) {
            field.optionsList.data.push({id: value.id, name: value.optionValue, inactive: detailView ? true : value.inactive});
          }
        });
      }
    }
  }

  /**
   * Format multiselect header section values to strings
   */
  formatMultisetValues(array) {
    array.forEach(value => {
      if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple ===
        AppConstant.STATUS_ACTIVE && value.fieldValue !== null) {
        value.fieldValue = value.fieldValue.toString();
      }
    });
    return array;
  }

  /**
   * Format multiselect line item table values to strings
   */
  formatMultisetLineValues(array) {
    array.forEach(data => {
      data.additionalData.forEach(field => {
        if (field.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && field.multiple ===
          AppConstant.STATUS_ACTIVE && field.fieldValue !== null) {
          field.fieldValue = field.fieldValue.toString();
        }
      });
    });
    return array;
  }

  /**
   * Convert Comma Separated values to number arrays in header section additional fields in multiselect
   * Convert boolean value of checkbox
   */
  patchDropDownAdditionalData(array) {
    if (!array) {
      return;
    }
    if (array.length > 0) {
      array.forEach((value, index) => {
        if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple !== AppConstant.STATUS_ACTIVE
          && value.fieldValue !== undefined && value.fieldValue !== null) {
          array[index].fieldValue =
            parseInt(array[index].fieldValue);
        }
        if (value.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && value.multiple === AppConstant.STATUS_ACTIVE
          && value.fieldValue !== undefined && value.fieldValue !== null) {
          const splitValues = value.fieldValue.split(AppConstant.COMMA_STRING);
          array[index].fieldValue = splitValues.map(Number);
        }
        if (value.fieldTypeId === AppFieldType.CHECK_BOX && value.fieldValue !== undefined
          && value.fieldValue !== null) {
          try {
            value.fieldValue = JSON.parse(value.fieldValue);
          } catch (e) {
          }
        }
      });
    }
    return array;
  }

  /**
   * Convert Comma Separated values to number arrays in line item table additional fields in multiselect
   * Convert boolean value of checkbox
   */
  patchDropDownAdditionalLineItemData(array) {
    if (!array) {
      return;
    }
    if (array.length > 0) {
      array.forEach((data) => {
        data.additionalData.forEach((field) => {
          if (field.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && field.multiple !==
            AppConstant.STATUS_ACTIVE && field.fieldValue !== undefined && field.fieldValue !== null) {
            field.fieldValue = parseInt(field.fieldValue);
          }
          if (field.fieldTypeId === AppFieldType.DROP_DOWN_FIELD && field.multiple ===
            AppConstant.STATUS_ACTIVE && field.fieldValue !== undefined && field.fieldValue !== null) {
            const splitValues = field.fieldValue.split(AppConstant.COMMA_STRING);
            field.fieldValue = splitValues.map(Number);
          }
          if (field.fieldTypeId === AppFieldType.CHECK_BOX && field.fieldValue !== undefined
            && field.fieldValue !== null) {
            field.fieldValue = JSON.parse(field.fieldValue);
          }
        });
      });
    }
    return array;
  }

  /**
   * this method used to get a sequential value list for a dropdown
   * Ex: minutes, hours, etc.
   */
  getIncrementalValueDropdown(lastValue: number): DropdownDto {
    const minsList = new DropdownDto();
    for (let i = 0; i <= lastValue; i++) {
      let nameStr;
      if (i < 10) {
        nameStr = '0' + i;
      } else {
        nameStr = i;
      }
      minsList.data.push({id: i, name: nameStr});
    }
    return minsList;
  }

  /**
   * Check is value is empty and field is inactive on header section
   * @param value
   * @param status
   * @param isDetailView
   */
  checkUndefinedValues(value: any, status, isDetailView) {
    if (this.isEmptyValue(value)) {
      return true;
    }

    return status === AppEnumConstants.STATUS_APPROVED && !isDetailView;
  }

  /**
   * Check For empty value
   * @param value
   */
  isEmptyValue(value) {
    return !(value === null || value === undefined || value === AppConstant.EMPTY_STRING);
  }

  /**
   * Check is value is empty and field is inactive on line item section
   */
  checkUndefinedLineItemsValues(data, field, isDetailView, isCreate) {
    let returnValue;

    if (isCreate || data.length === AppConstant.ZERO) {
      returnValue = field.docStatus === AppEnumConstants.STATUS_APPROVED;
      return returnValue;
    }

    data.forEach(singleData => {
      if (returnValue) {
        return returnValue;
      }
      // If empty additional data Active field and not detail view
      if (singleData.additionalData.length === 0 && field.docStatus === AppEnumConstants.STATUS_APPROVED && !isDetailView) {
        returnValue = true;
      }

      // If empty additional data Inactive field and not detail view
      if (singleData.additionalData.length === 0 && field.docStatus !== AppEnumConstants.STATUS_APPROVED && !isDetailView) {
        returnValue = false;
      }

      // If empty additional data Active field and detail view
      if (singleData.additionalData.length === 0 && field.docStatus === AppEnumConstants.STATUS_APPROVED && isDetailView) {
        returnValue = false;
      }

      // If empty additional data Inactive field and detail view
      if (singleData.additionalData.length === 0 && field.docStatus !== AppEnumConstants.STATUS_APPROVED && isDetailView) {
        returnValue = false;
      }

      if (singleData.additionalData?.length !== 0) {
        singleData.additionalData.forEach(data1 => {
          if (this.isEmptyValue(data1.fieldValue) && data1.fieldId === field.id) {
            returnValue = true;
            return returnValue;
          } else if (!isCreate && field.docStatus === AppEnumConstants.STATUS_APPROVED && !isDetailView) {
            returnValue = true;
            return returnValue;
          }
        });
      }
      if (returnValue) {
        returnValue = true;
        return returnValue;
      } else {
        returnValue = false;
      }
    });
    return returnValue;
  }

  /**
   * Update Drop down additional field after add new option
   * @param additionalFieldResponse
   * @param selectedAdditionalField
   */
  updateAdditionalFiledDropdowns(additionalFieldResponse: AdditionalFieldDetailDto[], selectedAdditionalField) {
    const arr = additionalFieldResponse.filter(x => x.dataSourceId == selectedAdditionalField.dataSourceId);
    if (arr.length !== 0) {
      arr.forEach(value => {
        value.optionsList = selectedAdditionalField.optionsList;
      });
    }
  }

  /**
   * This method use for choose file for upload
   * @param event any
   * @param additionalField to index array instance
   * @param fieldProperties
   * @param isClear to clear the attachment or add
   * @param fileSelector file input selector to set null when file types doesn't match
   */
  changeFileInput(event: any, additionalField, fieldProperties, isClear, fileSelector) {

    if (!isClear) {
      if (event.target.files[0]) {
        // let types = fieldProperties.fileTypes.split(',');
        // if (!types.includes(event.target.files[0].type)) {
        //   fileSelector.value = null;
        //   return;
        // }
        additionalField.patchValue({
          attachment: event.target.files[0]
        });
      } else {
        additionalField.patchValue({
          attachment: null
        });
      }
    }
    if (isClear) {
      additionalField.patchValue({
        attachment: null
      });
    }
  }

  fileUploadClick(fileUpload) {
    document.getElementById(fileUpload).click();
  }

  /**
   * this method return true or false
   * @param multiSelectDropDownRef to dropdown reference
   * @param additionalFieldObject to additional field object
   */
  isAllowedToTriggerClickEvent(multiSelectDropDownRef, additionalFieldObject: AdditionalFieldDetailDto): boolean {
    return !(multiSelectDropDownRef._options.length === AppConstant.ONE &&
      additionalFieldObject.multiple === AppConstant.STATUS_ACTIVE &&
      additionalFieldObject.createNew === AppConstant.STATUS_ACTIVE);
  }

  /**
   * Detail View Empty value check
   * Check the string is empty or not
   * if empty return a '-'
   * else return the value
   * @param value if string returns '-'
   * @param isNumber if number returns a 0
   */
  detailViewIsDash(value: any, isNumber: boolean) {
    let returnVal = value;
    if (value == null || value == '') {
      if (isNumber) {
        returnVal = 0;
      } else {
        returnVal = '-';
      }
    }
    return returnVal;
  }

  /**
   * this method can be used validate additional file input field
   * @param headingAdditionalFieldFormArray to header section additional field array
   * @param additionalAttachments to additional attached files
   */
  validateFileInput(headingAdditionalFieldFormArray, additionalAttachments: any []) {
    if (headingAdditionalFieldFormArray.controls.length > AppConstant.ZERO) {
      headingAdditionalFieldFormArray.controls.forEach((formGroup, i) => {

        if (formGroup.get('docStatus').value === AppEnumConstants.STATUS_APPROVED
          && formGroup.get('fieldTypeId').value === this.appFieldType.FILE_INPUT && formGroup.get('required').value &&
          additionalAttachments.filter(x => x.fieldId === formGroup.get('fieldId').value &&
            x.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID).length > AppConstant.ZERO) {
          headingAdditionalFieldFormArray.controls[i].get('attachment').clearValidators();
          headingAdditionalFieldFormArray.controls[i].get('attachment').updateValueAndValidity();

        } else if (formGroup.get('docStatus').value === AppEnumConstants.STATUS_APPROVED
          && formGroup.get('fieldTypeId').value === this.appFieldType.FILE_INPUT && formGroup.get('required').value &&
          additionalAttachments.filter(x => x.fieldId === formGroup.get('fieldId').value &&
            x.sectionId === AppModuleSection.MASTER_DATA_INPUT_SECTION_ID).length === AppConstant.ZERO) {

          headingAdditionalFieldFormArray.controls[i].get('attachment').setValidators(Validators.required);
          headingAdditionalFieldFormArray.controls[i].get('attachment').updateValueAndValidity();

        }
      });
    }
  }

  /**
   * Round off to nearest 2 decimal place
   * @param num
   */
  roundNum(num) {
    const places = 10 ** 2;
    return Math.round(num * places) / places;
  }

  getSyncObjectTypeName(type) {
    switch (type) {
      case AppConstant.OBJECT_TYPE_ACCOUNT : {
        return AppConstant.OBJECT_NAME_TYPE_ACCOUNT;
      }
      case AppConstant.OBJECT_TYPE_ITEM : {
        return AppConstant.OBJECT_NAME_TYPE_ITEM;
      }
      case AppConstant.OBJECT_TYPE_ITEM_INVENTORY : {
        return AppConstant.OBJECT_NAME_TYPE_ITEM_INVENTORY;
      }
      case AppConstant.OBJECT_TYPE_ITEM_NON_INVENTORY : {
        return AppConstant.OBJECT_NAME_TYPE_ITEM_NON_INVENTORY;
      }
      case AppConstant.OBJECT_TYPE_ITEM_SERVICE : {
        return AppConstant.OBJECT_NAME_TYPE_ITEM_SERVICE;
      }
      case AppConstant.OBJECT_TYPE_ITEM_OTHER : {
        return AppConstant.OBJECT_NAME_TYPE_ITEM_OTHER;
      }
      case AppConstant.CHECK_PAYMENT_OBJECT : {
        return AppConstant.CHECK_NAME_PAYMENT_OBJECT;
      }
      case AppConstant.CARD_PAYMENT_OBJECT : {
        return AppConstant.CARD_NAME_PAYMENT_OBJECT;
      }
      case AppConstant.OBJECT_TYPE_UOM : {
        return AppConstant.OBJECT_NAME_TYPE_UOM;
      }
      case AppConstant.OBJECT_TYPE_PO_RECEIPT : {
        return AppConstant.OBJECT_NAME_TYPE_PO_RECEIPT;
      }
      case AppConstant.OBJECT_TYPE_PO : {
        return AppConstant.OBJECT_NAME_TYPE_PO;
      }
      case AppConstant.OBJECT_TYPE_EXPENSE : {
        return AppConstant.OBJECT_NAME_TYPE_EXPENSE;
      }
      case AppConstant.OBJECT_TYPE_VENDOR : {
        return AppConstant.OBJECT_NAME_TYPE_VENDOR;
      }
      case AppConstant.OBJECT_TYPE_PROJECT : {
        return AppConstant.OBJECT_NAME_TYPE_PROJECT;
      }
      case AppConstant.OBJECT_TYPE_BILL : {
        return AppConstant.OBJECT_NAME_TYPE_BILL;
      }
      case AppConstant.OBJECT_TYPE_PAYMENT : {
        return AppConstant.OBJECT_NAME_TYPE_BILL_PAYMENT;
      }
      case AppConstant.OBJECT_TYPE_CARD_PAYMENT : {
        return AppConstant.OBJECT_NAME_TYPE_BILL_PAYMENT;
      }
      case AppConstant.OBJECT_TYPE_CHECK_PAYMENT : {
        return AppConstant.OBJECT_NAME_TYPE_BILL_PAYMENT;
      }
      case AppConstant.OBJECT_TYPE_BILL_PAYMENT : {
        return AppConstant.OBJECT_NAME_TYPE_BILL_PAYMENT;
      }
      case AppConstant.OBJECT_TYPE_TERM : {
        return AppConstant.OBJECT_NAME_TYPE_TERM;
      }
      case AppConstant.OBJECT_TYPE_ATTACHMENT : {
        return AppConstant.OBJECT_NAME_TYPE_ATTACHMENT;
      }
      case AppConstant.OBJECT_TYPE_ITEM_CATEGORY : {
        return AppConstant.OBJECT_NAME_TYPE_ITEM_CATEGORY;
      }
      case AppConstant.OBJECT_TYPE_DEPARTMENT : {
        return AppConstant.OBJECT_NAME_TYPE_DEPARTMENT;
      }
      case AppConstant.OBJECT_TYPE_ADDITIONAL_FIELD : {
        return AppConstant.OBJECT_NAME_TYPE_ADDITIONAL_FIELD;
      }
      case AppConstant.OBJECT_TYPE_ADDITIONAL_FIELD_OPTION : {
        return AppConstant.OBJECT_NAME_TYPE_ADDITIONAL_FIELD_OPTION;
      }
    }
  }

  /**
   * this method can be used to check all selected items are draft
   * @param selectedItems to selected rows array
   * @param statusProperty is table status
   */
  isSelectOnlyDraft(selectedItems: any [], statusProperty) {
    return selectedItems.every(tableData => tableData[statusProperty] === AppEnumConstants.STATUS_DRAFT);
  }

  /**
   * Update the Google Analytics location change
   * @param router
   * @param titleService
   * @param document
   */
  updateGAnalytics(router: Router, titleService: Title, document: Document) {
    router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) {
        return;
      }

      const title = this.getTitle(router.routerState, router.routerState.root);
      titleService.setTitle(title || 'PaperTrl');

      gtag('event', 'page_view', {
        page_title: title || event.urlAfterRedirects,
        page_path: event.urlAfterRedirects,
        page_location: document.location.href
      });
    });
  }

  /**
   * Get and Set the title to Google analytics and for the system
   * @param state
   * @param parent
   */
  getTitle(state: RouterState, parent: ActivatedRoute): string {
    let data = '';
    if (parent && parent.snapshot.data?.breadcrumb) {
      data = parent.snapshot.data.breadcrumb;
    }

    if (state && parent?.firstChild) {
      data = this.getTitle(state, parent.firstChild);
    }
    return data;
  }

  /**
   * this method can be used to get payment information validate status
   * @param form to module form
   */
  isValidPaymentInfo(form: UntypedFormGroup) {
    let acceptedPaymentTypes: any [];
    acceptedPaymentTypes = form.get('acceptedPaymentTypes').value;
    if (acceptedPaymentTypes === null || acceptedPaymentTypes?.length === 0) {
      return false;
    }
    return (form.get('companyName').value === null || form.get('recipientType').value === null ||
      form.get('accountType').value === null || form.get('accountNumber').value === null ||
      form.get('accountRoutingNumber').value === null);
  }

  /**
   * this method can be used to notify required field on payment section
   * @param acceptedPaymentTypes to selected payment types
   */
  onAcceptedPaymentTypesChange(acceptedPaymentTypes: any []) {
    this.isSelectedVirtualCardACHCheck = !!(acceptedPaymentTypes.includes(1) || acceptedPaymentTypes.includes(2) ||
      acceptedPaymentTypes.includes(3));

    this.isSelectedACH = !!acceptedPaymentTypes.includes(1);

    this.isSelectedACHCheck = !!(acceptedPaymentTypes.includes(1) || acceptedPaymentTypes.includes(2));
  }

  /**
   * patch sku value in list
   * @param vendorItemController to sku formController
   * @param itemCostController to itemCostController formController
   * @param skuName to sku name
   * @param vendorItemPrice to vendor item price
   */
  patchSKU(vendorItemController: AbstractControl, itemCostController: AbstractControl, skuName, vendorItemPrice) {
    if (skuName) {
      vendorItemController.patchValue(skuName);
    }
    this.onChangeSkuList(vendorItemPrice, itemCostController, skuName);
  }


  /**
   * this method patch vendor item price to item cost field
   * @param vendorItemPrice to vendor item price
   * @param itemCostController to cost field controller
   * @param vendorItemNumber to vendorItemNumber controller
   */
  onChangeSkuList(vendorItemPrice, itemCostController, vendorItemNumber) {
    if (vendorItemNumber && (itemCostController.value === null || itemCostController.value === undefined ||
      itemCostController.value === AppConstant.ZERO)) {
      itemCostController.patchValue(vendorItemPrice);
    } else {
      itemCostController.patchValue(itemCostController.value);
    }
  }

  getTelNo(form, key) {
    if (form.get(key).value && form.get(key).value.e164Number) {
      return form.get(key).value.e164Number;
    } else {
      return form.get(key).value;
    }
  }

  detectDevice(userAgent: string) {
    let device = 'web';
    let platform = 'unknown';

    if (/mobi/i.test(userAgent)) {
      device = 'mobile';
    }

    if (/android/i.test(userAgent)) {
      platform = 'android';
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      platform = 'ios';
    }

    return {device, platform};
  }

  /**
   *
   * @param adHoc
   */
  getStatusIcon(adHoc: any) {
    return adHoc.statusId === AppConstant.APPROVE_ICON ? 'approve-icon fa fa-check'
      : adHoc.statusId === AppConstant.REJECT_ICON ? 'reject-icon fa fa-close' :
        adHoc.statusId === AppConstant.REASSING ? 'approve-icon fa fa-check'
          : '';
  }

  /**
   *User press enter inside the dropdown focus the current element
   * @param reference dropdown
   */

  isPressEnterInsideDropdown(reference: Dropdown) {
    if (reference !== null) {
      reference.focus();
    } else {
      return;
    }
  }

  preventEnterBehaviour(event: KeyboardEvent) {
    event.preventDefault();
  }

  convertDataToAutomation(object, documentId, formValue?) {
    const form = _.cloneDeep(object);
    const formValueClone = _.cloneDeep(formValue);
    form.additionalData = [];
    if (documentId === AppDocumentType.BILL) {
      if (formValueClone) {
        form.billItemCostDistributions = formValueClone.billItemCostDistributions;
        form.billExpenseCostDistributions = formValueClone.billExpenseCostDistributions;
        form.creditCardTransactionList = formValueClone.creditCardTransactionList;
      }

      if (form.billExpenseCostDistributions){
        for (const f of form.billExpenseCostDistributions) {
          f.additionalData = [];
        }
      }

      if (form.billItemCostDistributions){
        for (const f of form.billItemCostDistributions) {
          f.additionalData = [];
        }
      }

      if (form.creditCardTransactionList){
        for (const f of form.creditCardTransactionList) {
          f.additionalData = [];
        }
      }


      try {
        form.billDate = form.billDate ? form.billDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH) : null;
      } catch (e) {
        form.billDate = getDate(form.billDate);
      }
      if (formValueClone?.netDaysDue) {
        form.netDaysDue = formValueClone.netDaysDue;
      }
    }

    if (documentId === AppDocumentType.PURCHASE_ORDER) {
      if (formValueClone) {
        form.purchaseOrderDetails = formValueClone.purchaseOrderDetails;
        form.purchaseOrderAccountDetails = formValueClone.purchaseOrderAccountDetails;
      }
      for (const f of form.purchaseOrderDetails) {
        f.additionalData = [];
      }

      for (const f of form.purchaseOrderAccountDetails) {
        f.additionalData = [];
      }

      try {
        form.poDate = form.poDate ? form.poDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH) : null;
      } catch (e) {
        form.poDate = getDate(form.poDate);
      }

      try {
        form.deliveryDate = form.deliveryDate ? form.deliveryDate.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH) : null;
      } catch (e) {
        form.deliveryDate = getDate(form.deliveryDate);
      }

      try {
        if (form.pocPhone && form.pocPhone.e164Number) {
          form.pocPhone = form.pocPhone.e164Number;
        }
      } catch (e) {
      }
    }

    if (documentId === AppDocumentType.EXPENSE) {
      if (formValueClone) {
        form.expenseDetails = formValueClone.expenseDetails;
      }

      for (const f of form.expenseDetails) {
        f.additionalData = [];
      }
    }
    form.submittedOn = null;
    return form;

    function getDate(dateStr) {
      if (dateStr.includes('Z')) {
        const date = new Date(dateStr);

        const year = date.getUTCFullYear();
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2); // Months are 0-based
        const day = ('0' + date.getUTCDate()).slice(-2);

        return `${month}/${day}/${year}`;
      } else {
        return dateStr;
      }
    }
  }


  /**
   * this function updates department information from the header level to the line level.
   * @param formGroup The main form group containing information
   * @param i Index of the line item being processed (-1 if header level).
   * @param isEdit  Whether the form is in edit mode.
   * @param formName form array name
   * @param isClear Whether to clear department information.
   * @param fromItem  Whether the update is coming from a line item.
   */
  patchHeaderDepartmentToLineLevel(formGroup: FormGroup, i: number, isEdit: boolean, formName, isClear?: boolean, fromItem?: boolean) {
    const tableConfigurations = [
      'billItemCostDistributions',
      'billExpenseCostDistributions',
      'recurringBillExpenseCostDistributions',
      'recurringBillItemCostDistributions',
      'purchaseOrderDetails',
      'purchaseOrderAccountDetails',
      'expenseDetails',
      'creditCardTransactionList'
    ];

    // Get the value of the department ID from the form group
    const departmentIdValue = formGroup.get('departmentId').value;

    // Clear Auto selected departments
    // if (isClear && !departmentIdValue && !isEdit) {
    //   tableConfigurations.forEach(distribution => {
    //     const formArray = formGroup.get(distribution) as FormArray;
    //     if (formArray) {
    //       this.resetLineItemDepartments(formArray.controls);
    //     }
    //   });
    // }

    // Return if no department ID is available
    if (!departmentIdValue) {
      return;
    }

    // Define a function to update the next department
    const patchNextIfNecessary = (controls: AbstractControl[], index: number) => {
      const nextControl = controls[index + 1];
      const currentControl = controls[index];
      const nextDepartmentId = nextControl?.get('departmentId');
      const currentDepartmentId = currentControl?.get('departmentId');

      // Update the next department with the current department ID if it's empty
      if (nextDepartmentId && !nextDepartmentId.value && currentDepartmentId?.value) {
        nextDepartmentId.patchValue(departmentIdValue);
      }
    };

    // Update the next department for header level (-1)
    if (i === -1) {
      tableConfigurations.forEach(distribution => {
        const formArray = formGroup.get(distribution) as FormArray;
        const nextDepartmentControl = formArray?.controls[i + 1]?.get('departmentId');

        if (formArray && nextDepartmentControl && !nextDepartmentControl.dirty && !nextDepartmentControl.value) {
          nextDepartmentControl.patchValue(departmentIdValue);
        }
      });
      return;
    }

    // Patch the header department to line items
    const formArray = formGroup.get(formName) as FormArray;
    if (formArray) {
      if (fromItem) {
        patchNextIfNecessary(formArray.controls, i);
        return;
      }
      patchNextIfNecessary(formArray.controls, i);
    }
  }

  /**
   * Reset department line item when header is cleared
   * @param controls
   */
  resetLineItemDepartments(controls: AbstractControl[]) {
    controls.forEach(control => {
      const departmentIdControl = control.get('departmentId');
      if (departmentIdControl && !departmentIdControl.dirty) {
        departmentIdControl.reset();
      }
    });
  }

  /**
   * Updates header-level department and project code, and handles confirmation based on changes.
   * @param selectedValue The selected value (e.g., 'departmentId' or 'projectCodeId').
   * @param codeId The code id (eg: projectCodeId or departmentCodeId) identifier.
   * @param expenseCostDistributionForms
   * @param isClear clicking the dropdown clear option identifier
   */
  patchHeaderLevelDepartmentAndProjectCodeLineLevel(selectedValue?, codeId?, expenseCostDistributionForms?, isClear?) {
    this.codeId = codeId;
    this.twoConfirmationPopup = this.isConfirmation;

    if (this.isProjectCodeAvailable){
      if(AppFormConstants.PROJECT_CODE_ID === selectedValue) {
        this.isConfirmation = true;
      }
    }

    if(this.isDepartmentAvailable){
      if(AppFormConstants.DEPARTMENT_ID === selectedValue) {
        this.isConfirmation = true;
      }
    }

    const isProjectCodeChange = this.projectCodeChanges[0] !== codeId && this.projectCodeChanges[0] !== undefined;
    const isProjectCodeSelected = AppFormConstants.PROJECT_CODE_ID === selectedValue;

    const isDepartmentChange = this.departmentChanges[0] !== codeId && this.departmentChanges[0] !== undefined;
    const isDepartmentSelected = AppFormConstants.DEPARTMENT_ID === selectedValue;


    if ((isProjectCodeChange && isProjectCodeSelected) || (isDepartmentChange && isDepartmentSelected)) {
      this.isConfirmation = true;
    }


    this.sectionName = selectedValue === 'departmentId' ? 'department codes' : selectedValue === 'projectCodeId' ?
      'project codes' : '';

    if (AppFormConstants.PROJECT_CODE_ID === selectedValue) {
      this.projectCodeChanges.push(codeId);
      this.projectCodeChanges[0] = true; // Change to true when the condition is met
    }
    if (AppFormConstants.DEPARTMENT_ID === selectedValue) {
      this.departmentChanges.push(codeId);
      this.departmentChanges[0] = true; // Change to true when the condition is met
    }
  }

  /**
   * Overwrites data in the specified form controls based on the given value
   * @param value (eg: YES or NO)
   * @param formGroup - The FormGroup containing the form controls to be modified.
   * @param expenseCostDistributionForms
   * @param itemCostDistributionForms
   */
  overWriteData(value, formGroup: FormGroup, expenseCostDistributionForms?, itemCostDistributionForms?) {
    this.isValue = value;
    this.isConfirmation = false;

    const sectionNameIsDepartmentCodes = this.sectionName === 'department codes';
    const sectionNameIsProjectCodes = this.sectionName === 'project codes';


    const expenseForms = expenseCostDistributionForms || [];
    const itemForms = itemCostDistributionForms || [];

    if (this.isValue === 'Yes') {
      [...expenseForms, ...itemForms].forEach(control => {
        const controlId = sectionNameIsDepartmentCodes ?
          'departmentId' : sectionNameIsProjectCodes ? 'projectId' : null;
        if (controlId) {
          const codeIdControl = control.get(controlId);
          const accountID = control.get('accountId');
          const accountName = control.get('accountName');
          if (codeIdControl.value) {
            codeIdControl.patchValue(this.codeId);
            if (controlId === 'projectId') {
              accountID?.reset();
              accountName?.reset();
            }
          }
        }
      });
    } else if (this.isValue === 'No') {
      [...expenseForms, ...itemForms].forEach(control => {
        const controlId = sectionNameIsDepartmentCodes ?
          'departmentId' : sectionNameIsProjectCodes ? 'projectId' : null;
        if (controlId) {
          const codeIdControl = control.get(controlId);
          const lineAmount = control.get('amount').value;
          const accountID = control.get('accountId');
          const accountName = control.get('accountName');
          if (lineAmount) {
            if (codeIdControl.value === null) {
              codeIdControl.patchValue(this.codeId);
              if (controlId === 'projectId') {
                accountID?.reset();
                accountName?.reset();
              }
            }
          }
        }
      });
    }
    setTimeout(() => {
      if (this.twoConfirmationPopup) {
        if (this.sectionName === 'department codes') {
          this.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.PROJECT_CODE_ID,
            this.projectCodeChanges[this.projectCodeChanges.length - 1]);
        }
        if (this.sectionName === 'project codes') {
          this.patchHeaderLevelDepartmentAndProjectCodeLineLevel(AppFormConstants.DEPARTMENT_ID,
            this.departmentChanges[this.departmentChanges.length - 1]);
        }
      }
      this.twoConfirmationPopup = false;
    }, 400);

  }

  /**
   * Reset department line item when header is cleared
   * @param formController this parameter represent form controller
   * @param isInsertApproverChecked this parameter represent insert approver status
   */
  setApprovalUserValidation(formController: any, isInsertApproverChecked: boolean) {
    formController.get('approvalUser').setValidators(isInsertApproverChecked ? [Validators.required] : null);
    formController.get('approvalUser').updateValueAndValidity();
  }
}

