import {Component, Input, OnInit, Output, EventEmitter, HostListener, ViewChild, AfterViewInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {AccountService} from '../../../shared/services/accounts/account.service';
import {AccountMasterDto} from '../../../shared/dto/account/account-master-dto';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {MessageService} from 'primeng/api';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {ItemUtility} from '../../item/item-utility';
import {ItemService} from '../../../shared/services/items/item.service';
import {AccountUtility} from '../account-utility';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {Dropdown} from 'primeng/dropdown';

@Component({
  selector: 'app-account-create',
  templateUrl: './account-create.component.html',
  styleUrls: ['./account-create.component.scss']
})
export class AccountCreateComponent implements OnInit, AfterViewInit {
  public accountMasterDto: AccountMasterDto = new AccountMasterDto();
  public accountDetailTypes: DropdownDto = new DropdownDto();
  public parentList: DropdownDto = new DropdownDto();
  public createAccountForm: UntypedFormGroup;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public accountUtility: AccountUtility;
  public itemutility: ItemUtility;
  public display: any;
  public loading = false;
  public commonUtil = new CommonUtility();

  @Input() panel;
  @Input() detailView = false;
  @Input() editView: boolean;
  @Input() accountID: any;
  @Output() updatedAccountList = new EventEmitter();
  @Output() emittedTabIndex = new EventEmitter();
  @Output() refreshTable = new EventEmitter();
  @ViewChild('selectedAccType') public selectedItemType: Dropdown;


  constructor(public formBuilder: UntypedFormBuilder, public itemService: ItemService, public notificationService: NotificationService,
              public billsService: BillsService, public gaService: GoogleAnalyticsService,
              public messageService: MessageService, public accountService: AccountService, public privilegeService: PrivilegeService) {

  }

  ngOnInit(): void {
    this.accountUtility = new AccountUtility(this.accountService);
    this.itemutility = new ItemUtility(this.privilegeService, this.itemService, this.messageService, this.notificationService, this.billsService);
    this.initializeFormBuilder();
    this.getAccountData();
    this.getAccountTypes();
  }

  /**
   * this method can be used for initialize form builder
   */
  initializeFormBuilder() {
    this.createAccountForm = this.formBuilder.group({
      accountType: [{value: null, disabled: this.detailView}],
      accountDetailType: [{value: null, disabled: this.detailView}],
      number: [{value: null, disabled: this.detailView}, Validators.required],
      name: [{value: null, disabled: this.detailView}],
      parentAccount: [{value: null, disabled: this.detailView}],
      description: [{value: null, disabled: this.detailView}],
      isPurchaseAccount: [{value: false, disabled: this.detailView}],
      isExpenseAccount: [{value: false, disabled: this.detailView}]
    });
  }

  /**
   * This method used to get item data
   */
  getAccountData() {
    if (this.editView || this.detailView) {
      this.accountService.getAccountDetails(this.accountID).subscribe((res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          res.body.isPurchaseAccount = res.body.isPurchaseAccount === AppEnumConstants.PO_ACCOUNT_STATUS_YES;
          this.createAccountForm.patchValue(res.body);
          this.getParentTypes();
          this.loadAccountDetailTypes(false);
          this.selectedItemType.focus();
          if (res.body.accountDetailType) {
            this.createAccountForm.get('accountDetailType').patchValue(res.body.accountDetailType);
          }
        } else {
          this.notificationService.errorMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }


  /**
   * This method can be used to create account
   * @param createAccountForm to form group instance
   */
  submitAccount(createAccountForm) {
    if (this.editView){
      this.gaService.trackScreenButtonEvent(
        AppAnalyticsConstants.SAVE,
        AppAnalyticsConstants.MODULE_NAME_ACCOUNT,
        AppAnalyticsConstants.SAVE,
        AppAnalyticsConstants.CREATE_SCREEN,
      );
    }else{
      this.gaService.trackScreenButtonEvent(
        AppAnalyticsConstants.CREATE_ACCOUNT,
        AppAnalyticsConstants.MODULE_NAME_ACCOUNT,
        AppAnalyticsConstants.CREATE_ACCOUNT,
        AppAnalyticsConstants.CREATE_SCREEN,
      );
    }
    this.loading = true;
    createAccountForm.isPurchaseAccount ? createAccountForm.isPurchaseAccount = AppEnumConstants.PO_ACCOUNT_STATUS_YES :
      createAccountForm.isPurchaseAccount = AppEnumConstants.PO_ACCOUNT_STATUS_NO;
    this.accountMasterDto = Object.assign(this.accountMasterDto, createAccountForm);
    this.accountMasterDto.id = this.accountID;
    if (this.createAccountForm.valid) {
      if (this.editView) {
        this.updateAccount(this.accountMasterDto);
      } else {
        this.createAccount(this.accountMasterDto);
      }
    } else {
      this.loading = false;
      new CommonUtility().validateForm(this.createAccountForm);
    }
  }

  /**
   * This method can be used to reset user create form
   */
  resetAccountForm() {
    this.gaService.trackScreenButtonEvent(
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.MODULE_NAME_ACCOUNT,
      AppAnalyticsConstants.RESET_BUTTON,
      AppAnalyticsConstants.CREATE_SCREEN,
    );
    this.createAccountForm.reset();
    if (this.editView) {
      this.getAccountData();
    }
  }

  /**
   * This method is use for create new account
   * @param accountDto to accountDto
   */
  createAccount(accountDto) {
    this.accountService.createAccount(accountDto).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_CREATED === res.status) {
        this.loading = false;
        this.notificationService.successMessage(HttpResponseMessage.ACCOUNT_CREATED_SUCCESSFULLY);
        this.getAccountTypes();
        this.updatedAccountList.emit(true);
        this.createAccountForm.reset();
        setTimeout(() => {
          this.emittedTabIndex.emit({tabIndex: 0, visible: true});
        }, 1000);
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
   * This method use for load account detail type
   * @param resetFields to clear the fields when calling from dropdown change
   */
  loadAccountDetailTypes(resetFields) {
    if (resetFields) {
      this.createAccountForm.get('accountDetailType').reset();
      this.createAccountForm.get('parentAccount').reset();
    }
    this.accountMasterDto = Object.assign(this.accountMasterDto, this.createAccountForm.value);
    if (this.accountMasterDto.accountType !== undefined && this.accountMasterDto.accountType !== null) {
      this.accountService.getAccountDetailTypeList(this.accountDetailTypes, this.accountMasterDto.accountType).subscribe((res: any) => {
        this.accountDetailTypes.data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    }
  }

  /**
   * This method use for load parent Accounts
   *
   */
  getParentTypes() {
    this.accountMasterDto = Object.assign(this.accountMasterDto, this.createAccountForm.value);
    if (this.accountMasterDto.accountType !== undefined && this.accountMasterDto.accountType !== null) {

      let id;
      if (this.editView) {
        id = this.accountID;
      } else {
        id = 0;
      }

      this.accountService.getParents(this.accountMasterDto.accountType, id).subscribe((res: any) => {
        this.parentList.data = res.body;
      }, error => {
        this.notificationService.errorMessage(error);
      });
    } else {
      this.parentList = new DropdownDto();
      this.createAccountForm.get('parentAccount').reset();
    }
  }

  /**
   * this method can be used to get account types
   */
  getAccountTypes() {
    this.itemutility = new ItemUtility(this.privilegeService, this.itemService, this.messageService, this.notificationService, this.billsService);
    // this.updatedAccountList.emit(this.itemutility.chartOfAccounts);
  }

  /**
   * this method used to update account
   * @param accountMasterDto to account master dto
   */
  updateAccount(accountMasterDto) {
    this.accountService.updateAccount(accountMasterDto).subscribe((res: any) => {
      if (AppConstant.HTTP_RESPONSE_STATUS_CREATED === res.status) {
        this.loading = false;
        this.notificationService.successMessage(HttpResponseMessage.ACCOUNT_UPDATED_SUCCESSFULLY);
        this.createAccountForm.reset();
        this.refreshTable.emit('ACCOUNT_UPDATED');
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
   * This interface used to focus the first field in initial page
   */
  ngAfterViewInit(): void {
    this.selectedItemType.focus();
  }
}
