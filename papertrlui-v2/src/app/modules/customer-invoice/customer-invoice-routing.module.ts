import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CustomerInvoiceHomeComponent} from './customer-invoice-home/customer-invoice-home.component';

const routes: Routes = [{ path: '', component: CustomerInvoiceHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerInvoiceRoutingModule { }
