import {AppConstant} from '../utility/app-constant';

export class RemoveSpace {

  /**
   * this method can be used to validate empty space in the form fields
   * @param form to main reactive form
   * @param controlName to field form controller name
   */
  clearSpace(form, controlName) {
    if (!form.get(controlName).value) {
      return;
    } else {
      let value = form.get(controlName).value;
      value = String(value)?.trim();
      if (!value) {
        if (value === AppConstant.EMPTY_SPACE || value === AppConstant.EMPTY_STRING) {
          form.get(controlName).patchValue(AppConstant.EMPTY_STRING);
        }
      }
    }
  }
}
