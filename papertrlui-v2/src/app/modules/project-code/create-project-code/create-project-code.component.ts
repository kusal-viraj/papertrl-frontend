import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ProjectCodeService} from '../../../shared/services/project-code/project-code.service';
import {ProjectCodeMasterDto} from '../../../shared/dto/project code/project-code-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {MessageService} from 'primeng/api';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AccountSyncService} from '../../../shared/services/sync-dashboard/account-sync.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppAuthorities} from "../../../shared/enums/app-authorities";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-create-project-code',
  templateUrl: './create-project-code.component.html',
  styleUrls: ['./create-project-code.component.scss']
})
export class CreateProjectCodeComponent implements OnInit, OnChanges {

  public projectCodeForm: UntypedFormGroup;
  public projectCodeMasterDto: ProjectCodeMasterDto = new ProjectCodeMasterDto();
  public removeSpaces: RemoveSpace = new RemoveSpace();

  @Input() isEdit = false;
  @Input() isDetailVIew;
  @Input() panel: boolean;
  @Input() projectCodeID: any;
  @Input() statusChange: any;
  @Output() isRefresh = new EventEmitter();

  public appAuthorities = AppAuthorities;
  public projectCodeId: any;
  public loading = false;
  public selectedBcCompanyList = [];
  public projectCodes: DropdownDto = new DropdownDto();
  public allUsersList: DropdownDto = new DropdownDto();
  public allAccountsList: DropdownDto = new DropdownDto();
  public isAddNewAccount = false;
  public isAddNewUser = false;


  constructor(public formBuilder: UntypedFormBuilder, public projectCodeService: ProjectCodeService,
              public messageService: MessageService, public gaService: GoogleAnalyticsService,
              public notificationService: NotificationService, public accountSyncService: AccountSyncService,
              public privilegeService: PrivilegeService, public billsService: BillsService) {

  }

  ngOnInit(): void {
    this.projectCodeForm = this.formBuilder.group({
      name: [{
        value: null,
        disabled: this.isDetailVIew
      }, Validators.compose([Validators.required, Validators.maxLength(50)])],
      parentId: [{value: null, disabled: this.isDetailVIew}],
      description: [{value: null, disabled: this.isDetailVIew}],
      parentProjectName: [],
      contractValue: [{value: null, disabled: this.isDetailVIew}],
      projectBudget: [{value: null, disabled: this.isDetailVIew}],
      tpCompanyId: [{value: null, disabled: this.isDetailVIew}],
      startDate: [{value: null, disabled: this.isDetailVIew}],
      endDate: [{value: null, disabled: this.isDetailVIew}],
      id: [],
      userNameList: [{value: null, disabled: this.isDetailVIew}],
      accountIdList: [{value: null, disabled: this.isDetailVIew}]
    });

    if ((this.isEdit || this.isDetailVIew) && this.projectCodeID) {
      this.loadUser(this.projectCodeID);
      this.getAccount(this.projectCodeID);
      this.getProjectCodeData();
    } else {
      this.loadUser(0);
      this.getAccount(0);
    }
    if (this.privilegeService.isExusPartner()) {
      this.getCompanyList();
    }
    this.getProjectCode();
  }

  /**
   * This method can be used to get project code data
   */
  getProjectCodeData() {
    this.projectCodeService.getProjectDetails(this.projectCodeID).subscribe((res: any) => {
      if (res.body.startDateStr) {
        res.body.startDate = res.body.startDateStr;
      }
      if (res.body.endDateStr) {
        res.body.endDate = res.body.endDateStr;
      }
      this.projectCodeForm.patchValue(res.body);
      this.projectCodeForm.get('parentProjectName').patchValue(res.body.parentProjectName);
    });
  }

