import {Component, OnInit, ViewChild} from '@angular/core';
import {CustomerInvoiceService} from '../../../shared/services/customer-invoice/customer-invoice.service';
import {AppAuthorities} from '../../../shared/enums/app-authorities';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {CustomerInvoiceListComponent} from '../customer-invoice-list/customer-invoice-list.component';


@Component({
  selector: 'app-customer-invoice-home',
  templateUrl: './customer-invoice-home.component.html',
  styleUrls: ['./customer-invoice-home.component.scss']
})
export class CustomerInvoiceHomeComponent implements OnInit {

  public isCreateInvoice = false;
  public isViewInvoice = true;
  public isUploadInvoice = false;
  public appAuthorities = AppAuthorities;

  @ViewChild('customerInvoiceListComponent') public customerInvoiceListComponent: CustomerInvoiceListComponent;

  constructor(public customerInvoiceService: CustomerInvoiceService,
              public privilegeService: PrivilegeService) {
  }

  ngOnInit(): void {
  }

  /**
   * toggle Views
   * @param val is action
   */
  toggleAction(val) {
    if (val === 'c') {
      this.isCreateInvoice = true;
      this.isViewInvoice = false;
      this.isUploadInvoice = false;

    } else if (val === 'u') {
      this.isCreateInvoice = false;
      this.isViewInvoice = false;
      this.isUploadInvoice = true;
    }
  }


  /**
   * Refresh account table data from another component
   */
  refreshInvoiceList() {
    this.customerInvoiceService.updateTableData.next(true);
  }

  //Privileges

  /**
   * check individual actions for view customer invoice table
   */
  isShowCustomerInvoiceList() {
    return this.privilegeService.isAuthorizedMultiple([AppAuthorities.EDIT_INVOICE, AppAuthorities.DELETE_INVOICE,
      AppAuthorities.VIEW_INVOICE_AUDIT_TRAIL, AppAuthorities.EXPORT_INVOICE_CSV, AppAuthorities.MARK_AS_INVOICE_PAID,
      AppAuthorities.MARK_AS_INVOICE_UNPAID]);
  }


}
