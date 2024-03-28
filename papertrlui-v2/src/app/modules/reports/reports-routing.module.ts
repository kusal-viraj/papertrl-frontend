import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainReportsPageComponent} from './main-reports-page/main-reports-page.component';
import {NetworkGuard} from "../../shared/guards/network.guard";


const routes: Routes = [
  { path: '', component: MainReportsPageComponent, canActivate: [NetworkGuard], data: {breadcrumb: 'Reports'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
