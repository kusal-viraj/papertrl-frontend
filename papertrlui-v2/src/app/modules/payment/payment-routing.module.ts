import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NetworkGuard} from '../../shared/guards/network.guard';
import {PaymentHomeComponent} from './payment-home/payment-home.component';

const routes: Routes = [
  {path: '', component: PaymentHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Payments'}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule {
}
