import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AdditionalFieldOptionDto} from '../../../shared/dto/additional-field/additional-field-option-dto';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {MessageService} from 'primeng/api';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppHttpResponseMessage} from '../../../shared/enums/app-http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';

@Component({
  selector: 'app-additional-field-add-new',
  templateUrl: './additional-field-add-new.component.html',
  styleUrls: ['./additional-field-add-new.component.scss']
})
export class AdditionalFieldAddNewComponent implements OnInit {

  @Input() field: AdditionalFieldDetailDto;
  @Input() needToRemoveAddNew = false;

  @Output() closedComponent = new EventEmitter<boolean>();
  @Input() isCreate = false;

  public dropdownOptionCreateForm: UntypedFormGroup;

  public isOptionValueAvailable: false;
  isProgressClickEvent = false;


  constructor(public formBuilder: UntypedFormBuilder, public additionalFieldService: AdditionalFieldService,
              public notificationService: NotificationService,
              public messageService: MessageService) {
  }

  ngOnInit(): void {

    this.dropdownOptionCreateForm = this.formBuilder.group({
      optionValue: [null, Validators.required]
    });

  }

  get dropdownOptionForm() {
    return this.dropdownOptionCreateForm.controls;
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
   * This method use for navigate dropdown option creation methods
   */
  public createDropdownOption() {
    this.isProgressClickEvent = true;
    if (this.dropdownOptionCreateForm.valid) {
      const additionalFieldOptionDto: AdditionalFieldOptionDto = this.dropdownOptionCreateForm.value;

      if (this.field.dataSourceId) {
        additionalFieldOptionDto.dataSourceId = this.field.dataSourceId;
        this.createDataSourceDropDownOption(additionalFieldOptionDto);
      } else if (this.field.fieldTypeId) {
        additionalFieldOptionDto.fieldId = this.field.id;
        this.createFieldDropdownOptions(additionalFieldOptionDto);
      }
    } else {
      this.isProgressClickEvent = false;
      new CommonUtility().validateForm(this.dropdownOptionCreateForm);
    }

  }

  /**
   * This method use for create additional field dropdown option
   */
  public createDataSourceDropDownOption(additionalFieldOptionDto: AdditionalFieldOptionDto) {
    this.additionalFieldService.createDataSourceOption(additionalFieldOptionDto, this.isCreate).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.notificationService.successMessage(AppHttpResponseMessage.DROPDOWN_OPTION_CREATED_SUCCESSFULLY);
        this.isProgressClickEvent = false;
        this.dropdownOptionCreateForm.reset();
        this.field.optionsList.data = res.body;
        this.closedComponent.emit(true);
      } else {
        this.isProgressClickEvent = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isProgressClickEvent = false;
      this.notificationService.errorMessage(error);
    });

  }

  /**
   * This method use for create additional field option
   */
  public createFieldDropdownOptions(additionalFieldOptionDto: AdditionalFieldOptionDto) {
    this.additionalFieldService.createFieldDropdownOption(additionalFieldOptionDto).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_CREATED === res.status) {
        this.notificationService.successMessage(AppHttpResponseMessage.DROPDOWN_OPTION_CREATED_SUCCESSFULLY);
        this.isProgressClickEvent = false;
        this.dropdownOptionCreateForm.reset();
        this.field.optionsList.data = res.body;
        this.field.optionsList.addNew();
        this.closedComponent.emit(true);
      } else {
        this.isProgressClickEvent = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.isProgressClickEvent = false;
      this.notificationService.errorMessage(error);
    });
  }

}
