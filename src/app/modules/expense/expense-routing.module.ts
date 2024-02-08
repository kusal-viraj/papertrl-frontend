import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ExpenseHomeComponent} from './expense-home/expense-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";


const routes: Routes = [
  { path: '', component: ExpenseHomeComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Expenses'} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpenseRoutingModule { }
