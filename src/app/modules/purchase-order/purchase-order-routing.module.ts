import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PoHomeComponent} from './po-home/po-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";


const routes: Routes = [
  { path: '', component: PoHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Purchase Orders'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseOrderRoutingModule { }
