import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {VendorHomeComponent} from './vendor-home/vendor-home.component';
import {VendorInvoiceComponent} from './vendor-invoice/vendor-invoice.component';
import {NetworkGuard} from "../../shared/guards/network.guard";


const routes: Routes = [
  { path: '', component: VendorHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Vendors'}}]
;

@NgModule({
  providers: [VendorHomeComponent],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorRoutingModule { }
