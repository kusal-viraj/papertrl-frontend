import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {BillHomeComponent} from './bill-home/bill-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";

const routes: Routes = [
  {path: '', component: BillHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Bills'}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillsRoutingModule {
}
