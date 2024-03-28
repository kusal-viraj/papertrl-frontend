import {Component, OnInit, ViewChild} from '@angular/core';
import {PaymentTypeListComponent} from "../../payment-types/payment-type-list/payment-type-list.component";
import {PaymentProviderListComponent} from "../payment-provider-list/payment-provider-list.component";

@Component({
  selector: 'app-payment-provider-home',
  templateUrl: './payment-provider-home.component.html',
  styleUrls: ['./payment-provider-home.component.scss']
})
export class PaymentProviderHomeComponent implements OnInit {
  listPayProvider = true;
  createPayProvider = false ;

  @ViewChild('paymentProviderListComponent') public paymentProviderListComponent: PaymentProviderListComponent;


  constructor() { }

  ngOnInit(): void {
  }

  toggle(tl: string) {
    if (tl === 'pc') {
      this.createPayProvider = true;
      this.listPayProvider = false;

    } else if (tl === 'pl') {
      this.createPayProvider = false;
      this.listPayProvider = true;
    }
  }

  refreshTable() {
    this.createPayProvider = false;
    this.listPayProvider = true;
  }
}
