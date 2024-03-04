import {Component, Input, OnInit} from '@angular/core';
import {CommonUtility} from "../../../shared/utility/common-utility";

@Component({
  selector: 'app-table-payment-type-overlay',
  templateUrl: './table-payment-type-overlay.component.html',
  styleUrls: ['./table-payment-type-overlay.component.scss']
})
export class TablePaymentTypeOverlayComponent implements OnInit {

  @Input() id;
  @Input() data;
  @Input() paymentTypes: any[];

  public commonUtil = new CommonUtility();

  constructor() {
  }

  ngOnInit(): void {
  }

  getPaymentTypes(acceptedPaymentTypeList: any[]) {
    return acceptedPaymentTypeList.map(x => ' ' + x.name + ' (' + x.paymentChannel + ')');
  }

  getPreferredPaymentType(id: any) {
    if (!this.paymentTypes.length){
      return '-';
    }
    return this.paymentTypes.find(x => x.id === id)?.name;
  }
}
