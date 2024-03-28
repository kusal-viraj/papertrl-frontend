import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AccountMasterDto} from '../../../shared/dto/account/account-master-dto';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {RemoveSpace} from '../../../shared/helpers/remove-space';
import {AccountUtility} from '../../account/account-utility';
import {ItemUtility} from '../../item/item-utility';
import {ItemService} from '../../../shared/services/items/item.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {MessageService} from 'primeng/api';
import {AccountService} from '../../../shared/services/accounts/account.service';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {BillsService} from '../../../shared/services/bills/bills.service';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent implements OnInit {
  public accountMasterDto: AccountMasterDto = new AccountMasterDto();
  public accountDetailTypes: DropdownDto = new DropdownDto();
  public parentList: DropdownDto = new DropdownDto();
  public createAccountForm: UntypedFormGroup;
  public removeSpaces: RemoveSpace = new RemoveSpace();
  public accountUtility: AccountUtility = new AccountUtility(this.accountService);
  public itemutility: ItemUtility = new ItemUtility(this.privilegeService, this.itemService, this.messageService, this.notificationService, this.billsService);
  public display: any;

  @Input() panel: boolean;
  @Input() detailView: boolean;
  @Input() editView: boolean;
  @Input() accountID: any;
  @Output() updatedAccountList = new EventEmitter();
  @Output() emittedTabIndex = new EventEmitter();
  @Output() refreshTable = new EventEmitter();
  public loading = false;

  constructor(public formBuilder: UntypedFormBuilder, public itemService: ItemService, public notificationService: NotificationService,
              public billsService: BillsService,
              public messageService: MessageService, public accountService: AccountService, public privilegeService: PrivilegeService) {

  }

  ngOnInit(): void {
    this.createAccountForm = this.formBuilder.group({
      accountType: [{value: null, disabled: this.detailView}, Validators.required],
      accountDetailType: [{value: null, disabled: this.detailView}],
      number: [{value: null, disabled: this.detailView}, Validators.required],
      name: [{value: null, disabled: this.detailView}],
      parentAccount: [{value: null, disabled: this.detailView}],
      isPurchaseAccount: [{value: null, disabled: this.detailView}],
      description: [{value: null, disabled: this.detailView}],
      isExpenseAccount: [{value: false, disabled: this.detailView}]
    });
    this.getAccountData();
    this.getAccountTypes();
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
          this.loadAccountDetailTypes();
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
    this.loading = true;
    createAccountForm.isPurchaseAccount ? createAccountForm.isPurchaseAccount =
      AppEnumConstants.PO_ACCOUNT_STATUS_YES : createAccountForm.isPurchaseAccount = AppEnumConstants.PO_ACCOUNT_STATUS_NO;
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
   */
  loadAccountDetailTypes() {
    this.createAccountForm.get('accountDetailType').reset();
    this.createAccountForm.get('parentAccount').reset();
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
   */
  getParentTypes() {
    this.accountMasterDto = Object.assign(this.accountMasterDto, this.createAccountForm.value);
    if (this.accountMasterDto.accountType !== undefined && this.accountMasterDto.accountType !== null) {
      let id;
      if (this.editView) {
        id = this.accountID
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
    // this.updatedProjectCodeList.emit(this.itemutility.chartOfAccounts);
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
}
