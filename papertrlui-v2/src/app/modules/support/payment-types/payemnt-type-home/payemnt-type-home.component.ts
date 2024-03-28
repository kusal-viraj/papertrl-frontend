import {Component, OnInit, ViewChild} from '@angular/core';
import {ItemListComponent} from "../../../item/item-list/item-list.component";
import {PaymentTypeListComponent} from "../payment-type-list/payment-type-list.component";

@Component({
  selector: 'app-payemnt-type-home',
  templateUrl: './payemnt-type-home.component.html',
  styleUrls: ['./payemnt-type-home.component.scss']
})
export class PayemntTypeHomeComponent implements OnInit {
  listPayTypes = true;
  createPayType = false ;

  @ViewChild('paymentTypeListComponent') public paymentTypeListComponent: PaymentTypeListComponent;


  constructor() { }

  ngOnInit(): void {
  }

  toggle(tl: string) {
    if (tl === 'pc') {
      this.createPayType = true;
      this.listPayTypes = true;

    } else if (tl === 'pl') {
      this.createPayType = false;
      this.listPayTypes = true;
    }
  }

  refreshTable() {
    this.createPayType = false;
    this.listPayTypes = true;
  }
}
