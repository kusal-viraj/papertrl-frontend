import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MustMatch} from '../../../shared/helpers/password-validate';
import {UserService} from '../../../shared/services/user/user.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppPatternValidations} from '../../../shared/enums/app-pattern-validations';
import {PatternValidator} from '../../../shared/helpers/pattern-validator';
import {AppConstant} from '../../../shared/utility/app-constant';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {UserMasterDto} from '../../../shared/dto/user/user-master-dto';
import {UserUtility} from '../user-utility/user-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {DepartmentService} from '../../../shared/services/department/department.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {VendorService} from '../../../shared/services/vendors/vendor.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {PaymentTypeService} from '../../../shared/services/support/payment-type.service';
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {PaymentService} from "../../../shared/services/payments/payment.service";

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})

export class UserCreateComponent implements OnInit, AfterViewInit {
  public userUtility = new UserUtility(this.messageService, this.userService, this.privilegeService,
    this.notificationService, this.departmentService, this.billsService);

  @Output() emittedTabIndex = new EventEmitter();
  @Output() refreshTable = new EventEmitter();
  @Input() panel: boolean;
  @Input() id: any;
  @Input() detailView: any;
  @Input() editView: any;
  @ViewChild('profilePicture')
  public proPicLabel: ElementRef;
  @ViewChild('email') public email: ElementRef;
  public document = document;

  public createRole: boolean;
  public approvalGroupPanel: any;
  public passwordShow: boolean;
  public confirmPasswordShow: boolean;
  public displayRoles: boolean;
  public roleName: any;
  public roleId: any;
  public viewRole: boolean;
  public portalViewRole: boolean;
  input: any;
  public isEmailAvailable = true;
  public approvalGroupsNameArray: string[] = [];
  public proPicName: string;
  public isNotVendor = true;
  public btnLoading = false;
  public createPortalRole = false;
  public isPortal = false;
  public showAddress = false;
  public isSelectedPaymentTypeAsCheckAndVirtualCard = false;
  public userId;

  public states = [];
  public cities = [];
  public filteredGroups: any[];
  public file: File [] = [];
  public appAuthorities = AppAuthorities;
  public roles: DropdownDto = new DropdownDto();
  public countries: DropdownDto = new DropdownDto();
  public recipientType: DropdownDto = new DropdownDto();
  public accountType: DropdownDto = new DropdownDto();
  public allPaymentTypeList: DropdownDto = new DropdownDto();
  public selectedPaymentTypes: DropdownDto = new DropdownDto();
  public paymentProviders: DropdownDto = new DropdownDto();
  public createUserForm: UntypedFormGroup;
  public userMasterDto: UserMasterDto = new UserMasterDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public appConstant = new AppConstant();
  public expression = new RegExp(AppPatternValidations.EMAIL_PATTERN);
  public approvalGroups: DropdownDto = new DropdownDto();
  public statuses: DropdownDto[] = [];
  public paymentMailOption: any[] = [];
  public commonUtil = new CommonUtility();

  constructor(public formBuilder: UntypedFormBuilder, public userService: UserService, public notificationService: NotificationService,
              public messageService: MessageService, public privilegeService: PrivilegeService,
              public departmentService: DepartmentService, public billsService: BillsService, public vendorService: VendorService,
              public paymentTypeService: PaymentTypeService, public paymentService: PaymentService) {
    this.getPaymentDropDownList();
    this.getPaymentProviders();
  }

  ngOnInit(): void {
    this.isPortal = this.privilegeService.isPortal();
    const user = JSON.parse(localStorage.getItem('user'));
    this.isNotVendor = !user.vendorId;
    if (!this.editView) {
      this.editView = false;
    }
    this.userUtility.getDepartmentData();
    this.accountType.data = AppConstant.PAYMENT_ACCOUNT_TYPES;
    this.recipientType.data = AppConstant.PAYMENT_RECIPIENT_TYPES;
    this.userId = this.editView ? this.id : 0;
    this.getRoles(this.roles, !this.detailView, this.userId, false);
    this.userUtility.getApprovalGroupsWithNoApproval(this.userUtility.approvalGroups, !this.detailView, !this.editView && !this.detailView);
    this.vendorService.getCountries().subscribe((res) => {
      this.countries.data = res.body;
    });
    this.vendorService.getCities().subscribe((res) => {
      this.cities = (res.body);
    });
    this.vendorService.getStates().subscribe((res) => {
      this.states = (res.body);
    });
    this.userService.getStatuses().subscribe((res) => {
      this.statuses = (res.body);
    });
    this.initFormGroup();
    this.createUserForm.valueChanges.subscribe((formValues) => {
      this.userMasterDto = formValues;
    });
    this.createUserForm.get('country').patchValue(AppEnumConstants.DEFAULT_COUNTRY);
    if (!this.editView && !this.detailView) {
      this.setDefaultValue();
    }
    this.getUserData();
    this.focusFirstElementAfterTabChange();
    this.getMailOptionStatus();
  }

