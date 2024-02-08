import {Component, OnInit, Output} from '@angular/core';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {ProjectCodeService} from '../../../shared/services/project-code/project-code.service';
import {ProjectCodeMasterDto} from '../../../shared/dto/project code/project-code-master-dto';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {EventEmitter} from '@angular/core';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AccountSyncService} from '../../../shared/services/sync-dashboard/account-sync.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppAuthorities} from "../../../shared/enums/app-authorities";

@Component({
  selector: 'app-create-new-project-code',
  templateUrl: './create-new-project-code.component.html',
  styleUrls: ['./create-new-project-code.component.scss']
})
export class CreateNewProjectCodeComponent implements OnInit {
  public projectCodeMasterDto: ProjectCodeMasterDto = new ProjectCodeMasterDto();
  createNewCodeForm: UntypedFormGroup;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  @Output() updatedParentCodeList = new EventEmitter();
  @Output() refreshTable = new EventEmitter();
  public loading = false;

  public isAddNewAccount = false;
  public isAddNewUser = false;

  public projectCodes: DropdownDto = new DropdownDto();
  public allUsersList: DropdownDto = new DropdownDto();
  public allAccountsList: DropdownDto = new DropdownDto();


  constructor(public messageService: MessageService, public projectCodeService: ProjectCodeService,
              public notificationService: NotificationService, public formBuilder: UntypedFormBuilder,
              public billsService: BillsService, public privilegeService: PrivilegeService, public accountSyncService: AccountSyncService) {
  }

  ngOnInit(): void {
    this.createNewCodeForm = this.formBuilder.group({
      name: [AppConstant.EMPTY_STRING, Validators.compose([Validators.required, Validators.maxLength(50)])],
      contractValue: [undefined, Validators.compose([Validators.maxLength(20)])],
      parentId: [undefined],
      startDate: [undefined],
      endDate: [undefined],
      projectBudget: [undefined, Validators.compose([Validators.maxLength(20)])],
      description: [AppConstant.EMPTY_STRING],
      userNameList: [null],
      accountIdList: [null]
    });
    this.getProjectCode();
    this.getAccount();
    this.loadUser();
  }

