import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {BillUtility} from '../bill-utility';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {MessageService} from 'primeng/api';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {BillPaymentMasterDto} from '../../../shared/dto/bill-payment/bill-payment-master-dto';
import {AppConstant} from '../../../shared/utility/app-constant';
import {HttpResponseMessage} from '../../../shared/utility/http-response-message';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {DropdownDto} from '../../../shared/dto/common/dropDown/dropdown-dto';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {CreditNoteService} from "../../../shared/services/credit-note/credit-note.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ManageDrawerService} from "../../../shared/services/common/manage-drawer-status/manage-drawer.service";

@Component({
  selector: 'app-change-bill-drawer',
  templateUrl: './change-bill-drawer.component.html',
  styleUrls: ['./change-bill-drawer.component.scss']
})
export class ChangeBillDrawerComponent implements OnInit {
  @Input() vendor;
  @Input() billId;
  @Input() id;
  @Output() refreshTable = new EventEmitter();
  public changeBillPaymentForm: UntypedFormGroup;
  public billPaymentUtility: BillUtility = new BillUtility(this.billPaymentService,
    this.notificationService, this.privilegeService, this.creditNoteService, this.billsService, this.sanitizer, this.drawerService);
  public billPaymentChangeDto: BillPaymentMasterDto = new BillPaymentMasterDto();
  public vendorList: DropdownDto = new DropdownDto();

  constructor(public formBuilder: UntypedFormBuilder, public billPaymentService: BillPaymentService, public notificationService: NotificationService,
              public privilegeService: PrivilegeService, public creditNoteService: CreditNoteService, public billsService: BillsService,
              public sanitizer: DomSanitizer, public drawerService: ManageDrawerService) {
  }

  ngOnInit(): void {
    this.getVendorList(this.vendorList);
    this.changeBillPaymentForm = this.formBuilder.group({
      vendorId: [null, Validators.required],
      billId: [null, Validators.required],
      id: []
    });

  }

  /**
   * This method use for load bills by vendor
   * @param event any
   */
  changedVendorSelection(event: any) {
    if (null !== event.value) {
      this.billPaymentUtility.getVendorRelatedBills(event.value, this.billId);
    } else {
      this.billPaymentUtility.billNumber.data = [];
      this.changeBillPaymentForm.get('billNumber').reset();
    }
  }

  /**
   * This method use for get vendor list for dropdown
   */
  getVendorList(dropDownInstance: DropdownDto) {
    this.billsService.getVendorList(true).subscribe((res: any) => {
      if (AppResponseStatus.STATUS_SUCCESS === res.status) {
        dropDownInstance.data = res.body;
      }
    }, error => {
      this.notificationService.errorMessage(error);
    });
  }

  /**
   * This method use for change payment
   */
  changePayment() {
    this.changeBillPaymentForm.value.id = this.id;
    this.billPaymentChangeDto = this.changeBillPaymentForm.value;
    if (this.changeBillPaymentForm.valid) {
      this.billPaymentService.changeTaggedInvoice(this.billPaymentChangeDto).subscribe((res: any) => {
        if (AppConstant.HTTP_RESPONSE_STATUS_SUCCESS === res.status) {
          this.notificationService.successMessage(HttpResponseMessage.CHECK_UPDATED_SUCCESSFULLY);
          this.refreshTable.emit('PAYMENT_UPDATE');
          this.reset();
        } else {
          this.notificationService.infoMessage(res.body.message);
        }
      }, error => {
        this.notificationService.errorMessage(error);
      });

    } else {
      new CommonUtility().validateForm(this.changeBillPaymentForm);
    }
  }

  /**
   * This method use for reset form
   */
  reset() {
    this.changeBillPaymentForm.reset();
  }

  getInvoiceListByVendor() {
    this.billPaymentUtility.getVendorRelatedBills(this.vendor, this.billId);
  }
}
