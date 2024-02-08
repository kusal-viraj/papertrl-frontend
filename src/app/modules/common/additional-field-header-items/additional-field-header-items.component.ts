import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppFieldType} from "../../../shared/enums/app-field-type";
import {AdditionalFieldDetailDto} from "../../../shared/dto/additional-field/additional-field-detail-dto";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {AppConstant} from "../../../shared/utility/app-constant";
import {FormArray, UntypedFormArray} from "@angular/forms";

@Component({
  selector: 'app-additional-field-header-items',
  templateUrl: './additional-field-header-items.component.html',
  styleUrls: ['./additional-field-header-items.component.scss']
})
export class AdditionalFieldHeaderItemsComponent implements OnInit {
  @Input() additionalField;
  @Input() itemIndex;
  @Input() additionalFieldHeader;
  @Input() parentForm;
  @Output() updateAdditionalFieldDropDowns = new EventEmitter();
  public appFieldType = AppFieldType;
  public addNewDropDown = false;
  public selectedAdditionalField: AdditionalFieldDetailDto;
  public commonUtil = new CommonUtility();
  public appConstant = new AppConstant();
  @Input() isCreate = false;
  constructor() { }

  ngOnInit(): void {
  }
  get fieldValueControl() {
    return (this.parentForm.get('additionalData') as FormArray).at(this.itemIndex).get('fieldValue');
  }

  get fieldValueControlAttachment() {
    return (this.parentForm.get('additionalData') as FormArray).at(this.itemIndex).get('attachment');
  }

  /**
   * return form array data
   */
  public get headingSectionArray() {
    return this.parentForm.get('additionalData') as UntypedFormArray;
  }

  /**
   * This method use for view additional option input drawer when user click footer add new button
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */
  setSelectedAdditionalField(additionalFieldDetailDto: AdditionalFieldDetailDto) {
    this.selectedAdditionalField = additionalFieldDetailDto;
  }

  formatDateHeadingSection(event, index) {
    this.headingSectionArray.controls[index].get('fieldValue').patchValue(event.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH));
  }
}
