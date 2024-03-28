import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';

@Component({
  selector: 'app-additional-field-dropdown-datasource',
  templateUrl: './additional-field-dropdown-datasource.component.html',
  styleUrls: ['./additional-field-dropdown-datasource.component.scss']
})
export class AdditionalFieldDropdownDatasourceComponent implements OnInit {

  @Output() closeModal = new EventEmitter();

  public dropdownDatasourceForm: UntypedFormGroup;

  public isVisible: boolean;
  public isDataSourceNameAvailable = false;
  private isOptionAvailability = false;
  public btnLoading = false;
  selectedAdditionalField: any;
  @Input() isEditView: boolean;
  @Input() selectedDatasourceId: any;
  @Input() additionalFieldID: number;

  constructor(public formBuilder: UntypedFormBuilder, public additionalFieldService: AdditionalFieldService, public messageService: MessageService,
              public notificationService: NotificationService) {

    this.dropdownDatasourceForm = this.formBuilder.group({
      id: [null],
      name: [null, Validators.required],
      file: [null],
      fileName: [null],
      optionValues: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    if (this.isEditView) {
      this.getDatasourceById(this.selectedDatasourceId);
    } else {
      this.addDataSourceFormController();
    }
  }

  /**
   * This method use for open side drawer
   */
  openDrawer() {
    this.reset();
    this.isVisible = true;
  }

  /**
   *  This method can be used to return all dropdownDatasourceForm controllers
   */
  public get f1() {
    return this.dropdownDatasourceForm.controls;
  }

  /**
   * This method can be used to valid empty spaces in the dropdownDatasource form
   * @param controlName to form control name
   */
  removeAdditionalFieldSpace(controlName: AbstractControl) {
    if (controlName && controlName.value && !controlName.value.replace(/\s/g, '').length) {
      controlName.setValue('');
    }
  }

  /**
   * This method can use for get data source FormArray from controllers
   */
  public get dataSourceOption() {
    return this.dropdownDatasourceForm.get('optionValues') as UntypedFormArray;
  }

  /**
   * This method use for add new form controller group for data source
   */
  addDataSourceFormController() {
    const dataSourceOption = this.formBuilder.group({
      optionIndex: [AppEnumConstants.LABEL_EMPTY_STRING],
      optionValue: [null, [Validators.required]],
      isActive: [true],
      id: [null],
      dataSourceId: [null],
      status: [null],
      isEdit: [true]
    });
    this.dataSourceOption.push(dataSourceOption);
  }

  /**
   * This method use for reset data source form array
   */
  resetDataSource() {
    while (this.dataSourceOption.length !== 0) {
      this.dataSourceOption.removeAt(0);
    }

    this.addDataSourceFormController();
  }

  /**
   * This method use for remove data source row
   * @param approvalSequenceIndex number
   */
  removeDataSource(dataSourceIndex: number) {
    this.dataSourceOption.removeAt(dataSourceIndex);
  }

  /**
   * This method use for get option index
   * @param optionIndex number
   */
  getOptionNumber(optionIndex: number) {
    return (optionIndex + 1);
  }

  /**
   * This method use for reset data source drawer
   */
  reset() {
    this.dropdownDatasourceForm.reset();
    if (!this.isEditView) {
      this.resetDataSource();
    } else {
      // this.dataSourceOption.reset();
      this.dataSourceOption.clear();
      this.getDatasourceById(this.selectedDatasourceId);
    }

  }

  createDataSource() {
    this.btnLoading = true;
    if (!this.dropdownDatasourceForm.valid) {
      this.btnLoading = false;
      new CommonUtility().validateForm(this.dropdownDatasourceForm);
      return;
    }
    if (this.isOptionAvailability) {
      this.btnLoading = false;
      return;
    }
    if (!this.isEditView) {
      this.additionalFieldService.createDataSource(this.dropdownDatasourceForm.value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
          this.closeModal.emit();
          this.notificationService.successMessage(HttpResponseMessage.DROPDOWN_FIELD_CREATED_SUCCESSFULLY);
          this.reset();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.btnLoading = false;
      }, error => {
        this.btnLoading = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.additionalFieldService.updateDataSource(this.dropdownDatasourceForm.value).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.closeModal.emit();
          this.notificationService.successMessage(HttpResponseMessage.DROPDOWN_FIELD_CREATED_SUCCESSFULLY);
          this.reset();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
        this.btnLoading = false;
      }, error => {
        this.btnLoading = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  getDatasourceById(id) {
    this.additionalFieldService.getDatasourceById(id, this.additionalFieldID).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        res.body?.optionValues?.forEach((value) => {
          this.addDataSourceFormController();
        });
        this.dropdownDatasourceForm.patchValue(res.body);
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  public downloadTemplate() {
    this.additionalFieldService.getOptionTemplate()
      .subscribe(res => {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'papertrl_additional_field_upload_template');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, error => {
        this.notificationService.errorMessage(HttpResponseMessage.FAILED_TO_DOWNLOAD_FILE);
      }, () => {
        this.notificationService.successMessage(HttpResponseMessage.FILE_DOWNLOADED_SUCCESSFULLY);
      });
  }

  fileUpload(event) {
    while (this.dataSourceOption.length !== 0) {
      this.dataSourceOption.removeAt(0);
    }
    const dataSourceOption = this.formBuilder.group({
      optionIndex: [AppEnumConstants.LABEL_EMPTY_STRING],
      optionValue: [null],
      isActive: [true],
      id: [null],
      dataSourceId: [null],
      status: [null],
      isEdit: [true]
    });
    this.dataSourceOption.push(dataSourceOption);

    if (event.target.files[0]) {
      const targetFile = event.target.files[0];
      this.dropdownDatasourceForm.patchValue({
        file: targetFile
      });
    }
  }

  removeFiles(optionIndex: number) {
    if (optionIndex === 0) {

    }
  }

  validateFiled(option: AbstractControl, optionIndex: number) {
    if (optionIndex === 0 && option.value.optionValue === null && this.dropdownDatasourceForm.get('fileName').value !== null) {
      this.resetDataSource();
      this.dropdownDatasourceForm.get('file').reset();
      this.dropdownDatasourceForm.get('fileName').reset();
    }
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

  /**
   * This method use for active or inactivate the data source option
   * @param id number - This parameter is represented datasource option id.
   * @param dataSourceId number - This parameter is represented datasource id.
   * @param isActive boolean - This parameter use to check the status of the option.
   */
  dataSourceOptionActiveInactive(id: any, dataSourceId: any, isActive: boolean) {
    if (this.isEditView) {
      this.additionalFieldService.activateInactivateDataSrcOption(dataSourceId, id, isActive).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      });
    }
  }

  /**
   * This method use for active or inactivate the data source option
   * @param setStatusValue any - This parameter is represented data source option controls.
   */
  setStatus(setStatusValue: any) {
    setStatusValue?.get('isActive').value === true ? setStatusValue?.get('status').patchValue(AppConstant.STATUS_ACTIVE)
      : setStatusValue?.get('status').patchValue(AppConstant.STATUS_INACTIVE);
  }

  /**
   * This method use for active or inactivate the data source option
   * @param optionId number - This parameter is represented data source option id.
   * @param optionIndex number - This parameter is represented data source option index number in the array.
   */

  deleteDataSourceOption(optionId: any, optionIndex: any) {
    if (optionId === null || optionId === undefined) {
      this.removeDataSource(optionIndex);
    }

    if (optionId === null || optionId === undefined) {
      return;
    } else {
      this.additionalFieldService.deleteDataSrcOption(this.additionalFieldID, optionId).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.removeDataSource(optionIndex);
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      });
    }
  }
}

