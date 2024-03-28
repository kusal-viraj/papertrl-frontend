import {Component, HostListener, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {OnFormClose} from '../../../shared/guards/on-form-close';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {ForgotPasswordResetRequestDto} from '../../../shared/dto/auth/forogot-password-reset/forgot-password-reset-request-dto';
import {ForgotPasswordService} from '../../../shared/services/auth/forgot-password.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {Router} from '@angular/router';
import {ApiEndPoint} from "../../../shared/utility/api-end-point";

@Component({
  selector: 'app-forgot-password-reset',
  templateUrl: './forgot-password-reset.component.html',
  styleUrls: ['./forgot-password-reset.component.scss']
})
export class ForgotPasswordResetComponent implements OnFormClose, OnInit {

  public passwordResetForm: UntypedFormGroup;
  public forgotPasswordRequestDto: ForgotPasswordResetRequestDto;
  public disableSubmitButton = false;

  constructor(public router: Router, public formBuilder: UntypedFormBuilder, private messageService: MessageService,
              private forgotPasswordService: ForgotPasswordService) {
  }

  /**
   * This method return form dirty value
   */
  public hasUnSavedData(): boolean {
    return this.passwordResetForm.dirty;
  }

  ngOnInit(): void {
    this.passwordResetForm = this.formBuilder.group({
      email: ['', [Validators.required]]
    });
  }

  /**
   * This method fire when change window before unload
   * @param event to beforeunload event
   */


  /**
   * This method can be used to send reset link o the user
   * @param data to form data
   */
  public sendLink(data) {
    this.forgotPasswordRequestDto = data;
    if (this.passwordResetForm.valid) {

      this.disableSubmitButton = true;
      this.forgotPasswordService.forgotPasswordResetRequest(this.forgotPasswordRequestDto).subscribe((res) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.messageService.add({
            severity: 'success',
            summary: 'Password Reset Link Has Been Sent To Your Email Address',
            detail: 'You are redirecting to the login page...',
            life: 6000
          });
          setTimeout(() =>
              this.router.navigate(['/login']),
            6000);

        } else {

          this.disableSubmitButton = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'Attention Please',
            detail: res.body.message,
            life: 4000
          });

        }
      }, error => {
        this.disableSubmitButton = false;
        this.messageService.add({severity: 'error', summary: 'System Error', detail: error.body});
      });
    } else {
      const controls = this.passwordResetForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          this.passwordResetForm.get(name).markAsDirty();
        }
      }
    }
  }

  /**
   * Back to login
   */
  loginRedirect() {
    this.router.navigate(['/login']);
  }
}
