import {Component, Input, OnInit, Output, ViewChild, ElementRef} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {PoNumberConfigureService} from '../../../shared/services/po-number-configuration/po-number-configure.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PoNumberFormatDto} from '../../../shared/dto/po-number-configuration/po-number-format-dto';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {EventEmitter} from '@angular/core';
import {AppFormConstants} from "../../../shared/enums/app-form-constants";
import {PoService} from "../../../shared/services/po/po.service";
import {ConfirmationService} from "primeng/api";
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-po-number-configuration',
  templateUrl: './po-number-configuration.component.html',
  styleUrls: ['./po-number-configuration.component.scss']
})
export class PoNumberConfigurationComponent implements OnInit {
  poNumberConfigurationForm: UntypedFormGroup;
  public departments: DropdownDto = new DropdownDto();
  public separatorList: DropdownDto = new DropdownDto();
  public poNumberFormatMst: PoNumberFormatDto = new PoNumberFormatDto();
  @Input() isEditView = false;
  @Input() poNumberId: any;
  @Output() isCreteNewOne = new EventEmitter();
  @Output() newDeptAdded = new EventEmitter();
  @Output() isUpdated = new EventEmitter();
  @ViewChild('controlValue') controlValue: ElementRef;
  @ViewChild('prefixValue') prefixValue: ElementRef;
  @ViewChild('suffixValue') suffixValue: ElementRef;
  public isLoading = false;
  public isUpdating = false;
  public separatorsMap = new Map();
  public departmentPanel = false;
  private departmentExists = false;

  constructor(public formBuilder: UntypedFormBuilder, public poNumberConfigureService: PoNumberConfigureService, public poService: PoService,
              public notificationService: NotificationService, public confirmationService: ConfirmationService, public billsService: BillsService) {
  }

  ngOnInit(): void {
    this.initializeFormBuilder();
    this.getDepartmentList();
    this.getSeparatorList();
    if (this.isEditView) {
      this.getPONumberFormatData();
    }
  }

  /**
   * this method can be used to initialize form builder
   */
  initializeFormBuilder(){
    this.poNumberConfigurationForm = this.formBuilder.group({
      departmentId: [null, Validators.required],
      separatorSymbol: [null],
      prefixes: [null],
      runningNo: [null, Validators.compose([Validators.required, Validators.maxLength(10), Validators.pattern('^[0-9]*$')])],
      suffixes: [null],
      override: [false],
      poNoPattern: [null]
    });
  }

  /**
   * this method can be used to create new po number format
   * @param value to form values
   */
  createPoNumberConfiguration(value) {
    const isExceedPrefixLength: boolean = this.prefixValue.nativeElement.value.length > AppConstant.PREFIX_LENGTH;
    const isExceedSuffixLength: boolean = this.suffixValue.nativeElement.value.length > AppConstant.SUFFIX_LENGTH;
    if (!this.poNumberConfigurationForm.valid || isExceedPrefixLength || isExceedSuffixLength) {
      this.isLoading = false;
      new CommonUtility().validateForm(this.poNumberConfigurationForm);
    } else {
      value.poNoPattern = this.controlValue.nativeElement.value;
      value.override ? value.override = AppConstant.YES : value.override = AppConstant.NO;
      if (this.departmentExists) {
        this.confirmationService.confirm({
          message: 'The configuration is already exist for this department. <br> <br>' +
            'Saving will override the existing configuration',
          key: 'poNoConfig',
          accept: () => {
            this.createPoNoConfig(value);
          }
        });
      } else {
        this.createPoNoConfig(value);
      }
    }
  }

