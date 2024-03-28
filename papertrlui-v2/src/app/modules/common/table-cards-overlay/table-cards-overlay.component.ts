import {Component, Input, OnInit} from '@angular/core';
import {TableSupportBase} from '../../../shared/utility/table-support-base';
import {CommonUtility} from '../../../shared/utility/common-utility';
import {AppEnumConstants} from '../../../shared/enums/app-enum-constants';
import {AppResponseStatus} from '../../../shared/enums/app-response-status';
import {PaymentService} from '../../../shared/services/payments/payment.service';

@Component({
  selector: 'app-table-cards-overlay',
  templateUrl: './table-cards-overlay.component.html',
  styleUrls: ['./table-cards-overlay.component.scss']
})
export class TableCardsOverlayComponent implements OnInit {

  public cardDto: any;
  public tableSupportBase = new TableSupportBase();
  public commonUtil = new CommonUtility();

  @Input() cardId;

  constructor(public paymentService: PaymentService) {
  }

  ngOnInit(): void {
    if (!this.cardId){
      return;
    }else {
      this.paymentService.getVCardData(this.cardId).subscribe({
        next: (res: any) => {
          if (AppResponseStatus.STATUS_SUCCESS === res.status) {
            this.cardDto = res.body;
          }
        }});
    }
  }


  getStatus(status) {
    switch (status) {
      case AppEnumConstants.PAYMENT_STATUS_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_PAID;
      }
      case AppEnumConstants.PAYMENT_STATUS_NOT_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_NOT_PAID;
      }
      case AppEnumConstants.PAYMENT_STATUS_PARTIALLY_PAID: {
        return AppEnumConstants.PAYMENT_LABEL_PARTIALLY_PAID;
      }
      case AppEnumConstants.PAYMENT_STATUS_PROCESSING: {
        return AppEnumConstants.PAYMENT_LABEL_PROCESSING;
      }
    }
  }
}
