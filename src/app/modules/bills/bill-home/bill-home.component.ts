import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppTabKey} from '../../../shared/enums/app-tab-key';
import {ActivatedRoute, Router} from '@angular/router';
import {BillsService} from '../../../shared/services/bills/bills.service';
import {AppConstant} from '../../../shared/utility/app-constant';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {BehaviorSubject} from 'rxjs';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {TransactionListComponent} from '../../payment/transaction-list/transaction-list.component';
import {BillListComponent} from '../bill-list/bill-list.component';
import {OcrTemplateListComponent} from '../ocr-template-list/ocr-template-list.component';
import {RecurringBillListComponent} from '../recurring-bill-list/recurring-bill-list.component';
import {CommonUtility} from "../../../shared/utility/common-utility";
import {Gtag} from "angular-gtag";
import {AppAnalyticsConstants} from "../../../shared/enums/app-analytics-constants";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics/google-analytics.service";

export class BillState {
  public activeTab?: any;
}


@Component({
  selector: 'app-bill-home',
  templateUrl: './bill-home.component.html',
  styleUrls: ['./bill-home.component.scss']
})
export class BillHomeComponent implements OnInit, OnDestroy {


  constructor(public router: Router, public route: ActivatedRoute, public gaService: GoogleAnalyticsService, public billService: BillsService, public gtag: Gtag,
              public notificationService: NotificationService, public privilegeService: PrivilegeService) {
    this.getPendingBillList();
  }
  public tabIndex: number;
  public state: BillState = new BillState();
  public AppAnalyticsConstants = AppAnalyticsConstants;

  public isBillList = false;
  public isSubmitBill = false;
  public isCreateBill = false;
  public isClickCreateEInvoiceButton = false;
  public isBillsInQueue = false;
  public ocrCreate = false;
  public recurringCreate = false;
  public updateBillSearchGrid = new BehaviorSubject<any>(null);

  public appAuthorities = AppAuthorities;
  public billDetailView = false;
  public billApprove = false;
  public billIdForDetailView: any;
  public isUploadScreen = false;

