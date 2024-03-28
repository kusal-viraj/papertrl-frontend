import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AppEnumConstants} from '../../../../shared/enums/app-enum-constants';
import {AppActionLabel} from '../../../../shared/enums/app-action-label';
import {AppIcons} from '../../../../shared/enums/app-icons';
import {FundingAccountService} from '../../../../shared/services/settings/funding-account.service';
import {AppResponseStatus} from '../../../../shared/enums/app-response-status';
import {NotificationService} from '../../../../shared/services/notification/notification.service';
import {ConfirmationService} from 'primeng/api';
import {HttpResponseMessage} from '../../../../shared/utility/http-response-message';
import {AppConstant} from '../../../../shared/utility/app-constant';
import {PrivilegeService} from '../../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../../shared/enums/app-authorities';

@Component({
  selector: 'app-funding-account-home',
  templateUrl: './funding-account-home.component.html',
  styleUrls: ['./funding-account-home.component.scss']
})
export class FundingAccountHomeComponent implements OnInit {

  public actionBtnList: any [] = [];
  public createFundingAccountVisible = false;
  public creditBankAccounts: any [] = [];
  public depositBankAccounts: any [] = [];
  public activeAction: any;
  public isEditView = false;
  public bankAccountId: any;
  public enums = AppEnumConstants;
  public appAuthorities = AppAuthorities;
  public appConstant = AppConstant;
  public actionBtnListAfterFilter: any [] = [];
  public searchValue: any;
  @ViewChild('searchInput') public searchInput: ElementRef;
  public creditPaymentTypes: any [] = [];
  public depositPaymentTypes: any [] = [];

  constructor(public fundingAccountService: FundingAccountService, public notificationService: NotificationService,
              public confirmationService: ConfirmationService, public privilegeService: PrivilegeService) {
  }


  ngOnInit(): void {
    this.getAllBankAccounts();
    this.getActionBtnList();
    this.actionBtnListAfterFilter = this.actionBtnList;
    this.getAccountPaymentTypes(1);
    this.getAccountPaymentTypes(0);
  }

