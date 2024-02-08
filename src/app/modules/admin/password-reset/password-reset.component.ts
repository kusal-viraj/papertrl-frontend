import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {MustMatch} from '../../../shared/helpers/password-validate';
import {UserService} from '../../../shared/services/user/user.service';
import {MessageService} from 'primeng/api';
import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';

export class PasswordResetDto {
  id: number;
  email: string;
  password: string;
  confirmPassword: string;
}



@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})


export class PasswordResetComponent implements OnInit {
  passwordResetForm: UntypedFormGroup;
  public passwordShow: boolean;
  public confirmPasswordShow: boolean;
  @Input() userMasterDto: UserMasterDto = new UserMasterDto();
  public passwordResetDto: PasswordResetDto = new PasswordResetDto();
  public email: any;
  public loading = false;
  constructor(public formBuilder: UntypedFormBuilder, public userService: UserService, public messageService: MessageService,
              public notificationService: NotificationService) { }
@Output() passwordChanged = new EventEmitter();
  ngOnInit(): void {
    this.passwordResetForm = this.formBuilder.group({
      password: [AppConstant.EMPTY_STRING,
        [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: [AppConstant.EMPTY_STRING, Validators.required],
      email: []
    }, {
      validator: [
        MustMatch('password', 'confirmPassword')
      ]
    });
  }

  /**
   * this method can be used to reset password form
   */

  formReset(){
    this.passwordResetForm.reset();
  }

  /**
   * reset password
   * @param value to form value
   */
  /**
   * password reset of user
   */
  resetPassword(){
    this.loading = true;
    let email: any;
    this.passwordResetDto.password = this.passwordResetForm.get('password').value;
    this.passwordResetDto.confirmPassword = this.passwordResetForm.get('confirmPassword').value;
    email = JSON.parse(JSON.stringify(this.userMasterDto))['usm.email'];
    this.passwordResetDto.email = email;
    if (this.passwordResetForm.valid) {
      this.userService.adminPasswordReset(this.passwordResetDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.loading = false;
          this.notificationService.successMessage(HttpResponseMessage.PASSWORD_CHANGED_SUCCESSFULLY);
          this.passwordChanged.emit();
          this.formReset();
        } else {
          this.loading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.loading = false;
        this.notificationService.errorMessage(error);
      });
    }else {
      this.loading = false;
      new CommonUtility().validateForm(this.passwordResetForm);
    }
  }
}
