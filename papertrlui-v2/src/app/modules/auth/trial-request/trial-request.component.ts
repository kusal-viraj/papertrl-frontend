import {Component, HostListener} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppConstant} from '../../../shared/utility/app-constant';
import {TrailService} from '../../../shared/services/auth/trail.service';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {CommonUtility} from "../../../shared/utility/common-utility";


@Component({
  selector: 'app-trial-request',
  templateUrl: './trial-request.component.html',
  styleUrls: ['./trial-request.component.scss']
})
export class TrialRequestComponent {

  public trialRequestForm: UntypedFormGroup;
  public isUniqEmail = true;
  public disableSubmitButton = false;
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);

  constructor(public formBuilder: UntypedFormBuilder, public trialService: TrailService, private notificationService: NotificationService) {
    this.trialRequestForm = this.formBuilder.group({
      firstName: [AppConstant.EMPTY_STRING, Validators.required],
      lastName: [AppConstant.EMPTY_STRING, Validators.required],
      companyName: [AppConstant.EMPTY_STRING, Validators.required],
      emailAddress: [AppConstant.EMPTY_STRING, [Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      phoneNumber: [AppConstant.EMPTY_STRING, Validators.required],
    });
  }

  /**
   * This method will return form controls
   */
  get f() {
    return this.trialRequestForm.controls;
  }

  /**
   * This method will get trigger when someone fill the trial request form and submit it
   * @param value form data
   */
  submit(value) {
    if (!this.trialRequestForm.valid) {
      const controls = this.trialRequestForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          this.trialRequestForm.get(name).markAsDirty();
        }
      }
      return;
    }
    this.disableSubmitButton = true;
    value.phoneNumber = new CommonUtility().getTelNo(this.trialRequestForm, 'phoneNumber');
    this.trialService.requestTrial(value).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_CREATED === res.status) {
        document.location.href = AppConstant.PAPERTRL_THANKS_PAGE_URL;
      } else {
        this.disableSubmitButton = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.disableSubmitButton = false;
      this.notificationService.errorMessage(error);
    });

  }

  /**
   * This method can used to check whether the entered email adress already exist or not
   */
  checkEmailAvailability() {
    this.trialService.checkEmailAddressAvailability(this.trialRequestForm.get('emailAddress').value).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
        this.isUniqEmail = res.body;
      }
    });
  }

}
