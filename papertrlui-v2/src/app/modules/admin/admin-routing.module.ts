import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminHomeComponent} from './admin-home/admin-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";

const routes: Routes = [
  { path: '', component: AdminHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Admin'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