  /**
   * This method can be used to reset the project code form
   */
  restForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_PROJECT_CODE,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    if (this.isEdit || this.isDetailVIew) {
      this.projectCodeForm.reset();
      this.getProjectCodeData();
      this.validateDate();
    } else {
      this.projectCodeForm.reset();
      this.validateDate();
    }
  }

  /**
   * This method can be used to update project code
   * @param projectCodeForm to formGroup Instance
   */
  onSubmit(projectCodeForm) {
    if (!this.isEdit){
      this.gaService.trackScreenButtonEvent(
        AppAnalyticsConstants.SAVE,
        AppAnalyticsConstants.MODULE_NAME_PROJECT_CODE,
        AppAnalyticsConstants.SAVE,
        AppAnalyticsConstants.CREATE_SCREEN,
      );
    }else{
      this.gaService.trackScreenButtonEvent(
        AppAnalyticsConstants.CREATE,
        AppAnalyticsConstants.MODULE_NAME_PROJECT_CODE,
        AppAnalyticsConstants.CREATE,
        AppAnalyticsConstants.CREATE_SCREEN,
      );
    }
    this.loading = true;
    this.projectCodeMasterDto = Object.assign(this.projectCodeMasterDto, projectCodeForm);
    if (this.projectCodeForm.valid) {
      try {
        this.projectCodeMasterDto.startDateStr = this.projectCodeForm.get('startDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      } catch (e) {
        this.projectCodeMasterDto.startDateStr = this.projectCodeForm.get('startDate').value;
      }
      try {
        this.projectCodeMasterDto.endDateStr = this.projectCodeForm.get('endDate').value.toLocaleDateString(AppConstant.LOCAL_PRAM_US_ENGLISH);
      } catch (e) {
        this.projectCodeMasterDto.endDateStr = this.projectCodeForm.get('endDate').value;
      }
      this.projectCodeMasterDto.startDate = null;
      this.projectCodeMasterDto.endDate = null;
      if (this.isEdit) {
        this.editProjectCode(this.projectCodeMasterDto);
      } else {
        this.createProjectCode(this.projectCodeMasterDto);
      }
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.projectCodeForm);
    }
  }

  getProjectCode() {
    this.billsService.getProjectTask(AppConstant.PROJECT_CODE_CATEGORY_ID, !this.isEdit).subscribe((res: any) => {
        this.projectCodes.data = res.body;
      },
      error => {
        this.notificationService.errorMessage(error);
      });
  }

  /**
   * this method can be used to create new user
   */
  createProjectCode(projectCodeMstDto) {
    this.projectCodeService.createProjectCode(projectCodeMstDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CODE_SAVED_SUCCESSFULLY);
        this.loading = false;
        this.restForm();
        this.isRefresh.emit();
        this.updateDropDowns();
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
   * this method can be used to create new user
   */
  editProjectCode(projectCodeMstDto) {
    this.projectCodeService.updateApprovalCode(projectCodeMstDto).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.notificationService.successMessage(HttpResponseMessage.CODE_UPDATED_SUCCESSFULLY);
        this.loading = false;
        this.isRefresh.emit();
        this.updateDropDowns();
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
   * get refreshTable data
   * @param value to emitted value
   */
  isRefreshTable(value) {
    if (value.table === 'PROJECT_CODE_UPDATED') {
      this.isRefresh.emit(true);
    }
  }


  updateDropDowns() {
    this.getProjectCode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.statusChange && changes.statusChange.currentValue === 'UPDATED') {
      this.getProjectCode();
    }
  }


  getCompanyList() {
    this.accountSyncService.getSelectedCompanyList(AppConstant.SYSTEM_BUISNESS_CENTRAL_CLOUD).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.selectedBcCompanyList = res.body;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Convert Date object to string
   */
  validateEndDate(value) {
    try {
      if (this.isEdit) {
        const endDate = new Date(this.projectCodeForm.get('endDate').value);
        if (endDate < value) {
          this.projectCodeForm.get('endDate').reset();
        }
      } else {
        if (this.projectCodeForm.get('endDate').value < value) {
          this.projectCodeForm.get('endDate').reset();
        }
      }
    } catch (e) {
    }
  }

  validateDate() {
    const startDate = this.projectCodeForm.get('startDate');
    const endDate = this.projectCodeForm.get('endDate');

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

  getMinDate(): Date {
    if (this.projectCodeForm.get('startDate').value) {
      if (this.isEdit) {
        return new Date(this.projectCodeForm.get('startDate').value);
      } else {
        return this.projectCodeForm.get('startDate').value;
      }
    }
  }

  // changes with project user wise mapping

  /**
   * Load account list
   */

  getAccount(projectCodeId) {
    projectCodeId = (projectCodeId === undefined || projectCodeId === null) ? 0 : projectCodeId;
    this.projectCodeService.getAccountList(!this.isEdit, projectCodeId).subscribe((res: any) => {
      this.allAccountsList.data = res;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }


  /**
   * Load user list
   */

  loadUser(projectCodeId) {
    projectCodeId = (projectCodeId === undefined || projectCodeId === null) ? 0 : projectCodeId;
    this.projectCodeService.getUserList(!this.isEdit, projectCodeId).subscribe((res: any) => {
      this.allUsersList.data = res.body;
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * trigger when user list change
   * @param event to change event
   * @param multiSelect multiselect reference
   */

  changeUserMultiSelect(event: any, multiSelect) {
    this.isAddNewUser = false;
    let tempIdArray: any [] = [];
    tempIdArray = event.value;
    if (tempIdArray[tempIdArray.length - 1] === 0) {
      const prevUsers = this.projectCodeForm.get('userNameList').value;
      this.projectCodeForm.get('userNameList').reset();
      this.isAddNewUser = true;
      setTimeout(() => {
        prevUsers.forEach((value, index) => {
          if (value === 0) {
            prevUsers.splice(index, 1);
          }
          this.projectCodeForm.get('userNameList').patchValue(prevUsers);
        });
      }, 300);

    }
    this.multiSelectAllSelect(multiSelect, this.projectCodeForm.get('userNameList').value);
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
      const prevAccounts = this.projectCodeForm.get('accountIdList').value;
      this.projectCodeForm.get('accountIdList').reset();
      this.isAddNewAccount = true;
      setTimeout(() => {
        prevAccounts.forEach((value, index) => {
          if (value === 0) {
            prevAccounts.splice(index, 1);
          }
          this.projectCodeForm.get('accountIdList').patchValue(prevAccounts);
        });
      }, 300);
    }
    this.multiSelectAllSelect(multiSelect, this.projectCodeForm.get('accountIdList').value);
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
}