  getProjectCode() {
    this.billsService.getProjectTask(AppConstant.PROJECT_CODE_CATEGORY_ID, true).subscribe((res: any) => {
        this.projectCodes.data = res.body;
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * create new parent code
   */
  createParentAccount() {
    this.loading = true;
    if (this.createNewCodeForm.valid) {
      try {
        this.projectCodeMasterDto.startDateStr = this.createNewCodeForm.get('startDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      } catch (e) {
      }
      try {
        this.projectCodeMasterDto.endDateStr = this.createNewCodeForm.get('endDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      } catch (e) {
      }
      this.projectCodeMasterDto.startDate = null;
      this.projectCodeMasterDto.endDate = null;
      this.projectCodeService.createProjectCode(this.projectCodeMasterDto).subscribe((res: any) => {
          if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
            this.loading = false;
            this.notificationService.successMessage(HttpResponseMessage.CODE_SAVED_SUCCESSFULLY);
            this.restForm();
            this.getUpdatedParentCodes();
            this.refreshTable.emit({table: 'PROJECT_CODE_UPDATED', isRefresh: true});
          } else {
            this.loading = false;
            this.notificationService.infoMessage(res.body.message);
          }
        },
        error => {
          this.loading = false;
          this.notificationService.errorMessage(error);
        });
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.createNewCodeForm);
    }
  }

  /**
   * this method can be used to create a new code
   * @param createNewCodeForm to form group instance
   */
  onSubmit(createNewCodeForm) {
    this.projectCodeMasterDto = Object.assign(this.projectCodeMasterDto, createNewCodeForm.value);
    this.createParentAccount();
  }

  /**
   * this method can be used to reset the project code form
   */
  restForm() {
    this.createNewCodeForm.reset();
    this.validateDate();
  }


  getUpdatedParentCodes() {
    this.getProjectCode();
    this.updatedParentCodeList.emit(this.projectCodes);
  }

  /**
   * Convert Date object to string
   */
  validateEndDate(value) {
    try {
      if (this.createNewCodeForm.get('endDate').value < value) {
        this.createNewCodeForm.get('endDate').reset();
      }
    } catch (e) {
    }

  }

  getMinDate(): Date {
    if (this.createNewCodeForm.get('startDate').value) {
      return this.createNewCodeForm.get('startDate').value;
    }
  }

  validateDate() {
    const startDate = this.createNewCodeForm.get('startDate');
    const endDate = this.createNewCodeForm.get('endDate');

    if (startDate.value && endDate.value) {
      return;
    }
    if (startDate.value && !endDate.value) {
      endDate.reset();
      endDate.clearValidators();
      endDate.setValidators([Validators.required]);
      endDate.updateValueAndValidity();
      return;
    }
    if (endDate.value && !startDate.value) {
      startDate.reset();
      startDate.clearValidators();
      startDate.setValidators([Validators.required]);
      startDate.updateValueAndValidity();
      return;
    }
    if (!startDate.value && !endDate.value) {
      startDate.reset();
      endDate.reset();
      startDate.clearValidators();
      endDate.clearValidators();
      startDate.updateValueAndValidity();
      endDate.updateValueAndValidity();
      return;
    }
  }

  // changes with project user wise mapping


  /**
   * Load account list
   */

  getAccount() {
    this.projectCodeService.getAccountList(true, AppConstant.ZERO).subscribe((res: any) => {
      this.allAccountsList.data = res;
      if (this.privilegeService.isAuthorized(AppAuthorities.ACCOUNTS_CREATE)) {
        this.allAccountsList.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Load account user list
   */

  loadUser() {
    this.projectCodeService.getUserList(true, AppConstant.ZERO).subscribe((res: any) => {
      this.allUsersList.data = res.body;
      if (this.privilegeService.isAuthorized(AppAuthorities.USERS_CREATE)) {
        this.allUsersList.addNew();
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * trigger when user list change
   * @param event to change event
   * @param multiSelect multiselect reference
   */

  async changeUserMultiSelect(event: any, multiSelect) {
    this.isAddNewUser = false;
    let tempIdArray: any [] = [];
    tempIdArray = event.value;
    if (tempIdArray[tempIdArray.length - 1] === 0) {
      const prevUsers = this.createNewCodeForm.get('userNameList').value;
      this.createNewCodeForm.get('userNameList').reset();
      this.isAddNewUser = true;
      setTimeout(() => {
        prevUsers.forEach((value, index) => {
          if (value === 0) {
            prevUsers.splice(index, 1);
          }
          this.createNewCodeForm.get('userNameList').patchValue(prevUsers);
        });
      }, 300);
    }
    this.multiSelectAllSelect(multiSelect, this.createNewCodeForm.get('userNameList').value);
  }

  /**
   * trigger when account list change
   * @param event to change event
   * @param multiSelect multiselect reference
   */

  changeAccountMultiSelect(event: any, multiSelect) {
    this.isAddNewAccount = false;
    let tempIdArray: any [] = [];
    tempIdArray = event.value;
    if (tempIdArray[tempIdArray.length - 1] === 0) {
      const prevAccounts = this.createNewCodeForm.get('accountIdList').value;
      this.createNewCodeForm.get('accountIdList').reset();
      this.isAddNewAccount = true;
      setTimeout(() => {
        prevAccounts.forEach((value, index) => {
          if (value === 0) {
            prevAccounts.splice(index, 1);
          }
          this.createNewCodeForm.get('accountIdList').patchValue(prevAccounts);
        });
      }, 300);
    }
    this.multiSelectAllSelect(multiSelect, this.createNewCodeForm.get('accountIdList').value);
  }

  /**
   * This method can be used to format multiselect values
   * @param multiSelect dropdown reference
   * @param selectedValues selected values
   */

  multiSelectAllSelect(multiSelect: any, selectedValues) {
    if (multiSelect.allChecked) {
      let idArray: number [] = [];
      idArray = selectedValues;
      idArray.forEach((value: number, index: number) => {
        if (idArray[0] === 0) {
          idArray.splice(index, 1);
        }
      });
      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.inactive = true;
        }
      });
    } else if (!multiSelect.allChecked) {
      multiSelect._options.forEach((value) => {
        if (value.id === 0 && value.name === AppConstant.ADD_NEW) {
          value.inactive = false;
        }
      });
    }
  }
}
