import {Component, OnInit, ViewChild} from '@angular/core';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {TransactionListComponent} from '../transaction-list/transaction-list.component';
import {AppDocumentType} from '../../../shared/enums/app-document-type';
import {AppAnalyticsConstants} from '../../../shared/enums/app-analytics-constants';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {PaymentService} from '../../../shared/services/payments/payment.service';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {AppConstant} from '../../../shared/utility/app-constant';
import {ErpConfigDto} from '../../../shared/dto/payment/erp-config-dto';


@Component({
  selector: 'app-payment-home',
  templateUrl: './payment-home.component.html',
  styleUrls: ['./payment-home.component.scss']
})
export class PaymentHomeComponent implements OnInit {

  public tabIndex = 0;
  public createBillPayment = false;
  public processPaymentRequest = false;
  public listBillPayment = true;
  public uploadBillPayment = false;
  public erpConfigRequestPanel = false;
  public appAuthorities = AppAuthorities;
  public menuItems = [];
  public uploadMenuItems = [];
  public erpConfigMenuItems = [];
  public AppAnalyticsConstants = AppAnalyticsConstants;
  public appConstant = AppConstant;
  public documentId: AppDocumentType;
  private activePackageType = AppConstant.PAPERTRL_SYSTEM_USERS;
  public selectedERPConfig: { label: any; id: any } = {
    label: null,
    id: null
  };

  @ViewChild('transactionListComponent') transactionListComponent: TransactionListComponent;

  public activePackage: ErpConfigDto = new ErpConfigDto();

