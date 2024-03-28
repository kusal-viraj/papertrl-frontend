import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {VendorDashboardComponent} from './vendor-dashboard/vendor-dashboard.component';
import {VendorProfileComponent} from './vendor-profile/vendor-profile.component';
import {InvoiceHomeComponent} from './invoice-home/invoice-home.component';
import {CustomerComponent} from './customer/customer.component';
import {AdminHomeComponent} from '../admin/admin-home/admin-home.component';
import {PurchaseOrdersComponent} from './purchase-orders/purchase-orders.component';
import {NetworkGuard} from "../../shared/guards/network.guard";
import {DigitalCardsComponent} from "./digital-cards/digital-cards.component";

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
  {
    path: 'dashboard',
    data: {breadcrumb: 'Dashboard'},
    canActivate: [NetworkGuard],
    component: VendorDashboardComponent
  },
  {path: 'admin', data: {breadcrumb: 'Admin'}, canActivate: [NetworkGuard], component: AdminHomeComponent},
  {
    path: 'profile',
    data: {breadcrumb: 'Profile'},
    canActivate: [NetworkGuard],
    component: VendorProfileComponent
  },
  {path: 'invoices', data: {breadcrumb: 'Invoices'}, canActivate: [NetworkGuard], component: InvoiceHomeComponent},
  {path: 'customers', data: {breadcrumb: 'Customers'}, canActivate: [NetworkGuard], component: CustomerComponent},
  {
    path: 'purchase-orders',
    data: {breadcrumb: 'Purchase Orders'},
    canActivate: [NetworkGuard],
    component: PurchaseOrdersComponent
  },
  {
    path: 'digital-card',
    data: {breadcrumb: 'Digital Cards'},
    canActivate: [NetworkGuard],
    component: DigitalCardsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorCommunityRoutingModule {
}