  public getActionBtnList() {
    this.actionBtnList = [
      {
        id: AppConstant.ID_FUNDING_ACCOUNT_EDIT,
        label: AppActionLabel.ACTION_LABEL_EDIT,
        status: this.enums.STATUS_ACTIVE,
        icon: AppIcons.ICON_EDIT,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.FUNDING_ACCOUNT_EDIT),
        command: () => {
          this.isEditView = true;
          this.bankAccountId = this.activeAction.id;
        }
      },
      {
        id: AppConstant.ID_FUNDING_ACCOUNT_INACTIVATE,
        label: AppActionLabel.ACTION_LABEL_INACTIVATE,
        icon: AppIcons.ICON_INACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.FUNDING_ACCOUNT_INACTIVATE),
        command: () => {
          this.activateInactivateFundingAccount(this.activeAction.id, true);
        }
      },
      {
        id: AppConstant.ID_FUNDING_ACCOUNT_ACTIVATE,
        label: AppActionLabel.ACTION_LABEL_ACTIVATE,
        icon: AppIcons.ICON_ACTIVATE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.FUNDING_ACCOUNT_ACTIVATE),
        command: () => {
          this.activateInactivateFundingAccount(this.activeAction.id, false);
        }
      },
      {
        id: AppConstant.ID_FUNDING_ACCOUNT_DELETE,
        label: AppActionLabel.ACTION_LABEL_DELETE,
        icon: AppIcons.ICON_DELETE,
        authCode: this.privilegeService.isAuthorized(AppAuthorities.FUNDING_ACCOUNT_DELETE),
        command: () => {
          this.deleteBankAccount(this.activeAction.id);
        }
      }
    ];

    this.actionBtnList = this.actionBtnList.filter(item => item.authCode);
  }

  /**
   * This method used to set get all bank accounts
   */
  getAllBankAccounts() {
    if (this.searchValue) {
      this.searchBankAccount(this.searchValue, null, null);
      return;
    }

    this.fundingAccountService.searchBankAccounts(null, null, null).subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.creditBankAccounts = res.body.filter(account => account.accountType === '1');
          this.depositBankAccounts = res.body.filter(account => account.accountType === '0');
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
      }
    });
  }

  /**
   * This method used to set Values when action button clicked
   * @param val bank object
   */
  actionButtonClick(val: any) {
    this.activeAction = val;
    this.actionBtnList = this.actionBtnListAfterFilter;

    if (val.status === AppConstant.STATUS_ACTIVE) {
      this.actionBtnList = this.actionBtnListAfterFilter.filter(action => action.id !== AppConstant.ID_FUNDING_ACCOUNT_ACTIVATE);
    } else {
      this.actionBtnList = this.actionBtnListAfterFilter.filter(action => action.id !== AppConstant.ID_FUNDING_ACCOUNT_INACTIVATE
      && action.id !== AppConstant.ID_FUNDING_ACCOUNT_EDIT);
    }
  }

  /**
   * This method used to delete bank account
   * @param bankAccountId bank id
   */
  deleteBankAccount(bankAccountId) {
    this.confirmationService.confirm({
      message: 'You want to delete this Funding Account',
      key: 'dep',
      accept: () => {
        this.fundingAccountService.deleteBankAccount(bankAccountId).subscribe({
          next: (res: any) => {
            if (AppResponseStatus.STATUS_SUCCESS === res.status) {
              this.notificationService.successMessage(HttpResponseMessage.FUNDING_ACCOUNT_DELETED_SUCCESSFULLY);
              this.getAllBankAccounts();
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error: err => {
            this.notificationService.errorMessage(err);
          }
        });
      }
    });
  }

  /**
   * This method used to search bank account
   * @param enteredValues user entered values in search bar
   * @param accountType funding account credit or deposit
   * @param filterValue id of the filtered payment type
   */
  searchBankAccount(enteredValues, accountType, filterValue) {
    if (enteredValues === AppConstant.EMPTY_SPACE) {
      this.searchInput.nativeElement.value = AppConstant.EMPTY_STRING;
      enteredValues = null;
    }

    if (enteredValues === AppConstant.EMPTY_STRING) {
      enteredValues = null;
      this.searchInput.nativeElement.value = null;
    }

    if (enteredValues === null) {
      this.getAllBankAccounts();
    }

    this.fundingAccountService.searchBankAccounts(enteredValues, accountType, filterValue).subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
            this.creditBankAccounts = res.body.filter(account => account.accountType === '1');
            this.depositBankAccounts = res.body.filter(account => account.accountType === '0');
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
      }
    });
  }

  /**
   * This method used to activate/inactivate funding account
   * @param bankAccountId id of the bank account
   * @param isActive current status of the bank account
   */
  activateInactivateFundingAccount(bankAccountId, isActive) {
    this.fundingAccountService.activateInactivateFundingAccount(bankAccountId, isActive).subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          isActive ? this.notificationService.successMessage(HttpResponseMessage.FUNDING_ACCOUNT_INACTIVATED_SUCCESSFULLY)
          : this.notificationService.successMessage(HttpResponseMessage.FUNDING_ACCOUNT_ACTIVATED_SUCCESSFULLY);
          this.getAllBankAccounts();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
      }
    });
  }

  /**
   * This method is used to check edit,delete,mark as default, active, inactive privileges
   */
  checkActionMenuPrivilegesAvailability() {
    return this.privilegeService.isAuthorizedMultiple(
      [this.appAuthorities.FUNDING_ACCOUNT_EDIT, this.appAuthorities.FUNDING_ACCOUNT_DELETE,
        this.appAuthorities.FUNDING_ACCOUNT_ACTIVATE, this.appAuthorities.FUNDING_ACCOUNT_INACTIVATE]);
  }

  /**
   * This method is used to get payment types related to account type
   * @param accountTypeId id of the account type
   */
  getAccountPaymentTypes(accountTypeId) {
    this.fundingAccountService.getPaymentTypesAccountTypeWise(accountTypeId).subscribe({
      next: (res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          switch (accountTypeId) {
            case AppConstant.CREDIT_ACCOUNT:
              this.creditPaymentTypes = res.body.filter(paymentType => paymentType.forOnline);
              break;
            case AppConstant.DEPOSIT_ACCOUNT:
              this.depositPaymentTypes = res.body.filter(paymentType => paymentType.forOnline);
              break;
          }
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error: err => {
        this.notificationService.errorMessage(err);
      }
    });
  }

  /**
   * This method is used to get payment types related to account type
   * @param accountType id of the account type
   * @param filterValue id of the payment type
   */
  searchBankAccountByType(accountType, filterValue) {
      this.fundingAccountService.searchBankAccounts(null, accountType, filterValue).subscribe({
        next: (res: any) => {
          if (AppResponseStatus.STATUS_SUCCESS === res.status) {
            if (accountType === '1') {
              this.creditBankAccounts = res.body.filter(account => account.accountType === '1');
            } else {
              this.depositBankAccounts = res.body.filter(account => account.accountType === '0');
            }
          } else {
            this.notificationService.infoMessage(res.body.message);
          }
        }, error: err => {
          this.notificationService.errorMessage(err);
        }
      });
  }

  /**
   * This method is used to show payment types related to bank account
   * @param bankAccount object of the bank account
   */
  showPaymentTypes(bankAccount: any) {
    const paymentTypes: string[] = [];

    bankAccount.bankPaymentTypes.forEach(account => {
      paymentTypes.push(account.paymentTypeName);
    });

    return paymentTypes.join(', ');
  }

  /**
   * This method is used to show default payment types related to bank account
   * @param bankAccount id of the account type
   * @param tooltip from tooltip or not
   */
  showDefaultPaymentTypes(bankAccount: any, tooltip: boolean) {
    const defaultPaymentTypes: string[] = [];

    bankAccount.bankPaymentTypes.forEach(account => {
      if (account.isDefault) {
        defaultPaymentTypes.push(account.paymentTypeName);
      }
    });

    if (tooltip) {
      return defaultPaymentTypes.join(', ');
    }

    if (defaultPaymentTypes.length > 3) {
      return defaultPaymentTypes.slice(0, 3).join(', ') + ', ...';
    }

    return defaultPaymentTypes.join(', ');
  }

  /**
   * This method is used to get length of default payment types
   * @param bankAccount object of the bank account
   */
  defaultTypesLength(bankAccount: any) {
    const defaultPaymentTypes: string[] = [];

    bankAccount.bankPaymentTypes.forEach(account => {
      if (account.isDefault) {
        defaultPaymentTypes.push(account.paymentTypeName);
      }
    });

    return defaultPaymentTypes.length <= 3;
  }
}
