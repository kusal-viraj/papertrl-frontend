import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';

@Component({
  selector: 'app-automation-email-config',
  templateUrl: './automation-email-config.component.html',
  styleUrls: ['./automation-email-config.component.scss']
})
export class AutomationEmailConfigComponent implements OnInit, OnDestroy {

  private expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);

  @Output()
  public addNew: EventEmitter<any> = new EventEmitter();
  @Input()
  public actionIndex: number;
  @Input()
  public automationForm: UntypedFormGroup;
  @Input()
  public isDetailView: boolean;


  constructor(public formBuilder: UntypedFormBuilder) {
  }

  ngOnDestroy(): void {
    this.addEmailNotificationController(false);
  }

  ngOnInit(): void {
    this.addEmailNotificationController(true);
  }

  /**
   * This method use for add new form controller group for email notification
   */
  addEmailNotificationController(validatable: boolean) {
    if (!this.automationActionConfig.controls[this.actionIndex]){
      return;
    }
    const emailAddress = this.emailConfig.get('emailAddress');
    const emailSubject = this.emailConfig.get('emailSubject');
    const emailContent = this.emailConfig.get('emailContent');

    if (validatable) {
      emailAddress.setValidators([Validators.required, this.commaSepEmail]);
      emailSubject.setValidators(Validators.required);
      emailContent.setValidators(Validators.required);
    } else {
      emailAddress.clearValidators();
      emailSubject.clearValidators();
      emailContent.clearValidators();
    }
    emailAddress.updateValueAndValidity();
    emailSubject.updateValueAndValidity();
    emailContent.updateValueAndValidity();
  }

  /**
   * Comma Separated Email Validator
   * @param control email
   */
  commaSepEmail = (control: AbstractControl): { [key: string]: any } | null => {
    let validation = false;
    try {
      const emails = control.value.split(',').map(e=>e.trim());
      emails.some(email => {
        email.match(this.expression) ? validation = false : validation = true;
      });
    } catch (e) {

    }
    return validation ? { 'emailAddress': { value: control.value } } : null;
  };

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
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get emailConfig() {
    return this.automationActionConfig.controls[this.actionIndex].get('emailConfig') as UntypedFormGroup;
  }

  /**
   * This method can use for get approvalSequence FormArray from controllers
   */
  public get automationActionConfig() {
    return this.automationForm.get('automationActions') as UntypedFormArray;
  }


  /**
   * This method use for call add new action dropdown in automation creation screen
   */
  addActionDropDown() {
    this.addNew.emit();
  }


}
