import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ItemHomeComponent} from './item-home/item-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";


const routes: Routes = [
  { path: '', component: ItemHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Items'} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemRoutingModule { }
