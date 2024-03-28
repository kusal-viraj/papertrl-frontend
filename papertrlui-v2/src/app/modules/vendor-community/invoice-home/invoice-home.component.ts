import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {ActivatedRoute, Router} from '@angular/router';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AppTabKey} from '../../../shared/enums/app-tab-key';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {AppConstant} from '../../../shared/utility/app-constant';
import {BillState} from '../../bills/bill-home/bill-home.component';
import {VendorInvoiceService} from '../../../shared/services/vendor-community/vendor-invoice.service';
import {AppEnumConstants} from "../../../shared/enums/app-enum-constants";
import {HttpResponseMessage} from "../../../shared/utility/http-response-message";
import {ItemListComponent} from "../../item/item-list/item-list.component";
import {InvoiceListComponent} from "../invoice-list/invoice-list.component";
import {InvoiceTemplateListComponent} from "../invoice-template-list/invoice-template-list.component";
import {RecurringInvoiceListComponent} from "../recurring-invoice-list/recurring-invoice-list.component";

@Component({
  selector: 'app-invoice-home',
  templateUrl: './invoice-home.component.html',
  styleUrls: ['./invoice-home.component.scss']
})
export class InvoiceHomeComponent implements OnInit, OnDestroy {
  tabIndex: number;
  public state: BillState = new BillState();
  isBillList = false;
  isSubmitBill = false;
  isCreateBill = false;
  isClickCreateEInvoiceButton = false;
  listBillPayment = true;
  uploadBillPayment = false;
  createBillPayment = false;
  isBillsInQueue = false;
  isFirstVisit = false;
  invoiceDetailView = false;
  invoiceId: any;
  tenantId: any;
  invoiceType: any;
  ocrCreate = false;
  recurringInvoice = false;

  @ViewChild('invoiceListComponent') public invoiceListComponent: InvoiceListComponent
  @ViewChild('invoiceTemplateListComponent') public invoiceTemplateListComponent: InvoiceTemplateListComponent
  @ViewChild('recurringInvoiceListComponent') public recurringInvoiceListComponent: RecurringInvoiceListComponent


  public appAuthorities = AppAuthorities;

  constructor(public router: Router, public route: ActivatedRoute, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public vendorInvoiceService: VendorInvoiceService) {
    this.getPendingBillList();
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem(AppTabKey.BILL_TAB_STATE_KEY);
  }

  ngOnInit() {
    this.isBillList = true;

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
      if (params.id && params.status && params.tenantId) {
        this.openScreens(params);
      }
    });
  }

  openScreens(params) {
    if (params.status === AppEnumConstants.STATUS_PENDING) {
      this.invoiceId = parseInt(params.id);
      this.tenantId = params.tenantId;
      this.invoiceDetailView = true;
      return;
    }

    if (params.status === AppEnumConstants.STATUS_DELETED) {
      this.invoiceDetailView = false;
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        this.router.navigate([AppEnumConstants.VENDOR_INVOICE_URL]).then(r => {
          this.notificationService.infoMessage(HttpResponseMessage.INVOICE_DELETED_ALREADY)
        }); // navigate to same route
      });
      return;
    }

    if (params.status === AppEnumConstants.STATUS_REJECT || params.status === AppEnumConstants.STATUS_APPROVED) {
      this.invoiceId = parseInt(params.id);
      this.tenantId = params.tenantId;
      this.invoiceDetailView = true;
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

  /**
   *
   * @param value to emitted value
   */
  emitValue(value) {
    this.isBillList = true;
    this.isCreateBill = false;
    this.isSubmitBill = false;
  }

  /**
   * refresh component
   */
  refreshComponent() {
    // save current route first
    const currentRoute = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentRoute]); // navigate to same route
    });
  }

  toggleOcr(val: string) {
    if (val === 'create') {
      this.ocrCreate = true;
    }
    if (val === 'table') {
      this.ocrCreate = false;
    }
  }

  toggleRecurring(val: string) {
    if (val === 'create') {
      this.recurringInvoice = true;
    }
    if (val === 'table') {
      this.recurringInvoice = false;
    }
  }


  /**
   * get pending bill list
   */
  getPendingBillList() {
    return new Promise<void>(resolve => {
      this.vendorInvoiceService.getSubmitPendingInvoices().subscribe((res: any) => {
        if (res.status === AppConstant.HTTP_RESPONSE_STATUS_SUCCESS) {
          this.isBillsInQueue = (res.body.length) !== 0;
          resolve();
        }
      });
    })
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

  async loadInvoiceSubmitDrawer() {
    await this.getPendingBillList();
  }

  isBillTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.INVOICE_EDIT, AppAuthorities.INVOICE_DETAIL_VIEW,
      AppAuthorities.INVOICE_SEARCH, AppAuthorities.INVOICE_ADD_NOTE, AppAuthorities.INVOICE_DOWNLOAD_INVOICE,
      AppAuthorities.INVOICE_DELETE, AppAuthorities.INVOICE_CSV_EXPORT]);
  }

  isInvoiceModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.INVOICE_EDIT, AppAuthorities.INVOICE_CREATE,
      AppAuthorities.INVOICE_DETAIL_VIEW, AppAuthorities.INVOICE_ADD_NOTE, AppAuthorities.INVOICE_SEARCH, AppAuthorities.INVOICE_DOWNLOAD_INVOICE,
      AppAuthorities.INVOICE_DELETE, AppAuthorities.INVOICE_CSV_EXPORT]);
  }

  isPaymentTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.PAYMENT_SEARCH, AppAuthorities.PAYMENT_ADD_NOTE]);
  }

  isTemplateModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_TEMPLATES_CREATE,
      AppAuthorities.BILL_TEMPLATES_EDIT, AppAuthorities.BILL_TEMPLATES_ACTIVATE,
      AppAuthorities.BILL_TEMPLATES_INACTIVATE, AppAuthorities.BILL_TEMPLATES_DELETE,
      AppAuthorities.BILL_TEMPLATES_DETAIL_VIEW, AppAuthorities.BILL_TEMPLATES_DOWNLOAD]);
  }

  isInvoiceTemplateTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.BILL_TEMPLATES_EDIT,
      AppAuthorities.BILL_TEMPLATES_ACTIVATE, AppAuthorities.BILL_TEMPLATES_INACTIVATE, AppAuthorities.BILL_TEMPLATES_DELETE,
      AppAuthorities.BILL_TEMPLATES_DETAIL_VIEW, AppAuthorities.BILL_TEMPLATES_DOWNLOAD]);
  }

  isRecurringBillModule() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.RECURRING_INVOICES_CREATE,
      AppAuthorities.RECURRING_INVOICES_DETAIL_VIEW, AppAuthorities.RECURRING_INVOICES_ACTIVATE,
      AppAuthorities.RECURRING_INVOICES_INACTIVATE, AppAuthorities.RECURRING_INVOICES_EDIT,
      AppAuthorities.RECURRING_INVOICES_DELETE]);
  }

  isRecurringBillTable() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.RECURRING_INVOICES_DETAIL_VIEW,
      AppAuthorities.RECURRING_INVOICES_ACTIVATE, AppAuthorities.RECURRING_INVOICES_INACTIVATE,
      AppAuthorities.RECURRING_INVOICES_EDIT, AppAuthorities.RECURRING_INVOICES_DELETE]);
  }


  isCreditNoteView(){
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.VENDOR_CREDIT_NOTE_SEARCH,
      AppAuthorities.VENDOR_CREDIT_NOTE_DELETE, AppAuthorities.VENDOR_CREDIT_NOTE_EDIT, AppAuthorities.VENDOR_CREDIT_NOTE_DETAIL_VIEW,
      AppAuthorities.VENDOR_CREDIT_NOTE_CANCEL, AppAuthorities.VENDOR_CREDIT_NOTE_VIEW_ATTACHED_BILLS]);
  }

}
