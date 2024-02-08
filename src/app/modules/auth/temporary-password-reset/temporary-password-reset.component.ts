import {Component, HostListener, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MustMatch} from '../../../shared/helpers/password-validate';
import {OnFormClose} from '../../../shared/guards/on-form-close';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {TemporaryPasswordRequestDto} from '../../../shared/dto/auth/tempory-password/temporary-password-request-dto';
import {TemporaryPasswordService} from '../../../shared/services/auth/temporary-password.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {MessageService} from 'primeng/api';
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {isPlatformBrowser} from "@angular/common";
import {CommonUtility} from "../../../shared/utility/common-utility";

@Component({
  selector: 'app-temporary-password-reset',
  templateUrl: './temporary-password-reset.component.html',
  styleUrls: ['./temporary-password-reset.component.scss']
})
export class TemporaryPasswordResetComponent implements OnFormClose, OnInit {

  public passwordString = 'password';
  public confirmPassword = 'confirmPassword';
  public disableSubmitButton = false;

  public createNewPasswordForm: UntypedFormGroup;
  public passwordShow: boolean;
  public confirmPasswordShow: boolean;
  public tempPasswordRequestDto: TemporaryPasswordRequestDto = new TemporaryPasswordRequestDto();

  constructor(public router: Router, public formBuilder: UntypedFormBuilder, public activatedRoute: ActivatedRoute,
              public temporaryPasswordService: TemporaryPasswordService, public notificationService: NotificationService,
              @Inject(PLATFORM_ID) private platformId: any) {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    this.tempPasswordRequestDto.userName = queryParams.usd;
    this.tempPasswordRequestDto.oldPassword = queryParams.tkn;
  }

  ngOnInit(): void {
    this.createNewPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.compose([
        PatternValidator.patternValidator(/(.*).{10,}/, {minLength: true}),
        PatternValidator.patternValidator(/\d/, {hasNumber: true}),
        PatternValidator.patternValidator(/[A-Z]/, {hasCapitalCase: true}),
        PatternValidator.patternValidator(/[a-z]/, {hasSmallCase: true}),
        PatternValidator.patternValidator(/[!@#$%^&*()]/, {hasSpecialCharacters: true}),

      ])]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: [
        MustMatch(this.passwordString, this.confirmPassword)
      ]
    });
  }

  /**
   * This method fire when submit the request new token button
   */

  public newToken() {
    this.router.navigateByUrl('forgot-password');
  }

  /*
   * Main function to create a new password
   */
  public create() {
    this.tempPasswordRequestDto.confirmPassword = this.createNewPasswordForm.get(this.confirmPassword).value;
    this.tempPasswordRequestDto.password = this.createNewPasswordForm.get(this.passwordString).value;

    // Validate form before sending the request
    if (!this.createNewPasswordForm.valid) {
      new CommonUtility().validateForm(this.createNewPasswordForm);
      return;
    }

    this.disableSubmitButton = true;
    this.createPasswordRequest();
  }

  /*
   * Send create new password request
   */
  private createPasswordRequest() {
    this.temporaryPasswordService.createNewPassword(this.tempPasswordRequestDto).subscribe(
      (res) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.handleSuccessfulPasswordUpdate();
        } else {
          this.disableSubmitButton = false;
          this.notificationService.infoMessage(res.body.message);
        }
      },
      (error) => {
        this.disableSubmitButton = false;
        this.notificationService.errorMessage(error.body);
      }
    );
  }

  /*
   * Handle successful password update response
   */
  private handleSuccessfulPasswordUpdate() {
    this.notificationService.successMessage('Your Password Updated Successfully');

    // Detect device and platform for navigation
    if (isPlatformBrowser(this.platformId)) {
      this.navigateBasedOnDevice();
    } else {
      // Default case - navigate to login after 4 seconds
      this.navigateToLoginAfterDelay(4000);
    }
  }

  /*
   * Navigate user based on their device and platform
   */
  private navigateBasedOnDevice() {
    const userAgent = window.navigator.userAgent;
    const deviceDetails = new CommonUtility().detectDevice(userAgent);

    if (deviceDetails && deviceDetails.device === 'mobile' && deviceDetails.platform === 'ios') {
      this.navigateToAppDownloadAfterDelay(2000);
    } else {
      this.navigateToLoginAfterDelay(2000);
    }
  }

  /**
   * Navigate to App download page after a delay
   */
  private navigateToAppDownloadAfterDelay(delay: number) {
    setTimeout(() => this.router.navigate(['/app-download']), delay);
  }

  /**
   * Navigate to Login page after a delay
   */
  private navigateToLoginAfterDelay(delay: number) {
    setTimeout(() => this.router.navigate(['/login']), delay);
  }

  /**
   * This method can be used to get unload event in window
   * @param event to unload event
   */
  @HostListener('window:beforeunload', ['$event'])
  onbeforeunload(event) {
    if (this.createNewPasswordForm.dirty) {
      event.preventDefault();
      event.returnValue = false;
    }
  }

  /**
   * This method return dirty value of form
   */
  hasUnSavedData(): boolean {
    return this.createNewPasswordForm.dirty;
  }
}
