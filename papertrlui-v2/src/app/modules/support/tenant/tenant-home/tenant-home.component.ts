import {Component, OnInit, ViewChild} from '@angular/core';
import {
  PaymentProviderListComponent
} from "../../payment-providers/payment-provider-list/payment-provider-list.component";
import {TenantListComponent} from "../tenant-list/tenant-list.component";

@Component({
  selector: 'app-tenant-home',
  templateUrl: './tenant-home.component.html',
  styleUrls: ['./tenant-home.component.scss']
})
export class TenantHomeComponent implements OnInit {
  listTenant = true;
  createTenant = false ;

  @ViewChild('tenantListComponent') public tenantListComponent: TenantListComponent;


  constructor() { }

  ngOnInit(): void {
  }

  toggle(tl: string) {
    if (tl === 'tc') {
      this.createTenant = true;
      this.listTenant = false;

    } else if (tl === 'tl') {
      this.createTenant = false;
      this.listTenant = true;
    }
  }

  refreshTable() {
    this.createTenant = false;
    this.listTenant = true;
  }
}