  @ViewChild('billListComponent') billListComponent: BillListComponent;
  @ViewChild('ocrTemplateListComponent') ocrTemplateListComponent: OcrTemplateListComponent;
  @ViewChild('recurringBillListComponent') recurringBillListComponent: RecurringBillListComponent;

  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTabKey.BILL_TAB_STATE_KEY);
  }

  ngOnInit() {
    this.isBillList = true;
    // this.tabIndex = 0;

    if (sessionStorage.getItem(AppTabKey.BILL_TAB_STATE_KEY)) {
      this.state = JSON.parse(sessionStorage.getItem(AppTabKey.BILL_TAB_STATE_KEY));
      this.tabIndex = this.state.activeTab;
    } else {
      this.tabIndex = 0;
    }
    this.route.params.subscribe(params => {
      if (params.tab !== undefined) {
        this.tabChanged(parseInt(params.tab));
      }

      if (params.id && params.status) {
        this.openScreens(params);
      }
    });
  }

  openScreens(params) {
    if (params.status === AppEnumConstants.STATUS_PENDING) {
      this.billIdForDetailView = parseInt(params.id);
      this.billDetailView = false;
      this.isSubmitBill = false;
      this.billApprove = true;
      return;
    }

    if (params.status === AppEnumConstants.STATUS_DELETED) {
      this.isSubmitBill = false;
      this.billApprove = false;
      this.billDetailView = false;
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([AppEnumConstants.BILL_URL]).then(r => {
          this.notificationService.infoMessage(HttpResponseMessage.BILL_DELETED_ALREADY);
        }); // navigate to same route
      });
      return;
    }

    if (params.status === AppEnumConstants.BILL_SUBMITTED_STATUS_SUBMITTED) {
      this.billApprove = false;
      this.billDetailView = false;
      this.isSubmitBill = true;
      this.notificationService.infoMessage(HttpResponseMessage.BILL_IN_SUBMISSION);
      return;
    }

    if (params.status === AppEnumConstants.STATUS_REJECT || params.status === AppEnumConstants.STATUS_APPROVED) {
      this.billIdForDetailView = parseInt(params.id);
      this.isSubmitBill = false;
      this.billApprove = false;
      this.billDetailView = true;
      return;
    }
  }


  /**
   * store to session storage
   */
  storeSessionStore() {
    this.state.activeTab = this.tabIndex;
    sessionStorage.setItem(AppTabKey.BILL_TAB_STATE_KEY, JSON.stringify(this.state));
  }

  /**
   * this method execute when changed the tab
   * @param tabIndex to tab index
   */
  tabChanged(tabIndex: any) {
    this.tabIndex = tabIndex;
    this.storeSessionStore();
    const actionNames = [
      AppAnalyticsConstants.BILLS_TAB,
      AppAnalyticsConstants.BILLS_TEMPLATES_TAB,
      AppAnalyticsConstants.RECURRING_BILLS_TAB,
      AppAnalyticsConstants.CREDIT_NOTES_TAB
    ];
    const actionName = actionNames[tabIndex] || '';
    this.gaService.trackScreenButtonEvent(
      actionName,
      AppAnalyticsConstants.MODULE_NAME_BILL,
      actionName,
      AppAnalyticsConstants.SCREEN_NAVIGATION
    );
  }

  /**
   * this method trigger when click component button
   * @param identifier to string
   */
  clickComponentButton(identifier) {
    if (identifier === 'bs') {
      this.isSubmitBill = true;
      this.isCreateBill = false;
      this.isBillList = false;
      this.isUploadScreen = (this.isSubmitBill && !this.isBillsInQueue);

    } else if (identifier === 'bc') {
      this.isClickCreateEInvoiceButton = true;
      this.isCreateBill = true;
      this.isSubmitBill = false;
      this.isBillList = false;
    }
    this.storeSessionStore();
  }

  /**
   * get emitted value from create e-invoice component
   * @param value to emit value
   */
  async emittedValue(value) {
    this.isBillList = true;
    this.isClickCreateEInvoiceButton = false;
    this.storeSessionStore();
    this.billService.updateTableData.next(true);
  }

  toggleOcr(val: string) {
    if (val === 'create') {
      this.ocrCreate = true;
    }
    if (val === 'table') {
      this.ocrCreate = false;
      this.billService.updateTableData.next(true);
    }
    if (val === 'recurringCreate') {
      this.ocrCreate = false;
    }
  }

  toggleRecurringBill(val: string) {
    if (val === 'recurringCreate') {
      this.recurringCreate = true;
    }
  }

  /**
   *
   * @param value to emitted value
   */
  emitValue(value) {
    this.isBillList = true;
    this.isCreateBill = false;
    this.isSubmitBill = false;
    this.getPendingBillList();
  }

  /**
   * get pending bill list
   */
  getPendingBillList() {
    return new Promise(resolve => {
      this.billService.getSubmitPendingInvoices().subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isBillsInQueue = (res.body.length) !== 0;
          resolve(this.isBillsInQueue);
        }
      });
    });
  }

  /**
   * after successfully submit the bill
   */
  getBillList() {
    this.tabIndex = 0;
    this.isBillList = true;
    this.isSubmitBill = false;
    this.getPendingBillList();
  }

  async loadBillSubmitDrawer() {
    await this.getPendingBillList();
  }

  isBillTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_EDIT, AppAuthorities.BILL_APPROVE,
      AppAuthorities.BILL_REJECT, AppAuthorities.BILL_QUICK_APPROVE, AppAuthorities.BILL_SKIP_APPROVAL,
      AppAuthorities.BILL_DETAIL_VIEW, AppAuthorities.BILL_VIEW_AUDIT_TRAIL, AppAuthorities.BILL_DOWNLOAD_BILL,
      AppAuthorities.BILL_APPLY_PAYMENT, AppAuthorities.BILL_VIEW_PAYMENTS, AppAuthorities.BILL_DELETE,
      AppAuthorities.BILL_CSV_EXPORT, AppAuthorities.BILL_CHANGE_ASSIGNEE, AppAuthorities.BILL_UNDO_ACTION,
      AppAuthorities.BILL_OVERRIDE_APPROVAL, AppAuthorities.BILL_ACTIVATE, AppAuthorities.BILL_INACTIVATE]);
  }

  isBillModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_EDIT, AppAuthorities.BILL_APPROVE,
      AppAuthorities.BILL_REJECT, AppAuthorities.BILL_QUICK_APPROVE, AppAuthorities.BILL_SKIP_APPROVAL,
      AppAuthorities.BILL_DETAIL_VIEW, AppAuthorities.BILL_VIEW_AUDIT_TRAIL, AppAuthorities.BILL_DOWNLOAD_BILL,
      AppAuthorities.BILL_APPLY_PAYMENT, AppAuthorities.BILL_VIEW_PAYMENTS, AppAuthorities.BILL_DELETE,
      AppAuthorities.BILL_CSV_EXPORT, AppAuthorities.BILL_CHANGE_ASSIGNEE, AppAuthorities.BILL_UNDO_ACTION,
      AppAuthorities.BILL_CREATE, AppAuthorities.BILL_PROCESS, AppAuthorities.BILL_OVERRIDE_APPROVAL,
      AppAuthorities.BILL_SAVE_AS_APPROVED, AppAuthorities.BILL_APPLY_CREDIT_NOTE,
      AppAuthorities.BILL_ACTIVATE, AppAuthorities.BILL_INACTIVATE]);
  }

  isBillPaymentTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.PAYMENT_CHANGE_DOCUMENT,
      AppAuthorities.PAYMENT_MARK_AS_MAILED, AppAuthorities.PAYMENT_REVOKE_PAYMENT,
      AppAuthorities.PAYMENT_DETAIL_VIEW, AppAuthorities.BILL_PAYMENT_VIEW_BILLS,
      AppAuthorities.PAYMENT_CSV_EXPORT, AppAuthorities.PAYMENT_DOWNLOAD_RECEIPT]);
  }

  isBillPaymentModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.PAYMENT_CHANGE_DOCUMENT,
      AppAuthorities.PAYMENT_MARK_AS_MAILED, AppAuthorities.PAYMENT_REVOKE_PAYMENT,
      AppAuthorities.PAYMENT_DETAIL_VIEW, AppAuthorities.BILL_PAYMENT_VIEW_BILLS,
      AppAuthorities.PAYMENT_CSV_EXPORT, AppAuthorities.PAYMENT_DOWNLOAD_RECEIPT,
      AppAuthorities.PAYMENT_CREATE, AppAuthorities.PAYMENT_UPLOAD]);
  }

  isOcrModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_TEMPLATES_CREATE,
      AppAuthorities.BILL_TEMPLATES_EDIT, AppAuthorities.BILL_TEMPLATES_ACTIVATE,
      AppAuthorities.BILL_TEMPLATES_INACTIVATE, AppAuthorities.BILL_TEMPLATES_DELETE,
      AppAuthorities.BILL_TEMPLATES_DETAIL_VIEW, AppAuthorities.BILL_TEMPLATES_DOWNLOAD]);
  }

  isBillOcrTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_TEMPLATES_EDIT,
      AppAuthorities.BILL_TEMPLATES_ACTIVATE, AppAuthorities.BILL_TEMPLATES_INACTIVATE, AppAuthorities.BILL_TEMPLATES_DELETE,
      AppAuthorities.BILL_TEMPLATES_DETAIL_VIEW, AppAuthorities.BILL_TEMPLATES_DOWNLOAD]);
  }

  detailViewClosed() {
    this.router.navigate([AppEnumConstants.BILL_URL]); // navigate to same route
  }

  isRecurringBillModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.RECURRING_BILLS_CREATE,
      AppAuthorities.RECURRING_BILLS_DETAIL_VIEW, AppAuthorities.RECURRING_BILLS_ACTIVATE,
      AppAuthorities.RECURRING_BILLS_INACTIVATE, AppAuthorities.RECURRING_BILLS_EDIT,
      AppAuthorities.RECURRING_BILLS_DELETE]);
  }

  isRecurringBillTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.RECURRING_BILLS_DETAIL_VIEW,
      AppAuthorities.RECURRING_BILLS_ACTIVATE, AppAuthorities.RECURRING_BILLS_INACTIVATE,
      AppAuthorities.RECURRING_BILLS_EDIT, AppAuthorities.RECURRING_BILLS_DELETE]);
  }


  isCreditNoteView() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.CREDIT_NOTE_CREATE, AppAuthorities.CREDIT_NOTE_EDIT,
      AppAuthorities.CREDIT_NOTE_DELETE, AppAuthorities.CREDIT_NOTE_DETAIL_VIEW, AppAuthorities.CREDIT_NOTE_APPLY_TO_BILL,
      AppAuthorities.CREDIT_NOTE_SEARCH]);
  }

  /**
   * trigger when closed the submit bill drawer
   */
  closeBillSubmitDrawer() {
    this.isSubmitBill = false;
    this.isBillList = true;
    this.billService.updateTableData.next(true);
    this.getPendingBillList();
  }
}
