import {AbstractControl, FormGroup, Validators, ɵTypedOrUntyped} from '@angular/forms';
import {AdditionalFieldService} from '../services/additional-field-service/additional-field-service.';
import {AppModuleSection} from '../enums/app-module-section';
import {AppResponseStatus} from '../enums/app-response-status';
import {NotificationService} from '../services/notification/notification.service';
import {AppFormConstants} from '../enums/app-form-constants';

export class MandatoryFields {

  appFormConstants = AppFormConstants;
  appModuleSection = AppModuleSection;
  mandatoryFields: any [] = [];

  constructor(public additionalFieldService: AdditionalFieldService, public notificationService: NotificationService) {}


  /**
   * Retrieves the required fields for a given module and checks if they are enabled in the master data input section of the form.
   * If enabled, the fields are marked as required.
   * @param form The form to update.
   * @param moduleId The ID of the module to retrieve the mandatory fields for.
   */
  getRequiredFields(form, moduleId: number) {
    this.additionalFieldService.fieldsMandatory(moduleId).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.mandatoryFields = res.body;
        for (const item of this.mandatoryFields) {
          if (item.sectionId !== this.appModuleSection.MASTER_DATA_INPUT_SECTION_ID || !item.enable) {continue; }
          this.checkRequired(form, item.fieldCode);
        }
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    });
  }


  /**
   * Sets the 'required' validator on the specified form control and updates its value and validity.
   * @param form The form that contains the control to update.
   * @param field The name of the control to update.
   */
  checkRequired(form, field) {
    form.get(field)?.setValidators([Validators.required]);
    form.get(field)?.updateValueAndValidity();
  }

  /**
   * Returns true if the specified control has the 'required' validator and false otherwise.
   * @param form The form that contains the control to check.
   * @param field The name of the control to check.
   */
  isAsteriskMarkShown(form, field): boolean {
    const controller = form[field];
    if (!controller.validator) {
      return false;
    }
    const validator = controller.validator({} as AbstractControl);
    return (validator && validator.required);
  }


  /**
   * Returns true if the specified field is mandatory for the specified section and false otherwise.
   * @param field The name of the field to check.
   * @param section The ID of the section to check.
   */
  isLineItemAsteriskMark(field: string, section: number): boolean {
    return  this.mandatoryFields?.find(e => (
      e.sectionId === section && e.fieldCode === field && e.enable
      )) !== undefined;
  }

}

