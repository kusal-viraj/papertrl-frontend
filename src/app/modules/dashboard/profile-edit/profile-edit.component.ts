import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {UserMasterDto} from "../../../shared/dto/user/user-master-dto";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {AppConstant} from "../../../shared/utility/app-constant";
import {CommonUtility} from "../../../shared/utility/common-utility";
import {NotificationService} from "../../../shared/services/notification/notification.service";
import {UserService} from "../../../shared/services/user/user.service";

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {

  @Input() userName;
  @Input() sessionUser;
  @Input() showInitials;
  @Input() initials;

  public profileForm: UntypedFormGroup;
  public dimensionError = false;
  public fileSizeError = false;
  public invalidFileTypeError = false;
  public btnProfileUpdate = false;

  constructor(public formBuilder: UntypedFormBuilder, public notificationService: NotificationService, public userService: UserService) {
  }

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      id: [null, Validators.required],
      name: [null, Validators.required],
      proPic: [null],
      profilePic: [null],
    });
    this.profileForm.patchValue(this.sessionUser);
  }

  /**
   * Reset Profile Form
   */
  resetProfileForm() {
    this.profileForm.reset();
    this.dimensionError = false;
    this.fileSizeError = false;
    this.invalidFileTypeError = false;
    this.profileForm.patchValue(this.sessionUser);
  }

  /**
   * Update Profile Form
   */
  updateProfile() {
    this.btnProfileUpdate = true;
    if (this.profileForm.valid && !this.dimensionError && !this.fileSizeError && !this.invalidFileTypeError) {
      let user: UserMasterDto = new UserMasterDto();
      user = this.sessionUser;
      user.name = this.profileForm.get('name').value;
      if (this.profileForm.get('profilePic').value) {
        user.profilePic = this.profileForm.get('profilePic').value;
      }
      this.userService.updateUserProfile(user).subscribe((res: any) => {
          this.notificationService.successMessage(HttpResponseMessage.PROFILE_UPDATED_SUCCESSFULLY);
          this.sessionUser = user;
          this.userName = user.name;
          const sessionUser = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
          if (user.profilePic) {
            // this.userService.downloadProfilePic(this.sessionUser);
            this.showInitials = false;
            this.btnProfileUpdate = false;
          } else if (!sessionUser.propicId) {
            this.showInitials = true;
            this.btnProfileUpdate = false;
          }
          this.btnProfileUpdate = false;
          this.userService.getUpdatedProfilePicPath.next(this.sessionUser)
        },
        error => {
          this.btnProfileUpdate = false;
          this.notificationService.errorMessage(error);
        });
    } else {
      this.btnProfileUpdate = false;
      new CommonUtility().validateForm(this.profileForm);
    }
  }

  /**
   * On Profile Image Changed
   */
  onFileChange(event) {
    if (event.target.files[0]) {
      this.dimensionError = false;
      this.invalidFileTypeError = false;
      this.fileSizeError = false;

      if (this.checkImageValidType(event.target.files[0])) {

        const URL = window.URL || window.webkitURL;
        const img = new Image();
        const filesToUpload = (event.target.files[0]);
        img.src = URL.createObjectURL(filesToUpload);
        img.onload = (e: any) => {
          this.checkImageValidSize(event.target.files[0], img);
        };
      } else {
        this.invalidFileTypeError = true;
      }
    }
  }

  checkImageValidType(event) {
    const contentType: string = event.type;
    return AppConstant.SUPPORTING_PRO_PIC_TYPES.includes(contentType);
  }

  checkImageValidSize(event, img) {
    if ((event.size / 1024 / 1024) < AppConstant.MAX_PROPIC_SIZE) {
      this.checkImageValidDimension(event, img.height, img.width);
    } else {
      this.fileSizeError = true;
    }
  }

  checkImageValidDimension(event, height, width) {
    if ((width * 2) > height) {
      this.setImageToForm(event);
    } else {
      this.dimensionError = true;
    }
  }

  setImageToForm(event) {
    this.profileForm.patchValue({
      profilePic: event
    });
  }

  checkValidation(name) {
    if (this.profileForm.get(name).value[0] === ' ') {
      this.profileForm.get(name).patchValue('');
    }
  }

}
