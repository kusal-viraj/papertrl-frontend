import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {UserService} from "../../../shared/services/user/user.service";
import {AppConstant} from "../../../shared/utility/app-constant";
import {MustMatch} from "../../../shared/helpers/password-validate";

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  public passwordResetForm: UntypedFormGroup;
  public passwordShow = false;
  public confirmPasswordShow = false;
  public currentPassword = false;
  public btnPasswordUpdate = false;

  constructor(public notificationService: NotificationService, public userService: UserService, public formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    this.passwordResetForm = this.formBuilder.group({
      oldPassword: [AppConstant.NULL_VALUE, Validators.required],
      password: [AppConstant.NULL_VALUE,
        [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: [AppConstant.NULL_VALUE, Validators.required],
    }, {
      validator: [
        MustMatch('password', 'confirmPassword')
      ]
    });
  }

  /**
   * Reset Password Clicked
   */
  resetPassword() {
    this.btnPasswordUpdate = true;
    if (this.passwordResetForm.valid) {
      if (this.passwordResetForm.get('oldPassword').value !== this.passwordResetForm.get('password').value) {
        this.userService.ownPasswordReset(this.passwordResetForm.value).subscribe((res: any) => {
            if (res.status === 200) {
              this.passwordResetForm.reset();
              this.btnPasswordUpdate = false;
              this.notificationService.successMessage(HttpResponseMessage.PASSWORD_CHANGED_SUCCESSFULLY);
            } else {
              this.btnPasswordUpdate = false;
              this.notificationService.infoMessage(res.body.message);
            }
          },
          error => {
            this.btnPasswordUpdate = false;
            this.notificationService.errorMessage(error);
          });
      } else {
        this.btnPasswordUpdate = false;
        this.notificationService.infoMessage(HttpResponseMessage.CURRENT_PASSWORD_MUST_BE_DIFFERENT);
      }
    } else {
      this.btnPasswordUpdate = false;
      new CommonUtility().validateForm(this.passwordResetForm);
    }
  }
}
