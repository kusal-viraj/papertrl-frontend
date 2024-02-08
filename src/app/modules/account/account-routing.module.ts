import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AccountHomeComponent} from './account-home/account-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";


const routes: Routes = [
  { path: '', component: AccountHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Accounts'} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
