import {Component, OnInit, ViewChild} from '@angular/core';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {BehaviorSubject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {PaymentService} from '../../../shared/services/payments/payment.service';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {TransactionListComponent} from '../transaction-list/transaction-list.component';
import {AppDocuments} from "../../../shared/enums/app-documents";
import {AppDocumentType} from "../../../shared/enums/app-document-type";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";

@Component({
  selector: 'app-payment-home',
  templateUrl: './payment-home.component.html',
  styleUrls: ['./payment-home.component.scss']
})
export class PaymentHomeComponent implements OnInit {
  public tabIndex = 0;
  public createBillPayment = false;
  public listBillPayment = true;
  public uploadBillPayment = false;
  public appAuthorities = AppAuthorities;
  public menuItems = [];
  public documentId = 0;
  public AppAnalyticsConstants = AppAnalyticsConstants;

  @ViewChild('transactionListComponent') transactionListComponent: TransactionListComponent;


  constructor(public route: ActivatedRoute, public router: Router, public billPaymentService: BillPaymentService,
              public notificationService: NotificationService, public privilegeService: PrivilegeService) {
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
        label: 'Bills',
        icon: 'fa fa-file-text',
        command: () => {
          this.documentId = AppDocumentType.BILL_PAYMENT;
          this.toggleBillPayment('ub');
        }
      },
      {
        label: 'Expenses',
        icon: 'fa fa-usd',
        command: () => {
          this.documentId = AppDocumentType.EXPENSE_PAYMENT;
          this.toggleBillPayment('ub');
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
      this.uploadBillPayment = false;
      this.listBillPayment = false;

    } else if (val === 'ub') {
      this.createBillPayment = false;
      this.uploadBillPayment = true;
      this.listBillPayment = false;

    } else {
      this.createBillPayment = false;
      this.uploadBillPayment = false;
      this.listBillPayment = true;
    }
  }

  isBillPaymentTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.PAYMENT_CHANGE_DOCUMENT,
      AppAuthorities.PAYMENT_MARK_AS_MAILED, AppAuthorities.PAYMENT_REVOKE_PAYMENT,
      AppAuthorities.PAYMENT_DETAIL_VIEW, AppAuthorities.PAYMENT_CSV_EXPORT, AppAuthorities.PAYMENT_DOWNLOAD_RECEIPT]);
  }

  /**
   * this method can be used to get visible content
   */
  changeAfterSuccess() {
    this.createBillPayment = false;
    this.uploadBillPayment = false;
    this.listBillPayment = true;
  }

  refreshOfflinePaymentTableData() {
    this.billPaymentService.offlinePayTableRefresh.next(true);
  }
}
