import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {UserService} from '../../../shared/services/user/user.service';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';

@Component({
  selector: 'app-add-vendor-users',
  templateUrl: './add-vendor-users.component.html',
  styleUrls: ['./add-vendor-users.component.scss']
})
export class AddVendorUsersComponent implements OnInit {

  @Input() vendorId;
  @Output() userAdded = new EventEmitter();
  public createUserForm: UntypedFormGroup;
  public loading = false;
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public commonUtil: CommonUtility = new CommonUtility();


  constructor(private notificationService: NotificationService, private userService: UserService,
              public formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.createUserForm = this.formBuilder.group({
      email: [AppConstant.NULL_VALUE, [Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      name: [AppConstant.NULL_VALUE, Validators.required],
      id: [],
      vendorId: [this.vendorId],
      nicPassportNo: [AppConstant.NULL_VALUE, Validators.compose([Validators.maxLength(50)])],
      telephoneNo: [AppConstant.NULL_VALUE, Validators.required],
    });
  }

  /**
   * This method can be used to submit form
   * @param createUserForm to form group instance
   */
  onSubmitForm(createUserForm) {
    if (!this.createUserForm.valid) {
      this.loading = false;
      new CommonUtility().validateForm(this.createUserForm);
      return;
    }
    const userObj = Object.assign({}, this.createUserForm.value);
    userObj.telephoneNo = this.commonUtil.getTelNo(this.createUserForm, 'telephoneNo');
    this.loading = true;
    this.userService.createVendorUser(userObj).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.loading = false;
        this.notificationService.successMessage(HttpResponseMessage.USER_CREATED_SUCCESSFULLY);
        this.createUserForm.reset();
        this.userAdded.emit(true);
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  resetUserForm() {
    this.createUserForm.reset();
    this.createUserForm.get('vendorId').patchValue(this.vendorId);
  }
}
