import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {UserUtility} from '../../admin/user-utility/user-utility';
import {UserService} from '../../../shared/services/user/user.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {MessageService} from 'primeng/api';
import {AppConstant} from '../../../shared/utility/app-constant';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {MustMatch} from '../../../shared/helpers/password-validate';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {DepartmentService} from '../../../shared/services/department/department.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  public createUserForm: UntypedFormGroup;
  public userMasterDto: UserMasterDto = new UserMasterDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public approvalGroups: DropdownDto = new DropdownDto();
  public roles: DropdownDto = new DropdownDto();
  public statuses: DropdownDto[] = [];

  public commonUtil = new CommonUtility();
  public file: File [] = [];
  public userUtility = new UserUtility(this.messageService, this.userService, this.privilegeService, this.notificationService, this.departmentService, this.billsService);
  public createRole: boolean;
  public approvalGroupPanel: any;
  public passwordShow: boolean;
  public confirmPasswordShow: boolean;
  public displayRoles: boolean;
  public roleName: any;
  public roleId: any;
  public viewRole: boolean;
  @Output() emittedTabIndex = new EventEmitter();
  @Output() refreshTable = new EventEmitter();
  @Input() panel: boolean;
  @Input() id: any;
  @Input() detailView: any;
  @Input() editView: any;
  @ViewChild('profilePicture')
  public proPicLabel: ElementRef;
  input: any;
  public isEmailAvailable = true;
  public approvalGroupsNameArray: string[] = [];
  public proPicName: string;
  public loading = false;
  public isPortal = false;
  public createPortalRole = false;
  public roleIdBeforAddNew: any;
  public portalViewRole: boolean;
  public appAuthorities = AppAuthorities;
  public countries: DropdownDto = new DropdownDto();
  public showAddress = false;
  public states = [];
  public cities = [];
  public filteredGroups: any[];
  public recipientType: DropdownDto = new DropdownDto();
  public accountType: DropdownDto = new DropdownDto();

  constructor(public formBuilder: UntypedFormBuilder, public userService: UserService, public notificationService: NotificationService,
              public messageService: MessageService, public changeDetect: ChangeDetectorRef, public privilegeService: PrivilegeService,
              public departmentService: DepartmentService, public billsService: BillsService, public vendorService: VendorService) {
    this.userUtility.getDepartmentData();
    this.userUtility.getApprovalGroupsWithNoApproval(this.userUtility.approvalGroups, true, !this.editView && !this.detailView);
    this.getRoles(this.roles, true, 0, false);
  }

  ngOnInit(): void {
    this.isPortal = this.privilegeService.isPortal();
    this.createUserForm = this.formBuilder.group({
      email: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, [Validators.required, Validators.compose([
        PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      name: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      nicPassportNo: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView
      }, Validators.compose([Validators.maxLength(50)])],
      profilePic: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      approvalGroups: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      approvalGroupNames: [],
      roleIdList: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      status: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      password: [{value: AppConstant.NULL_VALUE, disabled: this.detailView},
        [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      id: [],
      file: [],
      telephoneNo: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView
      }, Validators.required],
      appGroups: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      addressLine1: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      addressLine2: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      city: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      state: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      zipCode: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.compose([Validators.maxLength(30)])],
      country: [{value: AppEnumConstants.DEFAULT_COUNTRY, disabled: this.detailView}, Validators.required],
      rAddressLine1: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      rAddressLine2: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      rCity: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      rState: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      rZipCode: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.compose([Validators.maxLength(30)])],
      rCountry: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      recipientFirstName: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      recipientLastName: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      recipientType: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      accountType: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      accountNumber: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      accountRoutingNumber: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}]
    }, {
      validator: [
        MustMatch('password', 'confirmPassword')
      ]
    });
    this.userService.getStatuses().subscribe((res) => {
      this.statuses = (res.body);
    });

    this.createUserForm.valueChanges.subscribe((formValues) => {
      this.userMasterDto = formValues;
    });

    this.vendorService.getCountries().subscribe((res) => {
      this.countries.data = res.body;
    });
    this.vendorService.getCities().subscribe((res) => {
      this.cities = (res.body);
    });
    this.vendorService.getStates().subscribe((res) => {
      this.states = (res.body);
    });
    this.createUserForm.get('country').patchValue(AppEnumConstants.DEFAULT_COUNTRY);
    this.accountType.data = AppConstant.PAYMENT_ACCOUNT_TYPES;
    this.recipientType.data = AppConstant.PAYMENT_RECIPIENT_TYPES;
    if (!this.panel) {
      this.setDefaultValue();
    }
    this.getUserData();
  }

  /**
   * get roles
   * @param listInstance to dropdown dto
   * @param isAddNew to whether available add new
   * @param userId
   * @param isSearch
   */
  getRoles(listInstance: DropdownDto, isAddNew, userId, isSearch) {
    this.userService.getRoles(userId, isSearch, true).subscribe((res: any) => {
      listInstance.data = (res.body);
      if (isAddNew && this.privilegeService.isAuthorized(AppAuthorities.ROLES_CREATE)) {
        listInstance.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method can be used to get user data
   */
  getUserData() {
    if (this.editView || this.detailView) {
      this.userService.getUser(this.id).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.createUserForm.patchValue(res.body);
          this.approvalGroupsNameArray = res.body.approvalGroupNames;
          this.proPicName = res.body.proPicName;
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method can be used to submit form
   * @param createUserForm to form group instance
   */
  onSubmitForm(createUserForm) {
    this.loading = true;
    this.userMasterDto = Object.assign(this.userMasterDto, createUserForm);
    this.userMasterDto.telephoneNo = this.commonUtil.getTelNo(this.createUserForm, 'telephoneNo');
    if (this.createUserForm.valid && this.isEmailAvailable) {
      if (this.userMasterDto.approvalGroups[0] === 0) {
        this.userMasterDto.approvalGroups.splice(0, 1);
      }
      this.createUser(this.userMasterDto);
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.createUserForm);
    }
  }

  /**
   * This method can be used to upload user profilePic
   * @param event to change event
   */
  onFileChange(event) {
    this.createUserForm.patchValue({
      file: event.target.files[0]
    });
    this.createUserForm.value.profilePic = this.createUserForm.get('file').value;
    this.userMasterDto = this.createUserForm.value;
    if (this.userUtility.isValidFile(event, this.userMasterDto)) {
      this.proPicLabel.nativeElement.innerText = this.userMasterDto.profilePic.name;
    } else {
      this.createUserForm.get('profilePic').reset();
    }
  }

  /**
   * This method can be used to reset user create form
   */
  resetUserForm() {
    this.isEmailAvailable = true;
    this.createUserForm.reset();
    if (!this.editView) {
      this.setDefaultValue();
    } else {
      this.getUserData();
    }
  }

  /**
   * Approval Group View Clicked from Dropdown
   */
  viewRoleClicked(approvalGroups) {
    this.roleId = approvalGroups.id;
    if (this.isPortal) {
      this.portalViewRole = true;
    } else {
      this.viewRole = true;
    }
    this.approvalGroupPanel = false;
    this.displayRoles = false;
    this.createRole = false;
  }

  /**
   * Add New Role
   */
  addNewRoleClicked() {
      if (this.isPortal) {
        this.createPortalRole = true;
      } else {
        this.createRole = true;
      }
      this.approvalGroupPanel = false;
      this.displayRoles = false;
      this.viewRole = false;
  }

  /**
   * Show All Role Privileges
   */
  showAllRolePrivileges() {
    this.displayRoles = true;
    this.approvalGroupPanel = false;
    this.createRole = false;
    this.viewRole = false;
    // this.nodeService.getFiles().then(files => this.files1 = files);
  }

  /**
   * Add New Approval Group
   */
  addNewApprovalGroup(e) {
    try {
      if (e.itemValue === 0) {
        this.approvalGroupPanel = true;
        this.displayRoles = false;
        this.createRole = false;
        this.viewRole = false;
        setTimeout(() => {
          this.createUserForm.controls.approvalGroups.reset();
        }, 100);
      }
    } catch (error) {
    }
  }

  /**
   * this method can be used to update user data
   */
  updateUser(userDto) {
    this.loading = true;
    userDto.profilePic = userDto.file;
    userDto.file = [];
    const password = this.createUserForm.get('password').clearValidators();
    const confirmPassword = this.createUserForm.get('confirmPassword').clearValidators();
    this.createUserForm.patchValue({password, confirmPassword});
    if (this.createUserForm.valid) {
      this.loading = false;
      userDto.id = this.id;
      this.userService.updateUser(userDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.USER_UPDATED_SUCCESSFULLY);
          this.refreshTable.emit('USER_UPDATED');
        } else {
          this.loading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.loading = false;
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * this method can be used to create new user
   */
  createUser(userDto) {
    userDto.profilePic = userDto.file;
    userDto.file = [];
    this.userService.createUser(userDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_CREATED) {
        this.loading = false;
        if (res?.body?.message){
          this.notificationService.infoMessage(res.body.message);
        }
        this.notificationService.successMessage(HttpResponseMessage.USER_CREATED_SUCCESSFULLY);
        this.createUserForm.reset();
        this.refreshTable.emit('USER_UPDATED');
        this.emittedTabIndex.emit({tabIndex: 0, visible: true});
      } else {
        this.loading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.loading = false;
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to check approval group name availability
   * @param value to form value
   */
  checkAvailability(value) {
    this.userMasterDto = Object.assign(this.userMasterDto, value);
    if (this.userMasterDto.email !== AppConstant.EMPTY_SPACE) {
      this.userService.checkUserEmailAvailability(this.userMasterDto.email).subscribe((res: any) => {
          this.isEmailAvailable = res.body;
        },
        error => {
          this.notificationService.errorMessage(error);
        });
    }
  }

  /**
   * get default value
   */
  setDefaultValue() {
    setTimeout(() => {
      const arr: any[] = [];
      this.userUtility.approvalGroups.data.forEach(value => {
        if (value.name === AppConstant.NO_APPROVAL_GROUP_NAME) {
          arr.push(value.id);
        }
      });
      this.createUserForm.get('approvalGroups').patchValue(arr);
    }, 1500);
  }

  /**
   * this method used to get updated approval group
   * @param event to value
   */
  updatedApprovalGroups(event) {
    if (event != null || event !== undefined) {
      this.userUtility.getApprovalGroupsWithNoApproval(this.userUtility.approvalGroups, true, !this.editView && !this.detailView);
    }
  }

  filterStates(event) {
    const query = event.query;
    const filtered = [];
    this.states.forEach(state => {
      if (state.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(state);
      }
    });
    this.filteredGroups = filtered;
  }


  /**
   * Auto Complete Cities
   */
  filterCities(event) {
    const query = event.query;
    const filtered = [];
    this.cities.forEach(city => {
      if (city.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(city);
      }
    });
    this.filteredGroups = filtered;
  }

  showRemitAddress(event) {
    this.showAddress = event.checked;
  }

  isHidden() {
    return this.privilegeService.isVendor() || this.privilegeService.isSupport();
  }
}
