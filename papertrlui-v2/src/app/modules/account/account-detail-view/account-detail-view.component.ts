import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AccountService} from '../../../shared/services/accounts/account.service';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {ConfirmationService} from 'primeng/api';
import {DetailViewService} from "../../../shared/helpers/detail-view.service";
import {DynamicDialogConfig} from 'primeng/dynamicdialog';

@Component({
  selector: 'app-account-detail-view',
  templateUrl: './account-detail-view.component.html',
  styleUrls: ['./account-detail-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountDetailViewComponent implements OnInit, OnDestroy {

  @Input() accountID: any;
  @Input() accountStatus: any;
  @Output() closeEditView = new EventEmitter();
  @Output() deleteAccountSuccessEmitter = new EventEmitter();
  accountDetailViewForm: FormGroup;
  public commonUtil = new CommonUtility();
  public appAuthorities = AppAuthorities;
  public isEditAccount = false;

  constructor(public formBuilder: FormBuilder, public accountService: AccountService, public config: DynamicDialogConfig,
              public notificationService: NotificationService, public privilegeService: PrivilegeService,
              public confirmationService: ConfirmationService, private detailViewService: DetailViewService) {
  }

  ngOnInit(): void {
    if (this.config?.data) {
      this.accountID = this.config.data.id;
    }
    this.accountDetailViewForm = this.formBuilder.group({
      accountType: [null],
      accountDetailTypeName: [null],
      number: [null],
      name: [null],
      accountTypeName: [null],
      parentName: [null],
      description: [null],
      purchaseAccountStr: [null],
      expenseAccountStr: [null]
    });
    this.getAccountData();
  }

  /**
   * This method used to get item data
   */
  getAccountData() {
    this.accountService.getAccountDetails(this.accountID).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        res.body.isPurchaseAccount = res.body.isPurchaseAccount === AppEnumConstants.PO_ACCOUNT_STATUS_YES;
        this.accountDetailViewForm.patchValue(res.body);
      } else {
        this.notificationService.errorMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * Return all form controls
   */
  get f() {
    return this.accountDetailViewForm.controls;
  }

  /**
   * This method is used to delete account
   */

  /**
   * delete account
   */
  deleteAccount() {
    if (!this.accountID) {
      return;
    } else {
      this.confirmationService.confirm({
        key: 'deleteAccountFromDetailView',
        message: 'You want to delete the selected account <br><br>' +
          'If you perform this action, any associated accounts will be deleted as well',
        accept: () => {
          this.accountService.deleteAccount(this.accountID).subscribe((res: any) => {
            if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
              this.notificationService.successMessage(HttpResponseMessage.ACCOUNT_DELETED_SUCCESSFULLY);
              this.deleteAccountSuccessEmitter.emit();
              this.closeEditView.emit();
            } else {
              this.notificationService.infoMessage(res.body.message);
            }
          }, error => {
            this.notificationService.errorMessage(error);
          });
        }
      });
    }
  }

  /**
   * This method is used to edit account and closed edit drawer
   */
  editAccount() {
    this.accountService.checkSelectedAccountWhetherCanEdit(this.accountID).subscribe((res: any) => {
      if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
        this.isEditAccount = true;
      } else {
        this.notificationService.infoMessage(res.body.message);
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  close() {
    if (this.config?.data) {
      this.detailViewService.closeAccountsDetailView();
      return;
    }
    this.closeEditView.emit();
  }

  ngOnDestroy(): void {
    this.detailViewService.closeAccountsDetailView();
  }
}
