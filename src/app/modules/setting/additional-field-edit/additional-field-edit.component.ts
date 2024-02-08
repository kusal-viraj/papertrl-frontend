import {Component, Input, OnInit, Output, EventEmitter, HostListener} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {AutomationService} from '../../../shared/services/automation-service/automation.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AdditionalFieldDetailDto} from '../../../shared/dto/additional-field/additional-field-detail-dto';
import {AdditionalFieldBaseComponent} from '../additional-field-base/additional-field-base.component';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppFieldType} from '../../../shared/enums/app-field-type';
import {FormGuardService} from '../../../shared/guards/form-guard.service';
import {ConfirmationService} from 'primeng/api';


@Component({
  selector: 'app-additional-field-edit',
  templateUrl: './additional-field-edit.component.html',
  styleUrls: ['./additional-field-edit.component.scss']
})
export class AdditionalFieldEditComponent extends AdditionalFieldBaseComponent implements OnInit {
  public additionalFieldId: number;
  @Input() additionalFieldID: number;
  public fieldDetails: any[];
  public existingDocuments: any[] = [];
  public existingDocumentsValues: any[] = [];
  public sections: any[];
  public maxLength = 0;
  selectedDataSourceId: any;
  public fieldId: number;
  public fieldTypeId = AppFieldType;

  constructor(public formBuilder: UntypedFormBuilder, public automationService: AutomationService,
              public additionalFieldService: AdditionalFieldService, public privilegeService: PrivilegeService,
              public notificationService: NotificationService, public formGuardService: FormGuardService,
              public confirmationService: ConfirmationService) {

    super(formBuilder, automationService, additionalFieldService, privilegeService, notificationService, confirmationService);
    this.additionalFieldUtility.getDropdownPropertyList();
  }

  async ngOnInit() {
    this.openDrawer(this.additionalFieldID);

    await this.getSectionList();
    this.additionalFieldService.getSelectedField(this.additionalFieldID).subscribe(res => {
      this.fieldDetails = [
        {
          fieldTypeName: res.body.fieldTypeName,
          required: res.body.required,
          status: res.body.status,
          fieldName: res.body.fieldName
        }];
      this.existingDocuments = res.body.documentRelationList;
      this.existingDocumentsValues = res.body.documentRelationValueList;
      res.body.documentRelationValueList.forEach((selectedValues) => {
        this.sections.forEach(section => {
          section.items.forEach(item => {
            if (JSON.stringify(item.value) === JSON.stringify(selectedValues)) {
              item.inactive = true;
            }
          });
        });
      });
      this.additionalFieldForm.get('documentRelation').patchValue(this.existingDocumentsValues);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get document section list for dropdown
   */
  async getSectionList() {
    await this.additionalFieldService.getSectionListWithSelected(this.additionalFieldID).then((res) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.sections = res.body;
      }
    });
  }

  /**
   * This method use for open side drawer
   */
  openDrawer(additionalFieldId: number) {
    this.additionalFieldId = additionalFieldId;
    this.reset();
  }

  /**
   * This method use for load additional field data
   */
  loadAdditionalFieldData() {
    if (!this.additionalFieldId) {
      return;
    }

    this.additionalFieldService.getField(this.additionalFieldId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS !== res.status) {
        return;
      }
      const additionalFieldDetailDto: AdditionalFieldDetailDto = res.body;
      this.additionalFieldUtility.getSectionList();
      this.moduleId = additionalFieldDetailDto.moduleId;
      this.maxLength = additionalFieldDetailDto.maxLength;
      this.fieldId = additionalFieldDetailDto.fieldTypeId;
      this.additionalFieldService.getAdditionalFieldProperties(additionalFieldDetailDto.fieldTypeId).subscribe((res1: any) => {
        if (AppResponseStatus.STATUS_SUCCESS !== res1.status) {
          return;
        }
        this.additionalFieldProperties = res1.body;
        this.checkValidationFieldTypeProperties();

        const arr: any[] = [];
        if (res.body.multiple === 'A') {
          arr.push(1);
        }
        if (res.body.createNew === 'A') {
          arr.push(2);
        }

        this.additionalFieldForm.get('dropdownProperty').patchValue(arr);

        this.loadOptionFormControllers(additionalFieldDetailDto);

        this.additionalFieldForm.patchValue(additionalFieldDetailDto);

        if (additionalFieldDetailDto.fileTypes) {
          const tempArr: any[] = additionalFieldDetailDto.fileTypes.split(',');
          this.additionalFieldForm.get('fileTypes').patchValue(tempArr);
        }
        this.additionalFieldForm.get('documentRelation').patchValue(this.existingDocumentsValues);

      });
    });
  }

  /**
   * This method use for add option from controllers if exist
   * @param additionalFieldDetailDto AdditionalFieldDetailDto
   */
  loadOptionFormControllers(additionalFieldDetailDto: AdditionalFieldDetailDto) {
    for (const action of additionalFieldDetailDto.options) {
      this.addOptionFormController();
    }
  }


  /**
   * This method use for reset additional field
   */
  reset() {
    this.resetOption();
    this.additionalFieldForm.reset();

    this.additionalFieldProperties = [];

    this.removedOptions = [];

    this.isFieldNameLengthExceeds = false;
    this.isMaxlengthZero = false;
    this.isMaxlengthExceeds = false;
    this.isDisplayOrderZero = false;
    this.isRowCountZero = false;
    this.isRowCountExceeds = false;

    this.loadAdditionalFieldData();
  }

  /**
   * close edit dower
   */
  closeEditMode() {
    this.closeAdditionalFieldEditMode.emit(false);
  }

  openDatasourceEditDrawer() {
    this.dataSourceDrawer = true;
    this.selectedDataSourceId = this.additionalFieldForm.get('dataSourceId').value;
  }
}
