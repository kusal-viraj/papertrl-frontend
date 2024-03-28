import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AbstractControl, FormArray, UntypedFormArray} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CommonUtility} from '../../../shared/utility/common-utility';

@Component({
  selector: 'app-additional-field-line-items',
  templateUrl: './additional-field-line-items.component.html',
  styleUrls: ['./additional-field-line-items.component.scss']
})
export class AdditionalFieldLineItemsComponent implements OnInit {

  @Input() additionalFieldForCostDistributions;
  @Input() col;
  @Input() itemIndex;
  @Input() tableType;
  @Input() i;
  @Input() additionalLineItemField;
  @Input() parentForm;
  @Output() updateAdditionalFieldDropDowns = new EventEmitter();
  public appFieldType = AppFieldType;
  public addNewDropDown = false;
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public commonUtil = new CommonUtility();
  @Input() isCreate;

  constructor() {
  }

  ngOnInit(): void {
  }

  get fieldValueControl() {
    return this.additionalDataArray.controls[this.itemIndex].get('fieldValue');
  }

  get attachmentControl() {
    return this.additionalDataArray.controls[this.itemIndex];
  }

  get additionalDataArray() {
    return (this.parentForm.controls[this.i].get('additionalData') as FormArray);
  }

  get additionalFieldFormGroup() {
    return this.parentForm.controls[this.i].get('additionalData').controls[this.itemIndex];
  }

  formatDateSection(event, control, field) {
    if (!event) {
      return;
    }
    if (event){
      this.fieldValueControl.patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
    }
  }

  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */
  setSelectedAdditionalField(additionalFieldDetailDto: AdditionalFieldDetailDto) {
    this.selectedAdditionalField = additionalFieldDetailDto;
  }

  /**
   * This method use for view additional option input drawer
   * @param event to change event
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   * @param additionalField to AdditionalFieldDetailDto
   * @param multiSelect to multiSelect dropdown
   */
  addNewAdditionalDropDownOption(event: any, additionalFieldDetailDto: AdditionalFieldDetailDto,
                                 additionalField: AbstractControl, multiSelect) {
    if (multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        value.isChecked = true;
      });
    } else {
      const allChecked: boolean = multiSelect._options.every(function (item: any) {
        return item.isChecked == false;
      });

      if (allChecked) {
        multiSelect._options.forEach((value) => {
          if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
            value.disabled = false;
          }
        });
      } else {
        multiSelect._options.forEach((value) => {
          if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
            value.disabled = true;
          }
        });
      }
    }
    if (additionalFieldDetailDto.createNew === AppConstant.STATUS_ACTIVE && additionalFieldDetailDto.multiple ===
      AppConstant.STATUS_ACTIVE && multiSelect.allChecked) {

      let idArray: number [] = [];
      idArray = additionalField.get(AppConstant.FIELD_VALUE).value;
      idArray.forEach((value, index) => {
        if (idArray[0] === 0) {
          idArray.splice(index, 1);
        }
      });

      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = true;
        }
      });
    } else if (!multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = false;
        }
      });
    }
  }
}
