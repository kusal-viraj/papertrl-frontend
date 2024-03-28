import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SyncDashboardHomeComponent} from './sync-dashboard-home/sync-dashboard-home.component';
import {NetworkGuard} from "../../shared/guards/network.guard";


const routes: Routes = [{ path: '', component: SyncDashboardHomeComponent, canActivate: [NetworkGuard],
  data: {breadcrumb: 'Sync Dashboard'} }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SyncDashboardRoutingModule { }
