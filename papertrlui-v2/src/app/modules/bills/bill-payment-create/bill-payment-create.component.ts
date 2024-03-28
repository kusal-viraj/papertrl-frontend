import {Component, Input} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {BillPaymentService} from '../../../shared/services/bill-payment-service/bill-payment.service';
import {BillPaymentBaseComponent} from '../bill-payment-base/bill-payment-base.component';
import {NotificationService} from '../../../shared/services/notification/notification.service';
import {PrivilegeService} from '../../../shared/services/privilege.service';
import {AdditionalFieldService} from '../../../shared/services/additional-field-service/additional-field-service.';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {CreditNoteService} from "../../../shared/services/credit-note/credit-note.service";
import {BillsService} from "../../../shared/services/bills/bills.service";
import {DomSanitizer} from "@angular/platform-browser";
import {ManageDrawerService} from "../../../shared/services/common/manage-drawer-status/manage-drawer.service";

@Component({
  selector: 'app-bill-payment-create',
  templateUrl: './bill-payment-create.component.html',
  styleUrls: ['./bill-payment-create.component.scss']
})
export class BillPaymentCreateComponent extends BillPaymentBaseComponent {

  public commonUtil = new CommonUtility();

  constructor(public formBuilder: UntypedFormBuilder, public billPaymentService: BillPaymentService,
              public notificationService: NotificationService, public privilegeService: PrivilegeService,
              public additionalFieldService: AdditionalFieldService, public creditNoteService: CreditNoteService,
              public billsService: BillsService, public sanitizer: DomSanitizer, public drawerService: ManageDrawerService) {
    super(formBuilder, notificationService, billPaymentService, privilegeService, additionalFieldService, creditNoteService,
      billsService, sanitizer, drawerService);
  }
}
