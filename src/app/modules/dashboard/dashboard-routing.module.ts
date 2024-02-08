import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {NetworkGuard} from "../../shared/guards/network.guard";
import {AppMainComponent} from "./app.main.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {PortalDashboardComponent} from "../portal/portal-dashboard/portal-dashboard.component";


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
  {path: 'dashboard', component: DashboardComponent, data: {breadcrumb: 'Dashboard'}},
  // {path: 'portal-dashboard', component: PortalDashboardComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