  constructor(public route: ActivatedRoute, public router: Router, public billPaymentService: BillPaymentService,
              public notificationService: NotificationService, public privilegeService: PrivilegeService,
              public paymentService: PaymentService, public formBuilder: UntypedFormBuilder) {
    this.getUserPackageType();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      if (params.tab !== undefined) {
        this.tabChanged(parseInt(params.tab));
      }
      if (params.id && params.status) {
        this.router.navigate([AppEnumConstants.PAYMENT_URL, {tab: 1, id: params.id, status: params.status}]);
      }
    });

    this.menuItems = [
      {
        label: 'Bill/ Expense Payments',
        isProcess: false,
        authorized: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_CREATE),
        command: () => {
          this.toggleBillPayment('cb');
        }
      },
      {
        label: 'Process Payment Requests',
        authorized: true,
        isProcess: true,
        command: () => {
          this.processPaymentRequest = true;
        }
      },
      {
        label: 'Upload Offline Transactions',
        isProcess: false,
        authorized: this.privilegeService.isAuthorized(AppAuthorities.PAYMENT_UPLOAD),
        command: () => {
          this.uploadBillPayment = true;
        }
      },
    ];
    this.uploadMenuItems = [
      {
        label: 'Bills',
        icon: 'fa fa-file-text',
        command: () => {
          this.documentId = AppDocumentType.BILL_PAYMENT;
          this.uploadBillPayment = true;
        }
      },
      {
        label: 'Expenses',
        icon: 'fa fa-usd',
        command: () => {
          this.documentId = AppDocumentType.EXPENSE_PAYMENT;
          this.uploadBillPayment = true;
        }
      }
    ];
  }

  tabChanged(tabIndex: any) {
    this.tabIndex = tabIndex;
  }

  toggleBillPayment(val: string) {
    if (val === 'cb') {
      this.createBillPayment = true;
      this.listBillPayment = false;

    } else if (val === 'ub') {
      this.createBillPayment = false;
      this.listBillPayment = false;
    }
  }

  isBillPaymentTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.PAYMENT_CHANGE_DOCUMENT,
      AppAuthorities.PAYMENT_MARK_AS_MAILED, AppAuthorities.PAYMENT_REVOKE_PAYMENT,
      AppAuthorities.PAYMENT_DETAIL_VIEW, AppAuthorities.PAYMENT_CSV_EXPORT, AppAuthorities.PAYMENT_DOWNLOAD_RECEIPT]);
  }


  /**
   * check the ERP button is disabled
   */
  isErpButtonDisabled() {
    return this.activePackage.isThirdPartySystemPending;
  }

  toggleConnection() {
    if (this.activePackage.thirdPartySystemConnected) {
      this.disconnectQBO();
    } else {
      this.connectQBO();
    }
  }

  /**
   * this method can be used to connect QBO
   */
  connectQBO() {
    this.activePackage.thirdPartySystemConnected = true;
    this.updateActivePackageStatus();
  }

  /**
   * this method can be used to disconnect QBO
   */
  disconnectQBO() {
    this.activePackage.thirdPartySystemConnected = false;
    this.updateActivePackageStatus();
  }

  /**
   * this method can be used to get visible content
   */
  changeAfterSuccess() {
    this.createBillPayment = false;
    this.uploadBillPayment = false;
    this.uploadBillPayment = false;
    this.processPaymentRequest = false;
    this.listBillPayment = true;
  }

  getActionMenuList() {
    return this.menuItems.filter(x => x.authorized && (!x.isProcess || (x.isProcess &&
      (this.activePackage.activePackage == AppConstant.INTEGRATED_PAYABLE_USERS || this.activePackage.activePackage == AppConstant.HYBRID_USERS))));
  }

  userPackageType(type: number) {
    return this.activePackage.activePackage === type;
  }


  getUserPackageType() {
    // Qbo Connected but only integrated
    // const obj = {
    //   activePackage: 2,
    //   thirdPartySystemConfigStatus: 'A',
    //   thirdPartySystemConnected: true,
    //   thirdPartySystemId: 1,
    //   thirdPartySystemName: 'QuickBooks',
    //   thirdPartySystemList: []
    // };
    // // Not Config but only integrated
    // const obj1 = {
    //   activePackage: 2,
    //   thirdPartySystemConfigStatus: 'N',
    //   thirdPartySystemConnected: false,
    //   thirdPartySystemId: null,
    //   thirdPartySystemName: null,
    //   thirdPartySystemList: [
    //     {id: 1, label: 'QuickBooks'},
    //     {id: 2, label: 'Business Central'},
    //     {id: 1, label: 'Zoho Books'},
    //   ]
    // };
    // // Disconnected but only integrated
    // const obj2 = {
    //   activePackage: 2,
    //   thirdPartySystemConfigStatus: 'A',
    //   thirdPartySystemConnected: false,
    //   thirdPartySystemId: 1,
    //   thirdPartySystemName: 'QuickBooks',
    //   thirdPartySystemList: []
    // };
    //
    // // Not Config but both
    // const obj4 = {
    //   activePackage: 3,
    //   thirdPartySystemConfigStatus: 'N',
    //   thirdPartySystemConnected: false,
    //   thirdPartySystemId: null,
    //   thirdPartySystemName: null,
    //   thirdPartySystemList: [
    //     {id: 1, label: 'QuickBooks'},
    //     {id: 2, label: 'Business Central'},
    //     {id: 1, label: 'Zoho Books'},
    //   ]
    // };
    //
    // // Disconnected but both
    // const obj5 = {
    //   activePackage: 3,
    //   thirdPartySystemConfigStatus: 'A',
    //   thirdPartySystemConnected: false,
    //   thirdPartySystemId: 1,
    //   thirdPartySystemName: 'QuickBooks',
    //   thirdPartySystemList: []
    // };
    //
    // // Connected but both
    // const obj6 = {
    //   activePackage: 3,
    //   thirdPartySystemConfigStatus: 'A',
    //   thirdPartySystemConnected: true,
    //   thirdPartySystemId: 1,
    //   thirdPartySystemName: 'QuickBooks',
    //   thirdPartySystemList: []
    // };
    //
    // // Only Payments
    // const obj7 = {
    //   activePackage: 1,
    //   thirdPartySystemConfigStatus: 'N',
    //   thirdPartySystemConnected: false,
    //   thirdPartySystemId: null,
    //   thirdPartySystemName: null,
    //   thirdPartySystemList: []
    // };
    //
    // // Pending Only Integrated
    // const obj8 = {
    //   activePackage: 2,
    //   thirdPartySystemConfigStatus: 'P',
    //   thirdPartySystemConnected: false,
    //   thirdPartySystemId: 1,
    //   thirdPartySystemName: 'QuickBooks',
    //   thirdPartySystemList: [
    //     {id: 1, label: 'QuickBooks'},
    //     {id: 2, label: 'Business Central'},
    //     {id: 1, label: 'Zoho Books'},
    //   ]
    // };
    //
    // this.activePackage = obj6;
    // this.updateActivePackageStatus();
    //
    // if (!this.activePackage.isThirdPartySystemConfig && !this.activePackage.isThirdPartySystemPending && this.activePackage.thirdPartySystemList.length) {
    //   this.activePackage.thirdPartySystemList.forEach(value => {
    //     this.erpConfigMenuItems.push(
    //       {
    //         label: value.label,
    //         id: value.id,
    //         command: (e) => {
    //           this.erpConfigItemClicked(e.item);
    //         }
    //       }
    //     );
    //   });
    // }

    this.paymentService.getSystemPackageInfo().subscribe({
      next: (res: any) => {
        if (AppResponseStatus.STATUS_SUCCESS === res.status) {
          this.activePackage = res.body;
          this.updateActivePackageStatus();

          if (!this.activePackage.isThirdPartySystemConfig && !this.activePackage.isThirdPartySystemPending && this.activePackage.thirdPartySystemList.length) {
            this.activePackage.thirdPartySystemList.forEach(value => {
              this.erpConfigMenuItems.push(
                {
                  label: value.name,
                  id: value.id,
                  command: (e) => {
                    this.erpConfigItemClicked(e.item);
                  }
                }
              );
            });
          }
        }
        // else {
        //   this.notificationService.infoMessage(res.body.message);
        // }
      },
      // error: err => this.notificationService.errorMessage(err)
    });
  }

  updateActivePackageStatus() {
    this.activePackage.isThirdPartySystemConfig = this.activePackage.thirdPartySystemConfigStatus === AppConstant.STATUS_ACTIVE;
    this.activePackage.isThirdPartySystemPending = this.activePackage.thirdPartySystemConfigStatus === AppConstant.STATUS_PENDING;
  }

  integrationPayBtnClicked() {
    this.processPaymentRequest = true;
  }

  erpConfigItemClicked(e) {
    this.selectedERPConfig = {label: e.label, id: e.id};
    this.erpConfigRequestPanel = true;
  }
}