  /**
   * this method can be used to send data to backend
   * @param value to form values
   */
  createPoNoConfig(value) {
    this.isLoading = true;
    this.poNumberConfigureService.createPurchaseOrderNumberFormat(value).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS !== res.status) {
        this.isLoading = false;
        this.notificationService.infoMessage(res.body.message);
      } else {
        this.notificationService.successMessage(HttpResponseMessage.PO_NUMBER_FORMAT_SAVED_SUCCESSFULLY);
        this.resetForm();
        this.isCreteNewOne.emit();
        this.isLoading = false;
      }
    }, error => {
      this.isLoading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to update po number format
   * @param value to form values
   */
  updatePoNumberConfiguration(value) {
    value.poNoPattern = this.controlValue.nativeElement.value;
    value.override ? value.override = AppConstant.YES : value.override = AppConstant.NO;
    this.poNumberFormatMst = value;
    this.poNumberFormatMst.id = this.poNumberId;
    this.isUpdating = true;
    if (!this.poNumberConfigurationForm.valid) {
      this.isUpdating = false;
      new CommonUtility().validateForm(this.poNumberConfigurationForm);
    } else {
      this.poNumberConfigureService.updatePoNumberFormat(this.poNumberFormatMst).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(HttpResponseMessage.PO_NUMBER_FORMAT_EDITED_SUCCESSFULLY);
          this.isUpdating = false;
          this.isUpdated.emit();
        } else {
          this.isUpdating = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.isUpdating = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * validate empty space
   */
  removeSpace(fieldName) {
    if (this.poNumberConfigurationForm.get(fieldName).value) {
      if (this.poNumberConfigurationForm.get(fieldName).value[0] === AppConstant.EMPTY_SPACE) {
        this.poNumberConfigurationForm.get(fieldName).patchValue(AppConstant.EMPTY_STRING);
      }
    }
  }

  /**
   * this method can be used to reset the form
   */
  resetForm() {
    this.poNumberConfigurationForm.reset();
    this.validatePrefixAndSuffix(this.poNumberConfigurationForm);
    if (!this.isEditView) {
      setTimeout(() => {
        this.checkDepartmentExist(this.departments.data[1].id);
        this.poNumberConfigurationForm.get(AppFormConstants.DEPARTMENT_ID).patchValue(this.departments.data[1].id);
      }, AppConstant.DATA_PATCH_TIME_OUT);
    } else {
      this.getPONumberFormatData();
    }
  }

  /**
   * this method can be used to get department list
   */
  getDepartmentList() {
    this.billsService.getDepartment(!this.isEditView).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.departments.data = res.body;
        this.departments.addAll();
        this.departments.addNewWithAddAll();
        if (this.isEditView) {
          return;
        } else {
          setTimeout(() => {
            this.checkDepartmentExist(this.departments.data[1].id);
            this.poNumberConfigurationForm.get(AppFormConstants.DEPARTMENT_ID).patchValue(this.departments.data[1].id);
          }, AppConstant.DATA_PATCH_TIME_OUT);
        }
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });

  }

  getSeparatorList() {
    this.poNumberConfigureService.getSeparatorList().then((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS !== res.status) {
        return;
      } else {
        this.separatorList.data = res.body;
        this.separatorList.data.forEach(value => {
          this.separatorsMap.set(value.id, value.name);
        });
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   *  this method can be used to validate prefix and suffix
   * @param formGroup to form group
   */
  validatePrefixAndSuffix(formGroup) {
    const separatorValue = formGroup.get(AppConstant.SEPARATOR_SYMBOL).value;
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
   * this method can be used to get po number format data
   */
  getPONumberFormatData() {
    this.poNumberConfigureService.getPoNumberData(this.poNumberId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        res.body.override === AppConstant.YES ? (res.body.override = true) : (res.body.override = false);
        this.poNumberConfigurationForm.patchValue(res.body);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  async departmentChange(event: any) {
    if (event.value === -1) {
      this.departmentPanel = true;
      this.poNumberConfigurationForm.get('departmentId').reset();
      return;
    }
    if (this.isEditView) {
      return;
    }
    if (event.value) {
      await this.checkDepartmentExist(event.value);
    } else {
      this.departmentExists = false;
    }
  }

  async checkDepartmentExist(deptId) {
    await this.poNumberConfigureService.isDepartmentPoNoConfigExists(deptId).then((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.departmentExists = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }).catch((error) => {
      this.notificationService.errorMessage(error);
    });
  }
}