  /**
   * get roles
   * @param listInstance to dropdown dto
   * @param isAddNew to whether available add new
   * @param userId
   * @param isSearch
   */
  getRoles(listInstance: DropdownDto, isAddNew, userId, isSearch) {
    this.userService.getRoles(userId, isSearch, false).subscribe((res: any) => {
      listInstance.data = (res.body);
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * this method can be used to initialize form group
   */
  initFormGroup() {
    this.createUserForm = this.formBuilder.group({
      email: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView || this.editView
      }, [Validators.required, Validators.compose([PatternValidator.patternValidator(this.expression, {emailValidate: true})])]],
      name: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      nicPassportNo: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView
      }, Validators.compose([Validators.maxLength(50)])],
      telephoneNo: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView
      }, Validators.required],
      profilePic: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      approvalGroups: [{value: AppConstant.NULL_VALUE}, this.isNotVendor ? Validators.required : null],
      approvalGroupNames: [],
      roleId: 1,
      roleIdList: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      status: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      password: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView
      }, [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}, Validators.required],
      id: [],
      file: [],
      appGroups: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      departments: [AppConstant.NULL_VALUE],
      addressLine1: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      addressLine2: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      city: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      state: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      zipCode: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView
      }, Validators.compose([Validators.maxLength(30)])],
      country: [{value: AppEnumConstants.DEFAULT_COUNTRY, disabled: this.detailView}, Validators.required],
      rAddressLine1: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      rAddressLine2: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      rCity: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      rState: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      rZipCode: [{
        value: AppConstant.NULL_VALUE,
        disabled: this.detailView
      }, Validators.compose([Validators.maxLength(30)])],
      rCountry: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      recipientFirstName: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      recipientLastName: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      recipientType: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      accountType: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      accountNumber: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      accountRoutingNumber: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      preferredPaymentTypeId: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      showRemit: [{value: false, disabled: this.detailView}],
      mailOption: [{value: AppConstant.ONE, disabled: this.detailView}],
      checkToBeMail: [{value: false, disabled: this.detailView}],
      acceptedPaymentTypes: this.formBuilder.array([]),
    }, {
      validator: [
        MustMatch('password', 'confirmPassword')
      ]
    });

    this.createUserForm.get('showRemit').valueChanges.subscribe(value => {
      if (this.createUserForm.get('showRemit').value) {
        this.createUserForm.get('rCountry').setValidators([Validators.required]);
      } else {
        this.createUserForm.get('rCountry').clearValidators();
        this.createUserForm.get('rCountry').reset();
      }
      this.createUserForm.get('rCountry').updateValueAndValidity();
    });
  }

  /**
   * This method can be used to get user data
   */
  getUserData() {
    if (this.editView || this.detailView) {
      this.userService.getUser(this.id).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          const arr = [];
          this.acceptedPaymentTypes.controls.forEach((x, index) => {
            const tempType = res.body.acceptedPaymentTypes.find(r => r?.paymentTypeId === x.get('paymentTypeId').value);
            if (tempType) {
              arr[index] = {
                paymentTypeId: tempType.paymentTypeId,
                selected: true,
                providerId: tempType.providerId
              };
            }
          });
          res.body.acceptedPaymentTypes = arr;
          this.createUserForm.patchValue(res.body);
          this.setPreferredPaymentType();
          this.commonUtil.onAcceptedPaymentTypesChange(res.body?.acceptedPaymentTypes);

          if (res.body.rAddressLine1 || res.body.rAddressLine2 || res.body.rCity || res.body.rState || res.body.rZipCode ||
            res.body.rCountry) {
            this.createUserForm.get('showRemit').patchValue(true);
          }
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
    this.btnLoading = true;
    this.userMasterDto = Object.assign(this.userMasterDto, createUserForm);
    this.userMasterDto.telephoneNo = this.commonUtil.getTelNo(this.createUserForm, 'telephoneNo');
    if (this.createUserForm.valid && this.isEmailAvailable) {
      if (this.isNotVendor) {
        if (this.userMasterDto.approvalGroups[0] === 0) {
          this.userMasterDto.approvalGroups.splice(0, 1);
        }
      }
      this.createUser(this.userMasterDto);
    } else {
      this.btnLoading = false;
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
    this.acceptedPaymentTypes.controls = [];
    this.createUserForm.reset();
    this.setAcceptedPaymentTypeForm();
    this.createUserForm.get('country').patchValue(AppEnumConstants.DEFAULT_COUNTRY);
    if (!this.editView) {
      this.setDefaultValue();
    } else {
      this.getUserData();
    }
  }

  /**
   * Approval Group View Clicked from Dropdown
   * @param approvalGroups selected value
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
   * This method use for view additional option input drawer
   * @param event to change event
   * @param multiSelect to multiSelect dropdown
   */
  approvalGroupChanged(event: any, multiSelect) {
    if (multiSelect.allChecked) {

      let idArray: number [] = [];
      idArray = this.createUserForm.get('approvalGroups').value;
      idArray.forEach((value, index) => {
        if (idArray[0] === 0) {
          idArray.splice(index, 1);
        }
      });

      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = true;
        }
      });
    } else if (!multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.disabled = false;
        }
      });
    }
  }


  /**
   * this method can be used to update user data
   */
  updateUser(userDto) {
    this.btnLoading = true;
    userDto.profilePic = userDto.file;
    userDto.telephoneNo = this.commonUtil.getTelNo(this.createUserForm, 'telephoneNo');
    userDto.file = [];
    const password = this.createUserForm.get('password').clearValidators();
    const confirmPassword = this.createUserForm.get('confirmPassword').clearValidators();
    this.createUserForm.patchValue({password, confirmPassword});
    if (this.createUserForm.valid) {
      userDto.id = this.id;
      this.userService.updateUser(userDto).subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.notificationService.successMessage(HttpResponseMessage.USER_UPDATED_SUCCESSFULLY);
          const activeUser = JSON.parse(localStorage.getItem(AppConstant.SESSION_USER_ATTR));
          if (userDto.id === activeUser.id) {
            this.btnLoading = false;
            activeUser.name = userDto.name;
            localStorage.setItem(AppConstant.SESSION_USER_ATTR, JSON.stringify(activeUser));
            this.userService.getUpdatedProfilePicPath.next(userDto);
          }
          if (res?.body?.message) {
            this.notificationService.infoMessage(res.body.message);
          }
          this.btnLoading = false;
          this.createUserForm.reset();
          this.refreshTable.emit('USER_UPDATED');
        } else {
          this.btnLoading = false;
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.btnLoading = false;
        this.notificationService.errorMessage(error);
      });
    } else {
      this.btnLoading = false;
      new CommonUtility().validateForm(this.createUserForm);
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
        this.btnLoading = false;
        if (res?.body?.message) {
          this.notificationService.infoMessage(res.body.message);
        }
        this.refreshTable.emit('USER_UPDATED');
        this.notificationService.successMessage(HttpResponseMessage.USER_CREATED_SUCCESSFULLY);
        this.createUserForm.reset();
        this.emittedTabIndex.emit({tabIndex: 0, visible: true});
      } else {
        this.btnLoading = false;
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.btnLoading = false;
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

  isHidden() {
    return this.privilegeService.isVendor() || this.privilegeService.isSupport();
  }

  /**
   * this method can be used to load all payment types to vendor
   */
  getPaymentDropDownList() {
    this.paymentTypeService.getPaymentDropDownList().subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        this.allPaymentTypeList.data = res.body.filter(item => item.id ===
          this.appConstant.ACH_PAYMENT_TYPE || item.id === AppConstant.CHECK_PAYMENT_TYPE);
        this.setAcceptedPaymentTypeForm();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for get payment Provider list
   */
  getPaymentProviders() {
    this.paymentService.getPaymentProviders().subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.paymentProviders.data = res.body;
        }
      },
      error: err => this.notificationService.errorMessage(err)
    });
  }

  /**
   * This method can be used to validate postal address according to the check payment
   */
  validatePostalAddress(accPaymentTypes) {
    if (!(accPaymentTypes && accPaymentTypes.length)) {
      this.isSelectedPaymentTypeAsCheckAndVirtualCard = false;
    } else {
      const isCheckOrVirtualCardSelected = accPaymentTypes.includes(2) || accPaymentTypes.includes(3);
      this.isSelectedPaymentTypeAsCheckAndVirtualCard = isCheckOrVirtualCardSelected && !this.detailView;
    }
  }

  /**
   * this method can be used to get payment information validate status
   */
  validPaymentInfo() {
    const selectedPaymentTypeIds = this.acceptedPaymentTypes.controls
      .filter(control => control.get('selected').value === true)
      .map(control => control.get('paymentTypeId').value);
    if (selectedPaymentTypeIds === null || selectedPaymentTypeIds?.length === 0) {
      return false;
    }
    return (this.createUserForm.get('recipientFirstName').value === null ||
      this.createUserForm.get('recipientLastName').value === null || this.createUserForm.get('accountNumber').value === null ||
      this.createUserForm.get('accountRoutingNumber').value === null || this.createUserForm.get('acceptedPaymentTypes').value === null);
  }

  ngAfterViewInit(): void {
    this.email.nativeElement.focus();
  }

  /**
   * This method can be used focus the first element after user go to another tab and come again
   */

  focusFirstElementAfterTabChange() {
    this.userService.changeMainTabSet.subscribe(x => {
      if (x && x === AppAnalyticsConstants.CREATE_USER) {
        setTimeout(() => {
          this.email.nativeElement.focus();
        }, 0);
      }
    });
  }


  setAcceptedPaymentTypeForm() {
    for (let i = 0; this.allPaymentTypeList.data.length > i; i++) {
      this.addAcceptedPaymentTypes(this.allPaymentTypeList.data[i]);
    }
  }

  public get acceptedPaymentTypes() {
    return this.createUserForm.get('acceptedPaymentTypes') as UntypedFormArray;
  }

  addAcceptedPaymentTypes(data: any) {
    const addHocWorkflowDetail = this.formBuilder.group({
      selected: [{value: false, disabled: this.detailView}],
      paymentTypeId: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      providerId: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}],
      name: [{value: AppConstant.NULL_VALUE, disabled: this.detailView}]
    });
    addHocWorkflowDetail.get('paymentTypeId').patchValue(data.id);
    addHocWorkflowDetail.get('name').patchValue(data.name);
    addHocWorkflowDetail.get('selected').patchValue(false);
    this.acceptedPaymentTypes.push(addHocWorkflowDetail);
  }

  /**
   * this method can be used to set selected type list
   */

  setPreferredPaymentType() {
    const selectedPaymentTypeIds = this.acceptedPaymentTypes.controls
      .filter(control => control.get('selected').value === true)
      .map(control => control.get('paymentTypeId').value);
    const selectedPaymentTypes = this.acceptedPaymentTypes.controls
      .filter(control => control.get('selected').value === true);
    if (selectedPaymentTypeIds) {
      this.selectedPaymentTypes.data = [];
      for (const type of selectedPaymentTypes) {
        const obj = {id: type.value.paymentTypeId, name: type.value.name};
        this.selectedPaymentTypes.data.push(obj);
      }
    }
    this.commonUtil.onAcceptedPaymentTypesChange(selectedPaymentTypeIds)

    this.validatePostalAddress(selectedPaymentTypeIds);
  }

  acceptedPaymentTypeSelected(data, i: number) {
    this.setPreferredPaymentType();
  }

  getMailOptionStatus(){
    this.paymentService.getPaymentMailOption().subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.paymentMailOption = res.body;
      }
    });
  }

  get fieldValueCheckToBeMail() {
    return (this.createUserForm.get('checkToBeMail'));
  }

  get fieldValueMailOption() {
    return (this.createUserForm.get('mailOption'));
  }

  get fieldValueAccountType() {
    return (this.createUserForm.get('accountType'));
  }

  get fieldValueRecipientType() {
    return (this.createUserForm.get('recipientType'));
  }


}
